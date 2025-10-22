
import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      {message && <p className="text-text-secondary text-lg">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
