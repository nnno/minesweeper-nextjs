'use client';

import React from 'react';
import GameLayout from '../components/UI/GameLayout';
import GameBoard from '../components/Game/GameBoard';
import { GameProvider } from '../contexts/GameContext';
import { Difficulty } from '@/types';

export default function Home() {
  return (
    <GameLayout>
      <GameProvider initialDifficulty={Difficulty.BEGINNER}>
        <GameBoard />
      </GameProvider>
    </GameLayout>
  );
}
