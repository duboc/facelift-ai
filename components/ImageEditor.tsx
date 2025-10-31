
import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { UploadIcon, MagicIcon, SpinnerIcon } from './icons';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
    });
};

const ImageEditor: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setResultImage(null);
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
        setResultImage(null);
        setError(null);

        try {
            const base64Data = await fileToBase64(imageFile);
            const generatedImage = await editImage(base64Data, imageFile.type, prompt);
            setResultImage(generatedImage);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, prompt]);

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">
                        1. Upload Image
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                            <div className="flex text-sm text-gray-400">
                                <label
                                    htmlFor="image-upload"
                                    className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500"
                                >
                                    <span>Upload a file</span>
                                    <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">
                        2. Describe Your Edit
                    </label>
                    <textarea
                        id="prompt"
                        name="prompt"
                        rows={3}
                        className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white placeholder-gray-400"
                        placeholder="e.g., Add a retro filter, make it look like a watercolor painting..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !imageFile || !prompt.trim()}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
                >
                    {isLoading ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <MagicIcon className="w-5 h-5 mr-2" />}
                    {isLoading ? 'Generating...' : 'Apply Facelift'}
                </button>
            </form>

            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">Original</h3>
                    <div className="aspect-square bg-gray-700/50 rounded-lg flex items-center justify-center">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Original" className="max-h-full max-w-full rounded-lg object-contain" />
                        ) : <p className="text-gray-500">Your image will appear here</p>}
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">Edited</h3>
                    <div className="aspect-square bg-gray-700/50 rounded-lg flex items-center justify-center">
                        {isLoading && <SpinnerIcon className="w-10 h-10 text-indigo-400" />}
                        {!isLoading && resultImage && (
                            <img src={resultImage} alt="Generated" className="max-h-full max-w-full rounded-lg object-contain" />
                        )}
                        {!isLoading && !resultImage && <p className="text-gray-500">Your edited image will appear here</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
