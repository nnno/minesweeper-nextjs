import React from 'react';

/**
 * 残りの地雷数の表示形式を整形する
 * @param count 残りの地雷数
 * @returns 3桁の整形された地雷数文字列（例: 010, 040, 099）
 */
const formatMineCount = (count: number): string => {
  // 999を上限とする
  const cappedCount = Math.max(Math.min(count, 999), 0);
  return cappedCount.toString().padStart(3, '0');
};

interface MineCounterProps {
  minesCount: number;
  className?: string;
}

/**
 * 地雷カウンターコンポーネント
 * 残りの地雷数を表示するデジタルディスプレイ風のコンポーネント
 */
const MineCounter: React.FC<MineCounterProps> = ({ minesCount, className = '' }) => {
  const displayCount = formatMineCount(minesCount);
  
  return (
    <div 
      className={`bg-black text-red-500 font-mono font-bold px-2 py-1 rounded border border-gray-700 shadow-inner ${className}`}
      aria-label={`残りの地雷数: ${minesCount}`}
    >
      <span className="text-xl tracking-wider">
        {displayCount}
      </span>
    </div>
  );
};

export default MineCounter;