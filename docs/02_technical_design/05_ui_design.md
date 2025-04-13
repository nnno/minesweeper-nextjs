# UIコンポーネント設計

# マインスイーパーのUIコンポーネント設計

マインスイーパーのUIは、モダンなデザインと使いやすさ、そして拡張性を重視した再利用可能なコンポーネントで構成されています。このドキュメントでは、ゲームの主要なUIコンポーネント設計について説明します。

## コンポーネント階層構造

マインスイーパーのUIは次のようなコンポーネント階層で構成されています：

```
App
├── Header
│   ├── GameLogo
│   ├── DifficultySelector
│   └── ThemeToggle
├── GameBoard
│   ├── GameStatus
│   │   ├── MinesCounter
│   │   ├── GameFace
│   │   └── Timer
│   └── Board
│       └── Cell(s)
├── GameControls
│   ├── ResetButton
│   ├── SettingsButton
│   └── HelpButton
└── Footer
    ├── Statistics
    └── Credits
```

この階層構造によって、コンポーネントの責任が明確に分離され、再利用性と保守性が向上します。

## 主要コンポーネントの詳細

### 1. GameBoard

ゲームボードは、マインスイーパーの中心となるコンポーネントで、セルのグリッドと状態表示を含みます。

```tsx
// components/GameBoard.tsx

import React from 'react';
import { GameStatus } from '../types';
import { useGameContext } from '../contexts/GameContext';
import GameStatusBar from './GameStatusBar';
import Board from './Board';

interface GameBoardProps {
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ className = '' }) => {
  const { board, gameStatus, minesCount, flagsCount, timer, revealCell, toggleFlag, resetGame } = useGameContext();
  
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <GameStatusBar 
        gameStatus={gameStatus}
        minesCount={minesCount}
        flagsCount={flagsCount}
        timer={timer}
        onReset={resetGame}
      />
      <Board 
        board={board}
        gameStatus={gameStatus}
        onCellClick={revealCell}
        onCellRightClick={toggleFlag}
      />
    </div>
  );
};

export default GameBoard;
```

### 2. Board

Boardコンポーネントは、セルの配置とグリッドレイアウトを担当します。異なるサイズのボードをレスポンシブに表示します。

```tsx
// components/Board.tsx

import React from 'react';
import { SquareNode, GameStatus } from '../types';
import Cell from './Cell';

interface BoardProps {
  board: SquareNode[][];
  gameStatus: GameStatus;
  onCellClick: (x: number, y: number) => void;
  onCellRightClick: (x: number, y: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, gameStatus, onCellClick, onCellRightClick }) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // 右クリックメニューを無効化
  };

  return (
    <div 
      className="grid gap-1 bg-slate-200 dark:bg-slate-800 p-3 rounded-lg shadow-md" 
      style={{
        gridTemplateColumns: `repeat(${board[0]?.length || 0}, minmax(0, 1fr))`,
      }}
      onContextMenu={handleContextMenu}
    >
      {board.map((row, y) => (
        row.map((cell, x) => (
          <Cell
            key={`${x}-${y}`}
            cell={cell}
            gameOver={gameStatus === GameStatus.LOST || gameStatus === GameStatus.WON}
            onClick={() => onCellClick(x, y)}
            onRightClick={() => onCellRightClick(x, y)}
          />
        ))
      ))}
    </div>
  );
};

export default Board;
```

### 3. Cell

Cellコンポーネントは個々のマス目を表示し、マウスイベントを処理します。セルの状態に基づいて適切な表示を行います。

