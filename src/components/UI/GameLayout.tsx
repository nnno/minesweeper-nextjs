import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface GameLayoutProps {
  children: React.ReactNode;
}

const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header className="mb-6" />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        {/* モバイルでは小さく、デスクトップでは大きく表示 */}
        <div className="w-full max-w-sm md:max-w-lg lg:max-w-xl mx-auto">
          {children}
        </div>
      </main>
      
      <Footer className="mt-6" />
    </div>
  );
};

export default GameLayout;