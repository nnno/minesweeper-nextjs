import React from 'react';
import { SquareNode } from '@/types';

// セルの色の設定
const ADJACENT_MINE_COLORS = [
  'text-transparent',     // 0: 隠す
  'text-blue-600',        // 1: 青
  'text-green-600',       // 2: 緑
  'text-red-600',         // 3: 赤
  'text-blue-800',        // 4: 濃い青
  'text-red-800',         // 5: 濃い赤
  'text-cyan-600',        // 6: シアン
  'text-black',           // 7: 黒
  'text-gray-600',        // 8: グレー
];

// プロップスの型定義
interface CellProps {
  cell: SquareNode;
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
}

/**
 * セルコンポーネント
 * マインスイーパーの個々のセルを表示
 */
const Cell: React.FC<CellProps> = ({ cell, onReveal, onFlag }) => {
  const { x, y, isRevealed, isFlagged, isMine, adjacentMines } = cell;

  // クリックイベントハンドラー
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRevealed && !isFlagged) {
      onReveal(x, y);
    }
  };

  // 右クリックイベントハンドラー
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRevealed) {
      onFlag(x, y);
    }
  };

  // コンテキストメニュー（右クリック）イベントを防止
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // セルのコンテンツを決定
  const getCellContent = () => {
    if (isRevealed) {
      if (isMine) {
        return (
          <span className="flex items-center justify-center text-red-600">
            💣
          </span>
        );
      } else if (adjacentMines > 0) {
        // 有効なインデックス範囲内か確認（0-8）
        const colorIndex = Math.min(Math.max(0, adjacentMines), 8);
        return (
          <span className={`font-bold ${ADJACENT_MINE_COLORS[colorIndex]}`}>
            {adjacentMines}
          </span>
        );
      }
      return null;
    } else if (isFlagged) {
      return (
        <span className="flex items-center justify-center text-red-600">
          🚩
        </span>
      );
    }
    return null;
  };

  // セルのスタイルを決定
  const getCellStyle = () => {
    let baseStyle = "flex items-center justify-center w-8 h-8 select-none border border-gray-400 text-center";
    
    if (isRevealed) {
      if (isMine) {
        return `${baseStyle} bg-red-200`;
      }
      return `${baseStyle} bg-gray-200`;
    }
    
    return `${baseStyle} bg-gray-300 hover:bg-gray-400 active:bg-gray-500 cursor-pointer`;
  };

  return (
    <div
      className={getCellStyle()}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={(e) => e.button === 2 && handleRightClick(e)}
      role="button"
      tabIndex={0}
      aria-label={
        isRevealed
          ? isMine
            ? "地雷"
            : `隣接する地雷: ${adjacentMines}`
          : isFlagged
            ? "フラグ"
            : "未開封"
      }
    >
      {getCellContent()}
    </div>
  );
};

export default Cell;