import React, { useEffect } from 'react';
import MineCounter from './MineCounter';
import Timer from './Timer';
import GameFace from './GameFace';
import DifficultySelector from './DifficultySelector';
import { useGameContext } from '@/contexts/GameContext';
import { GameStatus } from '@/types';

/**
 * ゲームコントロールコンポーネント
 * ゲーム制御用の要素（地雷カウンター、タイマー、顔ボタン、難易度選択）を提供します
 */
const GameControls: React.FC = () => {
  const { status, minesCount, timer, resetGame } = useGameContext();

  // ステータスバー用のコンテナスタイル
  const statusBarContainerClass = "px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow flex items-center justify-between";

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <div className="flex flex-col gap-3">
        {/* 上部のステータスバー（地雷カウンター、顔、タイマー） */}
        <div className={statusBarContainerClass}>
          <MineCounter minesCount={minesCount} />
          <GameFace 
            status={status} 
            onRestart={resetGame}
          />
          <Timer time={timer} />
        </div>
        
        {/* 難易度選択コントロール */}
        <DifficultySelector />
        
        {/* ゲームステータス表示（テキスト） */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {status === GameStatus.READY && '準備完了 - クリックしてゲームを開始'}
            {status === GameStatus.PLAYING && 'ゲーム中 - 頑張ってください！'}
            {status === GameStatus.WON && 'ゲームクリア！おめでとうございます！'}
            {status === GameStatus.LOST && 'ゲームオーバー - もう一度挑戦してみましょう'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameControls;