import React from 'react';

interface GameBoardProps {
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`} role="region" aria-label="マインスイーパーゲームボード">
      {/* ゲームステータスバー */}
      <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-lg shadow-sm">
        <div className="bg-black text-red-500 font-mono font-bold px-3 py-1 rounded" aria-label="残りの地雷数: 10">010</div>
        <button 
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="ゲームをリセット"
        >
          😊
        </button>
        <div className="bg-black text-red-500 font-mono font-bold px-3 py-1 rounded" aria-label="経過時間: 0秒">000</div>
      </div>
      
      {/* ゲームボード - プレースホルダー */}
      <div 
        className="grid grid-cols-9 gap-1 bg-slate-200 dark:bg-slate-800 p-3 rounded-lg shadow-md"
        role="grid"
        aria-label="マインスイーパーのマス目"
      >
        {Array(9 * 9).fill(null).map((_, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;
          return (
            <button 
              key={index}
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              aria-label={`行${row + 1}、列${col + 1}のマス`}
              aria-pressed="false"
              tabIndex={0}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GameBoard;