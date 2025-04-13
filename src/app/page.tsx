'use client';

import React from 'react';
import GameLayout from '../components/UI/GameLayout';
import GameBoard from '../components/Game/GameBoard';

export default function Home() {
  return (
    <GameLayout>
      <GameBoard />
    </GameLayout>
  );
}
