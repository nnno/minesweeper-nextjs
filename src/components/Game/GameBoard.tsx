import React, { useCallback, useMemo } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { Difficulty, GameStatus } from '@/types';
import Board from './Board';
import GameControls from '../GameControls';

/**
 * ゲームボードコンポーネント
 * ゲーム全体の表示と制御を担当
 */
const GameBoard: React.FC = () => {
  const {
    board,
    status,
    difficulty,
    revealCell,
    toggleFlag,
    chordCell
  } = useGameContext();

  // 難易度に対応するボードサイズ情報を取得
  const getBoardSizeInfo = useCallback((diff: Difficulty): string => {
    switch (diff) {
      case Difficulty.BEGINNER:
        return '9x9, 10地雷';
      case Difficulty.INTERMEDIATE:
        return '16x16, 40地雷';
      case Difficulty.EXPERT:
        return '16x30, 99地雷';
      case Difficulty.CUSTOM:
        if (board.length > 0) {
          const rows = board.length;
          const cols = board[0].length;
          return `${rows}x${cols}`;
        }
        return 'カスタム設定';
      default:
        return '';
    }
  }, [board]);

  // 難易度のラベルを取得
  const getDifficultyLabel = useCallback((diff: Difficulty): string => {
    switch (diff) {
      case Difficulty.BEGINNER:
        return '初級';
      case Difficulty.INTERMEDIATE:
        return '中級';
      case Difficulty.EXPERT:
        return '上級';
      case Difficulty.CUSTOM:
        return 'カスタム';
      default:
        return '不明';
    }
  }, []);

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      {/* ゲーム情報エリア */}
      <div className="w-full mb-6 flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">マインスイーパー</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            難易度: {getDifficultyLabel(difficulty)} ({getBoardSizeInfo(difficulty)})
          </p>
        </div>
      </div>

      {/* ゲームコントロールエリア - 新しいコンポーネントを使用 */}
      <div className="w-full mb-6">
        <GameControls />
      </div>

      {/* ゲームボード - ラッパーを追加してレスポンシブデザインを強化 */}
      <div className="w-full overflow-auto flex justify-center">
        <div className="min-w-min">
          <Board
            board={board}
            difficulty={difficulty}
            onRevealCell={revealCell}
            onFlagCell={toggleFlag}
            onChordCell={chordCell}
          />
        </div>
      </div>

      {/* 操作説明 */}
      <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 w-full max-w-md">
        <h3 className="font-bold mb-2">操作方法:</h3>
        <p>・ 左クリック: セルを開く</p>
        <p>・ 右クリック: フラグを立てる/解除する</p>
        <p>・ 中クリック: 隣接セルを一括で開く</p>
        <p>・ タッチデバイス: タップで開く、長押しでフラグ設置</p>
      </div>
    </div>
  );
};

export default GameBoard;