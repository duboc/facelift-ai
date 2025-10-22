
import React, { useState, useCallback } from 'react';
import { generateImageFromImage, generateVideo } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import ApiKeySelector from './ApiKeySelector';
import { UploadIcon, VideoCameraIcon } from './icons';
import type { AspectRatio } from '../types';

const VIDEO_PROMPTS = {
    step1_image: `Reimagine esse homem com um borracheiro em sua borracheira tradicional, suja e antiga. Pneus a seu fundo, ele mesmo está sujo. Ao fundo, pode-se ver um poster da Rita Cadilac na parede, uma banheira branca (e suja) ao fundo, um rádio antigo (toca-fitas) a seu dispor e uma tV antiga, de tubo, mostrando um programa com o logo "BDGC" nas cores do Google.`,
    step2_video: `anime essa foto. o borracheiro começa a dançar românticamente, de forma lenta. o rádio está tocando Roberto Carlos, o cantor romântico brasileiro, uma canção bem romântica.`,
};

const VideoGeneratorCore: React.FC<{ isKeyReady: boolean }> = ({ isKeyReady }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setError(null);
    setIsLoading(false);
    setLoadingMessage('');
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      resetState();
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onProgress = (message: string) => {
    setLoadingMessage(message);
  }

  const handleGenerate = useCallback(async () => {
    if (!imageFile || !isKeyReady) {
      setError('Please upload an image and ensure your API key is selected.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);

    try {
      // Step 1: Generate image from the initial image
      onProgress('Step 1/2: Reimagining scene...');
      const imageResultBase64 = await generateImageFromImage(imageFile, VIDEO_PROMPTS.step1_image);
      setGeneratedImage(imageResultBase64);

      // Convert base64 back to file for video generation
      const imageBlob = await (await fetch(imageResultBase64)).blob();
      const intermediateFile = new File([imageBlob], "generated-scene.png", { type: imageBlob.type });

      // Step 2: Generate video from the new image
      onProgress('Step 2/2: Animating scene...');
      const videoUrl = await generateVideo(intermediateFile, VIDEO_PROMPTS.step2_video, aspectRatio, onProgress);
      setGeneratedVideo(videoUrl);

    } catch (e) {
      if (e instanceof Error && e.message === "API_KEY_ERROR") {
        setError("API Key error. Please try selecting your key again.");
        // Here you could trigger a re-selection flow if you manage ApiKeySelector's state here
      } else {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }

  }, [imageFile, aspectRatio, isKeyReady]);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-surface rounded-2xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-3xl font-bold text-center text-primary">Video Generator</h2>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">1. Upload Starting Image</label>
             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Upload preview" className="mx-auto h-40 w-auto rounded-md" />
                    ) : (
                        <>
                        <UploadIcon className="mx-auto h-12 w-12 text-text-secondary" />
                        <p className="text-sm text-text-secondary">Start with an image</p>
                        </>
                    )}
                    <div className="flex text-sm text-text-secondary justify-center">
                        <label htmlFor="video-file-upload" className="relative cursor-pointer bg-surface rounded-md font-medium text-primary hover:text-primary-hover">
                        <span>Upload a file</span>
                        <input id="video-file-upload" name="video-file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">2. Select Aspect Ratio</label>
            <div className="flex space-x-4">
              {(['16:9', '9:16'] as AspectRatio[]).map(ratio => (
                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 p-3 rounded-md border-2 transition ${aspectRatio === ratio ? 'border-primary bg-primary/20' : 'border-secondary hover:border-primary/50'}`}>
                  {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !imageFile || !isKeyReady}
            className="w-full flex justify-center items-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-hover disabled:bg-secondary disabled:cursor-not-allowed transition-transform transform active:scale-95"
          >
            <VideoCameraIcon className="w-5 h-5" />
            {isLoading ? 'Generating...' : 'Generate Video'}
          </button>
          {error && <p className="text-red-400 text-center">{error}</p>}
        </div>

        {/* Results */}
        <div className="bg-brand-bg p-4 rounded-lg flex flex-col items-center justify-center min-h-[400px]">
          {isLoading ? (
            <LoadingSpinner message={loadingMessage} />
          ) : (
            <div className="w-full space-y-4">
              {generatedVideo ? (
                <div>
                  <h3 className="text-2xl font-bold text-center mb-4">Generated Video</h3>
                  <video src={generatedVideo} controls autoPlay loop className="w-full rounded-md shadow-lg" />
                </div>
              ) : generatedImage ? (
                <div>
                  <h3 className="text-2xl font-bold text-center mb-4">Generated Scene</h3>
                  <img src={generatedImage} alt="Generated scene" className="w-full rounded-md shadow-lg" />
                  <p className="text-center text-text-secondary mt-2">Next step: Animating this scene...</p>
                </div>
              ) : (
                <div className="text-center text-text-secondary">
                  <VideoCameraIcon className="mx-auto h-16 w-16 opacity-50" />
                  <p className="mt-4">Your generated video will appear here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const VideoGenerator: React.FC = () => (
    <ApiKeySelector>
      {(isKeyReady) => <VideoGeneratorCore isKeyReady={isKeyReady} />}
    </ApiKeySelector>
);

export default VideoGenerator;