```tsx
// components/Cell.tsx

import React from 'react';
import { SquareNode } from '../types';

interface CellProps {
  cell: SquareNode;
  gameOver: boolean;
  onClick: () => void;
  onRightClick: () => void;
}

const Cell: React.FC<CellProps> = ({ cell, gameOver, onClick, onRightClick }) => {
  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onRightClick();
  };
  
  // セルのスタイルを決定する
  const getCellStyle = () => {
    if (cell.isRevealed) {
      return 'bg-gray-300 dark:bg-gray-600';
    }
    return 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer';
  };
  
  // セルの内容を決定する
  const getCellContent = () => {
    if (cell.isFlagged) {
      return '🚩'; // 旗の絵文字
    }
    
    if (!cell.isRevealed) {
      return '';
    }
    
    if (cell.isMine) {
      return '💣'; // 爆弾の絵文字
    }
    
    if (cell.adjacentMines === 0) {
      return '';
    }
    
    // 隣接する地雷数に基づいて色を変更
    const colors = [
      'text-blue-600 dark:text-blue-400',       // 1
      'text-green-600 dark:text-green-400',     // 2
      'text-red-600 dark:text-red-400',         // 3
      'text-indigo-800 dark:text-indigo-400',   // 4
      'text-yellow-600 dark:text-yellow-400',   // 5
      'text-teal-600 dark:text-teal-400',       // 6
      'text-purple-600 dark:text-purple-400',   // 7
      'text-gray-800 dark:text-gray-300'        // 8
    ];
    
    return (
      <span className={colors[cell.adjacentMines - 1]}>
        {cell.adjacentMines}
      </span>
    );
  };
  
  return (
    <div
      className={`
        flex items-center justify-center
        w-8 h-8 md:w-10 md:h-10
        border border-gray-400 dark:border-gray-500
        text-sm md:text-base font-bold
        transition-colors
        ${getCellStyle()}
      `}
      onClick={gameOver ? undefined : onClick}
      onContextMenu={gameOver ? undefined : handleRightClick}
    >
      {getCellContent()}
    </div>
  );
};

export default Cell;
```

### 4. GameStatusBar

GameStatusBarは、ゲームの状態、残りの地雷数、経過時間、リセットボタンを表示します。

```tsx
// components/GameStatusBar.tsx

import React from 'react';
import { GameStatus } from '../types';
import MinesCounter from './MinesCounter';
import GameFace from './GameFace';
import Timer from './Timer';

interface GameStatusBarProps {
  gameStatus: GameStatus;
  minesCount: number;
  flagsCount: number;
  timer: number;
  onReset: () => void;
}

const GameStatusBar: React.FC<GameStatusBarProps> = ({
  gameStatus,
  minesCount,
  flagsCount,
  timer,
  onReset
}) => {
  return (
    <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-lg shadow-sm">
      <MinesCounter count={minesCount - flagsCount} />
      <GameFace gameStatus={gameStatus} onClick={onReset} />
      <Timer time={timer} />
    </div>
  );
};

export default GameStatusBar;
```

### 5. DifficultySelector

難易度選択コンポーネントでは、ユーザーがゲームの難易度を選択できます。

```tsx
// components/DifficultySelector.tsx

import React from 'react';
import { Difficulty } from '../types';

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  onChangeDifficulty: (difficulty: Difficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
  currentDifficulty, 
  onChangeDifficulty 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-2">
      <select
        className="px-3 py-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
        value={currentDifficulty}
        onChange={(e) => onChangeDifficulty(e.target.value as Difficulty)}
      >
        <option value={Difficulty.BEGINNER}>初級 (9x9, 10地雷)</option>
        <option value={Difficulty.INTERMEDIATE}>中級 (16x16, 40地雷)</option>
        <option value={Difficulty.EXPERT}>上級 (16x30, 99地雷)</option>
        <option value={Difficulty.CUSTOM}>カスタム</option>
      </select>
      
      {currentDifficulty === Difficulty.CUSTOM && (
        <div className="flex gap-2">
          {/* カスタム設定用のUIをここに追加 */}
          {/* 行数、列数、地雷数の入力フィールドなど */}
        </div>
      )}
    </div>
  );
};

export default DifficultySelector;
```

## レスポンシブデザイン対応

マインスイーパーのUIは、さまざまな画面サイズに対応するレスポンシブデザインを取り入れています。Tailwind CSSを活用して、デバイスの画面サイズに合わせて最適なレイアウトを提供します。

```tsx
// layouts/GameLayout.tsx

import React from 'react';
import Header from '../components/Header';
import GameBoard from '../components/GameBoard';
import Footer from '../components/Footer';

const GameLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl flex flex-col min-h-screen">
        <Header className="mb-6" />
        
        <main className="flex-grow flex flex-col items-center justify-center">
          {/* モバイルでは小さく、デスクトップでは大きく表示 */}
          <div className="w-full max-w-sm md:max-w-lg lg:max-w-xl mx-auto">
            <GameBoard />
          </div>
        </main>
        
        <Footer className="mt-6" />
      </div>
    </div>
  );
};

export default GameLayout;
```

