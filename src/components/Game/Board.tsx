import React from 'react';
import { SquareNode } from '@/types';
import Cell from './Cell';

// プロップスの型定義
interface BoardProps {
  board: SquareNode[][];
  onRevealCell: (x: number, y: number) => void;
  onFlagCell: (x: number, y: number) => void;
}

/**
 * ボードコンポーネント
 * マインスイーパーのゲームボードを表示し、セルを配置
 */
const Board: React.FC<BoardProps> = ({ board, onRevealCell, onFlagCell }) => {
  if (!board || board.length === 0) {
    return <div className="text-center p-4">ボードが初期化されていません</div>;
  }

  const rows = board.length;
  const cols = board[0].length;

  // ボードサイズに応じたグリッドスタイルを生成
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gap: '1px',
    width: 'fit-content',
    margin: '0 auto',
  };

  return (
    <div 
      className="p-2 bg-gray-100 rounded shadow-md"
      data-testid="minesweeper-board"
    >
      <div style={gridStyle}>
        {board.map((row) =>
          row.map((cell) => (
            <Cell
              key={cell.id}
              cell={cell}
              onReveal={onRevealCell}
              onFlag={onFlagCell}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Board;