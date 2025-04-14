import React from 'react';
import { Difficulty } from '@/types';
import { useGameContext } from '@/contexts/GameContext';

/**
 * 難易度選択コンポーネント
 * 難易度の選択UI（初級、中級、上級）を提供します
 */
const DifficultySelector: React.FC = () => {
  const { difficulty, changeDifficulty } = useGameContext();

  // 難易度変更ハンドラー
  const handleChangeDifficulty = (newDifficulty: Difficulty) => {
    changeDifficulty(newDifficulty);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        難易度:
      </span>
      <div className="flex space-x-2">
        {/* 初級ボタン */}
        <button
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            difficulty === Difficulty.BEGINNER
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
          }`}
          onClick={() => handleChangeDifficulty(Difficulty.BEGINNER)}
          aria-pressed={difficulty === Difficulty.BEGINNER}
        >
          初級
        </button>

        {/* 中級ボタン */}
        <button
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            difficulty === Difficulty.INTERMEDIATE
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
          }`}
          onClick={() => handleChangeDifficulty(Difficulty.INTERMEDIATE)}
          aria-pressed={difficulty === Difficulty.INTERMEDIATE}
        >
          中級
        </button>

        {/* 上級ボタン */}
        <button
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            difficulty === Difficulty.EXPERT
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
          }`}
          onClick={() => handleChangeDifficulty(Difficulty.EXPERT)}
          aria-pressed={difficulty === Difficulty.EXPERT}
        >
          上級
        </button>
      </div>
    </div>
  );
};

export default DifficultySelector;