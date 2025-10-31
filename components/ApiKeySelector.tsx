
import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Optimistically assume the user selected a key. The parent component will handle API errors.
        onKeySelected();
      } else {
        console.error("AI Studio context is not available.");
      }
    } catch (e) {
      console.error("Error opening API key selection:", e);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-600 rounded-lg bg-gray-800/50">
      <h3 className="text-xl font-semibold mb-2 text-white">API Key Required for Video Generation</h3>
      <p className="text-gray-400 mb-4 max-w-md">
        This feature uses the Veo model, which requires a Gemini API key with billing enabled. Please select your key to proceed.
      </p>
      <button
        onClick={handleSelectKey}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
      >
        Select API Key
      </button>
      <a
        href="https://ai.google.dev/gemini-api/docs/billing"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-indigo-400 hover:text-indigo-300 mt-4 underline"
      >
        Learn more about billing
      </a>
    </div>
  );
};

export default ApiKeySelector;