## アクセシビリティ対応

マインスイーパーのUIは、キーボードナビゲーション、適切なARIAロール、色のコントラスト比など、アクセシビリティに配慮して設計されています。以下はCell要素のアクセシビリティ対応例です。

```tsx
// components/AccessibleCell.tsx

import React, { useRef } from 'react';
import { SquareNode } from '../types';

interface AccessibleCellProps {
  cell: SquareNode;
  gameOver: boolean;
  onClick: () => void;
  onRightClick: () => void;
}

const AccessibleCell: React.FC<AccessibleCellProps> = ({ cell, gameOver, onClick, onRightClick }) => {
  const cellRef = useRef<HTMLButtonElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      onRightClick(); // 'F'キーでフラグトグル
    }
  };
  
  // アクセシブルな説明を作成
  const getAriaLabel = () => {
    if (cell.isRevealed) {
      if (cell.isMine) return '地雷';
      if (cell.adjacentMines === 0) return '空白マス';
      return `隣接地雷数 ${cell.adjacentMines}`;
    }
    
    return cell.isFlagged ? 'フラグ付きマス' : '未開封マス';
  };
  
  return (
    <button
      ref={cellRef}
      className={`
        flex items-center justify-center
        w-8 h-8 md:w-10 md:h-10
        border border-gray-400 dark:border-gray-500
        text-sm md:text-base font-bold
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${getCellStyle()}
      `}
      onClick={gameOver ? undefined : onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!gameOver) onRightClick();
      }}
      onKeyDown={gameOver ? undefined : handleKeyDown}
      aria-label={getAriaLabel()}
      aria-pressed={cell.isRevealed}
      disabled={gameOver}
      tabIndex={0}
    >
      {getCellContent()}
    </button>
  );
};

export default AccessibleCell;
```

## ダークモードサポート

アプリケーションはダークモードとライトモードの両方をサポートし、ユーザーの設定に応じて自動的に切り替わります。Tailwind CSSのダークモードクラスを使用して実装されています。

```tsx
// components/ThemeToggle.tsx

import React from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          {/* 太陽のアイコン */}
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          {/* 月のアイコン */}
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
```

## アニメーションとトランジション

ユーザーエクスペリエンスを向上させるために、適切なアニメーションとトランジションを実装します。TailwindのTrasitionクラスとCSSアニメーションを組み合わせて使用します。

```css
/* styles/animations.css */

@keyframes reveal {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes flagPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.reveal-animation {
  animation: reveal 0.2s ease-out;
}

.flag-animation {
  animation: flagPulse 0.3s ease-in-out;
}

/* セルを開いたときの連鎖アニメーション */
.reveal-cascade {
  animation: reveal 0.2s ease-out;
  animation-fill-mode: backwards;
}

/* 各セルのアニメーションディレイを設定 */
.delay-1 { animation-delay: 0.05s; }
.delay-2 { animation-delay: 0.1s; }
.delay-3 { animation-delay: 0.15s; }
.delay-4 { animation-delay: 0.2s; }
.delay-5 { animation-delay: 0.25s; }
```

これらのアニメーションは、セルを開いたときやフラグを立てたときなど、ユーザーアクションに対する視覚的なフィードバックを提供します。

## コンポーネントの再利用性

UIコンポーネントは、将来の拡張や再利用を考慮して設計されています。以下は汎用性の高いボタンコンポーネントの例です。

```tsx
// components/ui/Button.tsx

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  ...rest
}) => {
  // バリアントに基づくスタイル
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
  };
  
  // サイズに基づくスタイル
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variant === 'primary' ? 'focus:ring-blue-500' : ''}
        ${variant === 'danger' ? 'focus:ring-red-500' : ''}
        ${variant === 'success' ? 'focus:ring-green-500' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center
        ${className}
      `}
      {...rest}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;
```

## まとめ

マインスイーパーのUI設計は、以下の特徴を持っています：

- コンポーネントベースのアーキテクチャ
- レスポンシブデザインとダークモードサポート
- アニメーションとトランジションによる視覚的フィードバック
- 再利用可能な汎用コンポーネント
- アクセシビリティへの配慮

これらの要素が組み合わさることで、ユーザーが直感的に操作でき、見た目にも優れたマインスイーパーゲームを実現しています。