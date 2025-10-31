
import React, { useState } from 'react';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import { MagicIcon, VideoIcon } from './components/icons';

type ActiveTab = 'image' | 'video';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('image');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'image':
        return <ImageEditor />;
      case 'video':
        return <VideoGenerator />;
      default:
        return null;
    }
  };

  const TabButton = ({ tabName, label, icon }: { tabName: ActiveTab, label: string, icon: React.ReactElement }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center justify-center w-full sm:w-auto px-6 py-3 font-medium text-sm rounded-t-lg transition-colors duration-200 focus:outline-none ${
        activeTab === tabName
          ? 'bg-gray-800 text-white border-b-2 border-indigo-500'
          : 'text-gray-400 hover:bg-gray-700/50'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Facelift AI
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Your AI-powered Image & Video Studio</p>
        </header>

        <main>
          <div className="flex justify-center border-b border-gray-700 mb-6">
            <TabButton tabName="image" label="Image Editor" icon={<MagicIcon className="w-5 h-5" />} />
            <TabButton tabName="video" label="Video Generator" icon={<VideoIcon className="w-5 h-5" />} />
          </div>
          <div className="bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-8">
            {renderTabContent()}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;