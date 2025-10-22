import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio } from '../types';

// Fix: Removed conflicting global declaration for `window.aistudio` to resolve TypeScript errors.
// This declaration was conflicting with another one present in the project.

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const editImage = async (imageFile: File, prompt: string): Promise<string> => {
  const ai = getAiClient();
  const imagePart = await fileToGenerativePart(imageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart, { text: prompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const firstPart = response.candidates?.[0]?.content?.parts[0];
  if (firstPart && firstPart.inlineData) {
    return `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`;
  }

  throw new Error("Could not edit image or invalid response.");
};

export const generateImageFromImage = async (imageFile: File, prompt: string): Promise<string> => {
  return editImage(imageFile, prompt); // The mechanism is identical to editing
};


export const generateVideo = async (
  imageFile: File, 
  prompt: string, 
  aspectRatio: AspectRatio,
  onProgress: (message: string) => void
): Promise<string> => {
  onProgress('Initializing video generation...');
  const ai = getAiClient();
  const imageBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(imageFile);
  });
  
  onProgress('Starting video generation task... This may take several minutes.');
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: imageBase64,
      mimeType: imageFile.type,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });

  onProgress('Polling for video status...');
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
        const currentAiClient = getAiClient(); // Re-create client in case key changed
        operation = await currentAiClient.operations.getVideosOperation({operation: operation});
    } catch (e) {
        if (e instanceof Error && e.message.includes("Requested entity was not found.")) {
            throw new Error("API_KEY_ERROR");
        }
        throw e; // Re-throw other errors
    }
    onProgress('Still processing... Please be patient.');
  }
  
  onProgress('Video generated! Fetching video data...');
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation succeeded but no download link was found.');
  }
  
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
      throw new Error('Failed to download the generated video.');
  }

  const videoBlob = await videoResponse.blob();
  const videoUrl = URL.createObjectURL(videoBlob);
  onProgress('Video ready!');
  return videoUrl;
};
