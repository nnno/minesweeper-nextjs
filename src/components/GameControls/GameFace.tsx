import React from 'react';
import { GameStatus } from '@/types';

interface GameFaceProps {
  status: GameStatus;
  onRestart: () => void;
  className?: string;
}

/**
 * ゲームの表情コンポーネント
 * ゲームの状態を表情で表し、リスタート機能を提供します
 */
const GameFace: React.FC<GameFaceProps> = ({ status, onRestart, className = '' }) => {
  // ゲーム状態に応じた表情
  const getFaceEmoji = (): string => {
    switch (status) {
      case GameStatus.READY:
        return '😊'; // 準備完了（スマイル）
      case GameStatus.PLAYING:
        return '🙂'; // プレイ中（通常の顔）
      case GameStatus.WON:
        return '😎'; // 勝利（サングラス）
      case GameStatus.LOST:
        return '😵'; // 敗北（目がバツ）
      default:
        return '🙂';
    }
  };

  // ゲーム状態に応じたARIAラベル
  const getAriaLabel = (): string => {
    switch (status) {
      case GameStatus.READY:
        return 'ゲーム準備完了 - クリックでリスタート';
      case GameStatus.PLAYING:
        return 'ゲームプレイ中 - クリックでリスタート';
      case GameStatus.WON:
        return 'ゲームクリア - クリックでリスタート';
      case GameStatus.LOST:
        return 'ゲームオーバー - クリックでリスタート';
      default:
        return 'ゲーム - クリックでリスタート';
    }
  };

  return (
    <button
      className={`text-3xl w-12 h-12 flex items-center justify-center 
        bg-gray-200 hover:bg-gray-300 rounded-full 
        dark:bg-gray-700 dark:hover:bg-gray-600 
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-all duration-200 ${className}`}
      onClick={onRestart}
      aria-label={getAriaLabel()}
    >
      {getFaceEmoji()}
    </button>
  );
};

export default GameFace;