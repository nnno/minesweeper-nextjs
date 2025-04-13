import React from 'react';
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
    resetGame,
    changeDifficulty
  } = useGameContext();

  // ゲーム状態に基づくメッセージを取得
  const getStatusMessage = () => {
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
  };

  // 難易度のラベルを取得
  const getDifficultyLabel = (diff: Difficulty): string => {
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
  };

  // 難易度変更ハンドラー
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // 文字列値をマッピングしてDifficulty型に変換
    const difficultyValue = Number(e.target.value);
    let newDifficulty: Difficulty;
    
    switch (difficultyValue) {
      case 0:
        newDifficulty = Difficulty.BEGINNER;
        break;
      case 1:
        newDifficulty = Difficulty.INTERMEDIATE;
        break;
      case 2:
        newDifficulty = Difficulty.EXPERT;
        break;
      case 3:
        newDifficulty = Difficulty.CUSTOM;
        break;
      default:
        newDifficulty = Difficulty.BEGINNER; // デフォルト値
    }
    
    changeDifficulty(newDifficulty);
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      <div className="w-full mb-6 flex flex-col sm:flex-row justify-between items-center bg-gray-100 p-4 rounded-lg shadow">
        {/* ゲーム情報エリア */}
        <div className="mb-4 sm:mb-0 text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-800">マインスイーパー</h2>
          <p className="text-sm text-gray-600">難易度: {getDifficultyLabel(difficulty)}</p>
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
            className="p-2 border rounded bg-white"
            value={difficulty}
            onChange={handleDifficultyChange}
            disabled={status === GameStatus.PLAYING}
          >
            <option value={Difficulty.BEGINNER}>初級 (9x9, 10地雷)</option>
            <option value={Difficulty.INTERMEDIATE}>中級 (16x16, 40地雷)</option>
            <option value={Difficulty.EXPERT}>上級 (16x30, 99地雷)</option>
          </select>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={resetGame}
          >
            リセット
          </button>
        </div>
      </div>

      {/* ステータスメッセージ */}
      <div 
        className={`w-full mb-4 p-3 text-center rounded ${
          status === GameStatus.WON
            ? 'bg-green-100 text-green-800'
            : status === GameStatus.LOST
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}
      >
        {getStatusMessage()}
      </div>

      {/* ゲームボード */}
      <div className="w-full overflow-auto">
        <Board
          board={board}
          onRevealCell={revealCell}
          onFlagCell={toggleFlag}
        />
      </div>

      {/* 操作説明 */}
      <div className="mt-6 p-3 bg-gray-100 rounded text-sm text-gray-700 w-full max-w-md">
        <p>左クリック: セルを開く</p>
        <p>右クリック: フラグを立てる/解除する</p>
      </div>
    </div>
  );
};

export default GameBoard;