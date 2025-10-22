
import React, { useState, useEffect, useCallback } from 'react';

interface ApiKeySelectorProps {
  children: (isKeyReady: boolean) => React.ReactNode;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ children }) => {
  const [isKeySelected, setIsKeySelected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkApiKey = useCallback(async () => {
    setIsChecking(true);
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeySelected(hasKey);
    } else {
      // Fallback for environments where aistudio is not available
      console.warn("aistudio API not found, assuming key is set via environment.");
      setIsKeySelected(true); 
    }
    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race conditions and re-enable the UI immediately.
      // The API call itself will fail if the key is invalid.
      setIsKeySelected(true);
    }
  };

  if (isChecking) {
    return <div className="text-center p-8">Checking for API key...</div>;
  }

  if (!isKeySelected) {
    return (
      <div className="text-center p-8 bg-surface rounded-lg">
        <h3 className="text-2xl font-bold mb-4">API Key Required for Video Generation</h3>
        <p className="text-text-secondary mb-6">
          To use the Veo video generation model, you need to select an API key associated with a project that has billing enabled.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:bg-primary-hover transition"
        >
          Select API Key
        </button>
        <p className="text-sm text-text-secondary mt-4">
          Learn more about <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-primary underline">billing for the Gemini API</a>.
        </p>
      </div>
    );
  }

  return <>{children(isKeySelected)}</>;
};

export default ApiKeySelector;
