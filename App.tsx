
import React, { useState } from 'react';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import { PhotoIcon, VideoCameraIcon } from './components/icons';

type View = 'image' | 'video';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('image');

  const navButtonClasses = (view: View) => 
    `flex items-center gap-3 px-6 py-3 text-lg font-semibold rounded-t-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${
      activeView === view
        ? 'bg-surface text-primary'
        : 'bg-transparent text-text-secondary hover:bg-secondary/50'
    }`;

  return (
    <div className="min-h-screen bg-brand-bg text-text-primary font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Gemini Image & Video Studio
          </h1>
          <p className="mt-4 text-xl text-text-secondary">
            Bring your creative visions to life with generative AI.
          </p>
        </header>

        <main>
          <div className="border-b border-secondary/50 mb-8">
            <nav className="flex justify-center -mb-px">
              <button onClick={() => setActiveView('image')} className={navButtonClasses('image')}>
                <PhotoIcon className="w-6 h-6" />
                Image Editor
              </button>
              <button onClick={() => setActiveView('video')} className={navButtonClasses('video')}>
                <VideoCameraIcon className="w-6 h-6" />
                Video Generator
              </button>
            </nav>
          </div>
          
          <div className="transition-opacity duration-500">
            {activeView === 'image' && <ImageEditor />}
            {activeView === 'video' && <VideoGenerator />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
