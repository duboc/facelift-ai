
import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { UploadIcon, MagicWandIcon, PhotoIcon } from './icons';

const ImageEditor: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setOriginalImagePreview(URL.createObjectURL(file));
      setGeneratedImage(null);
      setError(null);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!imageFile || !prompt) {
      setError('Please upload an image and provide a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const result = await editImage(imageFile, prompt);
      setGeneratedImage(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, prompt]);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-surface rounded-2xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-3xl font-bold text-center text-primary">Image Editor</h2>
          
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-text-secondary mb-2">1. Upload Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {originalImagePreview ? (
                  <img src={originalImagePreview} alt="Original preview" className="mx-auto h-40 w-auto rounded-md" />
                ) : (
                  <>
                    <UploadIcon className="mx-auto h-12 w-12 text-text-secondary" />
                    <p className="text-sm text-text-secondary">Drag and drop or click to upload</p>
                  </>
                )}
                <div className="flex text-sm text-text-secondary justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-surface rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-surface focus-within:ring-primary">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-text-secondary mb-2">2. Describe Your Edit</label>
            <textarea
              id="prompt"
              rows={4}
              className="w-full bg-brand-bg border border-secondary rounded-md p-3 focus:ring-primary focus:border-primary transition"
              placeholder="e.g., Add a retro filter"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !imageFile || !prompt}
            className="w-full flex justify-center items-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-hover disabled:bg-secondary disabled:cursor-not-allowed transition-transform transform active:scale-95"
          >
            <MagicWandIcon className="w-5 h-5" />
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
          {error && <p className="text-red-400 text-center">{error}</p>}
        </div>

        {/* Output Section */}
        <div className="flex flex-col items-center justify-center bg-brand-bg p-6 rounded-lg min-h-[400px]">
          {isLoading ? (
            <LoadingSpinner message="Editing your image..." />
          ) : generatedImage ? (
            <div className="w-full">
              <h3 className="text-2xl font-bold text-center mb-4">Result</h3>
              <img src={generatedImage} alt="Generated" className="w-full h-auto object-contain rounded-md shadow-lg" />
            </div>
          ) : (
             <div className="text-center text-text-secondary">
               <PhotoIcon className="mx-auto h-16 w-16 opacity-50"/>
               <p className="mt-4">Your generated image will appear here.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
