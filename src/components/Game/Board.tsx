import React, { useMemo } from 'react';
import { Difficulty, SquareNode } from '@/types';
import Cell from './Cell';

// プロップスの型定義
interface BoardProps {
  board: SquareNode[][];
  difficulty: Difficulty; // 難易度を追加
  onRevealCell: (x: number, y: number) => void;
  onFlagCell: (x: number, y: number) => void;
  onChordCell?: (x: number, y: number) => void;
}

/**
 * ボードコンポーネント
 * マインスイーパーのゲームボードを表示し、セルを配置
 */
const Board: React.FC<BoardProps> = ({ board, difficulty, onRevealCell, onFlagCell, onChordCell }) => {
  if (!board || board.length === 0) {
    return <div className="text-center p-4">ボードが初期化されていません</div>;
  }

  const rows = board.length;
  const cols = board[0].length;

  // 難易度に応じたセルサイズを計算（メモ化）
  const cellSize = useMemo(() => {
    switch (difficulty) {
      case Difficulty.BEGINNER:
        return 'w-8 h-8 md:w-10 md:h-10';
      case Difficulty.INTERMEDIATE:
        return 'w-7 h-7 md:w-8 md:h-8';
      case Difficulty.EXPERT:
        return 'w-6 h-6 md:w-7 md:h-7';
      case Difficulty.CUSTOM:
      default:
        // カスタム難易度の場合はボードサイズに応じて動的に調整
        return cols > 20 ? 'w-6 h-6 md:w-7 md:h-7' : 
               cols > 16 ? 'w-7 h-7 md:w-8 md:h-8' : 
               'w-8 h-8 md:w-10 md:h-10';
    }
  }, [difficulty, cols]);

  // ボードサイズに応じたグリッドスタイルを生成
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gap: '1px',
    width: 'fit-content',
    margin: '0 auto',
  }), [cols]);

  // ボードのコンテナスタイルを生成
  const containerClassName = useMemo(() => {
    // 難易度に応じてボードのサイズを調整
    let sizeClass;
    switch (difficulty) {
      case Difficulty.EXPERT:
        sizeClass = 'max-w-full overflow-auto';
        break;
      case Difficulty.INTERMEDIATE:
        sizeClass = 'max-w-2xl';
        break;
      default:
        sizeClass = 'max-w-md';
    }
    
    return `p-2 bg-gray-100 dark:bg-gray-800 rounded shadow-md ${sizeClass}`;
  }, [difficulty]);

  return (
    <div 
      className={containerClassName}
      data-testid="minesweeper-board"
    >
      <div style={gridStyle}>
        {board.map((row) =>
          row.map((cell) => (
            <Cell
              key={cell.id}
              cell={cell}
              cellSize={cellSize}
              onReveal={onRevealCell}
              onFlag={onFlagCell}
              onChord={onChordCell}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(Board); // パフォーマンス最適化のためにメモ化