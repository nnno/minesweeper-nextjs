import React, { useMemo } from 'react';
import { Difficulty, SquareNode } from '@/types';

interface MineRevealProps {
  board: SquareNode[][];
  isGameLost: boolean;
  difficulty?: Difficulty; // 難易度に基づいてセルサイズを調整
}

/**
 * ゲーム終了時に全ての地雷位置を表示するコンポーネント
 * 勝利時：全ての地雷にフラグが立てられた状態を表示
 * 敗北時：すべての地雷位置と誤ったフラグを表示
 */
const MineReveal: React.FC<MineRevealProps> = ({
  board,
  isGameLost,
  difficulty = Difficulty.BEGINNER
}) => {
  // 難易度に基づいてセルサイズを計算
  const cellSize = useMemo(() => {
    switch (difficulty) {
      case Difficulty.BEGINNER:
        return 40;
      case Difficulty.INTERMEDIATE:
        return 32;
      case Difficulty.EXPERT:
        return 28;
      case Difficulty.CUSTOM:
      default:
        return board[0] && board[0].length > 20 ? 28 : 
               board[0] && board[0].length > 16 ? 32 : 40;
    }
  }, [difficulty, board]);

  // モバイル用にサイズを調整
  const mobileAdjustment = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 0.8 : 1;
  }, []);

  // 最終的なセルサイズを計算
  const finalCellSize = cellSize * mobileAdjustment;
  
  // 内部のインジケーターサイズを計算
  const indicatorSize = Math.max(finalCellSize * 0.6, 16);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {board.map((row, y) => (
        <div key={`mine-reveal-row-${y}`} className="flex">
          {row.map((cell, x) => {
            // 地雷のみを表示（既に開かれた地雷は除く）
            if (cell.isMine && !cell.isRevealed) {
              return (
                <div 
                  key={`mine-reveal-${x}-${y}`}
                  className="absolute"
                  style={{
                    top: `${y * finalCellSize}px`,
                    left: `${x * finalCellSize}px`,
                    width: `${finalCellSize}px`,
                    height: `${finalCellSize}px`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10,
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: 1
                  }}
                >
                  <div className={`
                    rounded-full animate-pulse
                    ${isGameLost ? 'bg-red-500' : 'bg-green-500'} 
                  `} 
                  style={{ width: `${indicatorSize}px`, height: `${indicatorSize}px` }}
                  />
                </div>
              );
            }
            
            // 誤ったフラグを表示（敗北時のみ）
            if (isGameLost && cell.isFlagged && !cell.isMine) {
              return (
                <div 
                  key={`wrong-flag-${x}-${y}`}
                  className="absolute"
                  style={{
                    top: `${y * finalCellSize}px`,
                    left: `${x * finalCellSize}px`,
                    width: `${finalCellSize}px`,
                    height: `${finalCellSize}px`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10
                  }}
                >
                  <div style={{ width: `${indicatorSize}px`, height: `${indicatorSize}px` }}
                       className="flex items-center justify-center">
                    <div className="relative flex items-center justify-center">
                      <div className="text-red-600 font-bold" 
                           style={{ fontSize: `${indicatorSize * 1.2}px` }}>✗</div>
                    </div>
                  </div>
                </div>
              );
            }
            
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default MineReveal;