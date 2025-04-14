import React, { useEffect, useState } from 'react';
import { Difficulty, GameStatus } from '@/types';

interface GameResultProps {
  status: GameStatus;
  difficulty: Difficulty;
  timer: number;
  flagsCount: number;
  minesCount: number;
  onRestart: () => void;
}

/**
 * ゲーム結果を表示するモーダルコンポーネント
 * 勝利または敗北時にゲーム結果と統計情報を表示
 */
const GameResult: React.FC<GameResultProps> = ({
  status,
  difficulty,
  timer,
  flagsCount,
  minesCount,
  onRestart
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animateClass, setAnimateClass] = useState('');

  // ゲーム状態に応じてモーダルの表示/非表示を制御
  useEffect(() => {
    if (status === GameStatus.WON || status === GameStatus.LOST) {
      setIsVisible(true);
      // アニメーションを遅延させて適用（モーダルが表示された後）
      setTimeout(() => {
        setAnimateClass('animate-fadeIn');
      }, 100);
    } else {
      setIsVisible(false);
      setAnimateClass('');
    }
  }, [status]);

  // 表示しない場合はnullを返す
  if (!isVisible) {
    return null;
  }

  // 難易度に応じたラベルを取得
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

  // 勝利時のメッセージを生成
  const getWinMessage = (): string => {
    if (timer < 60) {
      return 'すごい！短時間でクリアしました！';
    } else if (timer < 180) {
      return 'お見事！上手くプレイされました！';
    } else {
      return 'おめでとうございます！クリア達成！';
    }
  };

  // 敗北時のメッセージを生成
  const getLoseMessage = (): string => {
    if (timer < 10) {
      return '運が悪かったですね...もう一度チャレンジしてみましょう！';
    } else if (flagsCount > minesCount / 2) {
      return '惜しい！もう少しで勝てたかもしれません。';
    } else {
      return '地雷を踏んでしまいました...もう一度挑戦してみましょう！';
    }
  };

  // タイマーの表示形式を整える
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6 ${animateClass}`}>
        {/* ヘッダー部分 */}
        <div className="text-center mb-6">
          {status === GameStatus.WON ? (
            <>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                勝利！
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {getWinMessage()}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                ゲームオーバー
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {getLoseMessage()}
              </p>
            </>
          )}
        </div>

        {/* 統計情報 */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            ゲーム統計
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-gray-700 dark:text-gray-300">難易度:</div>
            <div className="font-medium text-right text-gray-800 dark:text-gray-200">
              {getDifficultyLabel(difficulty)}
            </div>
            
            <div className="text-gray-700 dark:text-gray-300">プレイ時間:</div>
            <div className="font-medium text-right text-gray-800 dark:text-gray-200">
              {formatTime(timer)}
            </div>
            
            <div className="text-gray-700 dark:text-gray-300">使用フラグ数:</div>
            <div className="font-medium text-right text-gray-800 dark:text-gray-200">
              {flagsCount} / {minesCount}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRestart}
            className="py-2 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg 
                      transition-colors duration-200 flex-1 sm:flex-initial"
            aria-label="新しいゲームを開始"
          >
            新しいゲーム
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameResult;