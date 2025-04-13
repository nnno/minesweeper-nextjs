import React, { createContext, useContext } from 'react';
import { Difficulty, GameSettings } from '../types';
import { useGame, UseGameResult } from '../hooks/useGame';

// GameContextの型定義（useGameフックの戻り値と同じ）
type GameContextType = UseGameResult;

// コンテキストの作成（初期値はundefined）
const GameContext = createContext<GameContextType | undefined>(undefined);

// GameProviderのプロパティ型
interface GameProviderProps {
  children: React.ReactNode;
  initialDifficulty?: Difficulty;
  customSettings?: GameSettings;
}

/**
 * ゲーム状態を提供するプロバイダーコンポーネント
 * このコンポーネントで囲まれた子コンポーネントはGameContextにアクセス可能
 */
export const GameProvider: React.FC<GameProviderProps> = ({
  children,
  initialDifficulty = Difficulty.BEGINNER,
  customSettings
}) => {
  // useGameフックを使用してゲームロジックを初期化
  const gameState = useGame(initialDifficulty, customSettings);
  
  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * ゲーム状態にアクセスするためのカスタムフック
 * コンポーネント内でゲーム状態と操作関数を簡単に利用可能
 * 
 * @returns ゲーム状態と操作関数
 * @throws GameProviderの外部で使用された場合にエラー
 */
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};