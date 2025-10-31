
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateVideo } from '../services/geminiService';
import ApiKeySelector from './ApiKeySelector';
import { UploadIcon, VideoIcon, SpinnerIcon } from './icons';

type AspectRatio = '16:9' | '9:16';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

const loadingMessages = [
    "Warming up the AI director...",
    "Scouting for digital locations...",
    "Casting pixels for their roles...",
    "The digital cameras are rolling...",
    "Rendering the final cut...",
    "This might take a few minutes...",
    "Almost there, adding finishing touches...",
];

const VideoGenerator: React.FC = () => {
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('An epic cinematic shot');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const messageIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeyReady(hasKey);
            }
        };
        checkKey();
    }, []);

    useEffect(() => {
        if (isLoading) {
            let i = 0;
            messageIntervalRef.current = window.setInterval(() => {
                i = (i + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[i]);
            }, 5000);
        } else {
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
            }
        }
        return () => {
            if (messageIntervalRef.current) {
                clearInterval(messageIntervalRef.current);
            }
        };
    }, [isLoading]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setResultVideoUrl(null);
            setError(null);
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile || !prompt.trim()) {
            setError('Please upload an image and provide a prompt.');
            return;
        }

        setIsLoading(true);
        setResultVideoUrl(null);
        setError(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            const base64Data = await fileToBase64(imageFile);
            const generatedVideoUrl = await generateVideo(base64Data, imageFile.type, prompt, aspectRatio);
            setResultVideoUrl(generatedVideoUrl);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
            setError(errorMessage);
            if (errorMessage.includes('Requested entity was not found') || errorMessage.includes('API key not valid')) {
                setError("Your API key is invalid or missing billing info. Please select a valid key.");
                setApiKeyReady(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt, aspectRatio]);

    if (!apiKeyReady) {
        return <ApiKeySelector onKeySelected={() => setApiKeyReady(true)} />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side: Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="video-image-upload" className="block text-sm font-medium text-gray-300 mb-2">1. Upload a Starting Image</label>
                     <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {imagePreview ?
                                <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" /> :
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                            }
                            <div className="flex text-sm text-gray-400">
                                <label htmlFor="video-image-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none">
                                    <span>{imageFile ? 'Change image' : 'Upload an image'}</span>
                                    <input id="video-image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">{imageFile ? imageFile.name : 'PNG, JPG, etc.'}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300">2. Describe the Video Scene</label>
                    <textarea id="video-prompt" name="prompt" rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400" placeholder="e.g., A car driving through a neon-lit city at night..." value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isLoading}/>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300">3. Select Aspect Ratio</label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                            <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)} disabled={isLoading}
                                className={`py-2 px-4 rounded-md text-sm font-semibold transition-colors ${aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                                {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                            </button>
                        ))}
                    </div>
                </div>
                
                <button type="submit" disabled={isLoading || !imageFile || !prompt.trim()} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
                    {isLoading ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <VideoIcon className="w-5 h-5 mr-2" />}
                    {isLoading ? 'Generating Video...' : 'Generate Video'}
                </button>
            </form>
            
            {/* Right side: Output */}
            <div className="flex flex-col items-center justify-center bg-gray-700/50 rounded-lg p-4 min-h-[300px] lg:min-h-full">
                {error && !isLoading && <div className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm text-center">{error}</div>}
                
                {isLoading && (
                    <div className="text-center">
                        <SpinnerIcon className="w-10 h-10 text-indigo-400 mx-auto" />
                        <p className="mt-4 text-lg font-medium">{loadingMessage}</p>
                        <p className="text-gray-400 text-sm mt-1">Video generation can take several minutes.</p>
                    </div>
                )}

                {!isLoading && resultVideoUrl && (
                    <div className="w-full">
                        <h3 className="text-lg font-semibold mb-2 text-center">Generated Video</h3>
                        <video src={resultVideoUrl} controls autoPlay loop className="w-full rounded-lg" />
                    </div>
                )}
                
                {!isLoading && !resultVideoUrl && !error && (
                    <div className="text-center text-gray-500">
                        <VideoIcon className="w-16 h-16 mx-auto" />
                        <p className="mt-2">Your generated video will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default VideoGenerator;
