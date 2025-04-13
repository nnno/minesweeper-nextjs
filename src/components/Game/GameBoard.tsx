import React from 'react';

interface GameBoardProps {
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* ゲームステータスバー */}
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-lg shadow-sm">
        <div className="bg-black text-red-500 font-mono font-bold px-3 py-1 rounded">010</div>
        <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">
          😊
        </button>
        <div className="bg-black text-red-500 font-mono font-bold px-3 py-1 rounded">000</div>
      </div>
      
      {/* ゲームボード - プレースホルダー */}
      <div className="grid grid-cols-9 gap-1 bg-slate-200 dark:bg-slate-800 p-3 rounded-lg shadow-md">
        {Array(9 * 9).fill(null).map((_, index) => (
          <div 
            key={index}
            className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500 flex items-center justify-center"
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;