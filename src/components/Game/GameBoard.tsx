import React, { useCallback, useMemo } from 'react';
import { useGameContext } from '@/contexts/GameContext';
import { Difficulty, GameStatus } from '@/types';
import Board from './Board';

/**
 * ゲームボードコンポーネント
 * ゲーム全体の表示と制御を担当
 */
const GameBoard: React.FC = () => {
  const {
    board,
    status,
    difficulty,
    minesCount,
    flagsCount,
    timer,
    revealCell,
    toggleFlag,
    chordCell,
    resetGame,
    changeDifficulty
  } = useGameContext();

  // ゲーム状態に基づくメッセージを取得
  const getStatusMessage = useCallback(() => {
    switch (status) {
      case GameStatus.PLAYING:
        return 'ゲームプレイ中';
      case GameStatus.WON:
        return '🎉 ゲームクリア！おめでとう！ 🎉';
      case GameStatus.LOST:
        return '💥 ゲームオーバー... もう一度挑戦しましょう! 💥';
      case GameStatus.READY:
      default:
        return 'クリックしてゲームを開始';
    }
  }, [status]);

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
          return `${rows}x${cols}, ${minesCount}地雷`;
        }
        return 'カスタム設定';
      default:
        return '';
    }
  }, [board, minesCount]);

  // 難易度変更ハンドラー
  const handleDifficultyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    // 文字列値をDifficulty型に変換
    const difficultyValue = e.target.value as Difficulty;
    changeDifficulty(difficultyValue);
  }, [changeDifficulty]);

  // ステータスメッセージのスタイルを取得
  const getStatusStyle = useMemo(() => {
    return `w-full mb-4 p-3 text-center rounded ${
      status === GameStatus.WON
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : status === GameStatus.LOST
        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }`;
  }, [status]);

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      {/* ゲーム情報とコントロールエリア */}
      <div className="w-full mb-6 flex flex-col sm:flex-row justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
        {/* ゲーム情報エリア */}
        <div className="mb-4 sm:mb-0 text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">マインスイーパー</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            難易度: {getDifficultyLabel(difficulty)} ({getBoardSizeInfo(difficulty)})
          </p>
        </div>

        {/* ゲームコントロールエリア */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-black text-white px-2 py-1 rounded">
              💣 {minesCount}
            </span>
            <span className="font-mono bg-black text-white px-2 py-1 rounded">
              ⏱️ {timer}
            </span>
          </div>

          <select
            className="p-2 border rounded bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            value={difficulty}
            onChange={handleDifficultyChange}
            disabled={status === GameStatus.PLAYING}
          >
            <option value={Difficulty.BEGINNER}>初級 (9x9, 10地雷)</option>
            <option value={Difficulty.INTERMEDIATE}>中級 (16x16, 40地雷)</option>
            <option value={Difficulty.EXPERT}>上級 (16x30, 99地雷)</option>
            <option value={Difficulty.CUSTOM}>カスタム</option>
          </select>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={resetGame}
          >
            リセット
          </button>
        </div>
      </div>

      {/* ステータスメッセージ */}
      <div className={getStatusStyle}>
        {getStatusMessage()}
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