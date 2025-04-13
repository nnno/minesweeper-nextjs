# データモデルと状態管理

# マインスイーパーのデータモデルと状態管理

マインスイーパーゲームのデータモデルは、ノードベースのグリッド設計と拡張性を考慮したカスタムフックと部分的なreducerパターンを組み合わせた状態管理を特徴としています。

## コアデータモデル

以下にコアとなるデータモデルの型定義を示します：

```tsx
// types/index.ts

// 座標インターフェース - 形状に依存しない抽象化
export interface Coordinate {
  // 実装に応じたプロパティ
}

// 正方形グリッド用の座標実装
export interface SquareCoordinate extends Coordinate {
  x: number;
  y: number;
}

// 難易度設定
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert',
  CUSTOM = 'custom'
}

// 難易度ごとの設定
export interface GameSettings {
  rows: number;
  cols: number;
  mines: number;
}

// マスの状態
export enum CellState {
  CLOSED = 'closed',
  OPENED = 'opened',
  FLAGGED = 'flagged',
}

// ゲームの状態
export enum GameStatus {
  READY = 'ready',    // 初期状態
  PLAYING = 'playing', // プレイ中
  WON = 'won',        // 勝利
  LOST = 'lost',      // 敗北
}

// ノード（セル）インターフェース
export interface INode {
  id: string;         // ユニークな識別子
  isMine: boolean;    // 地雷かどうか
  isRevealed: boolean; // 開いたかどうか
  isFlagged: boolean;  // フラグが立てられているか
  adjacentMines: number; // 隣接する地雷の数
}

// 正方形ノード実装
export interface SquareNode extends INode {
  x: number;  // X座標
  y: number;  // Y座標
}

// グリッドインターフェース
export interface IGrid<T extends INode> {
  // ノードの取得
  getNode(id: string): T | undefined;
  
  // 隣接ノードの取得（形状による違いをカプセル化）
  getAdjacentNodes(nodeId: string): T[];
  
  // 全ノードの取得
  getAllNodes(): T[];
  
  // グリッド生成
  generateGrid(params: any): void;
  
  // 地雷の配置
  placeMines(count: number, excludedNodeId?: string): void;
}

// ゲーム状態の型
export interface GameState {
  status: GameStatus;       // ゲームの状態
  difficulty: Difficulty;    // 難易度
  settings: GameSettings;    // ゲーム設定
  minesCount: number;        // 総地雷数
  flagsCount: number;        // 設置されたフラグの数
  timer: number;             // タイマー
  firstClick: boolean;       // 最初のクリックかどうか
}

```

この型定義は、ゲームの基本的な構造と将来の拡張性を考慮して設計されています。特に、CoordinateとINodeインターフェースは、将来的に六角形や三角形のマス形状を拡張できるように設計されています。

## 状態管理の実装

マインスイーパーの状態管理は、カスタムフックと部分的なreducerパターンを組み合わせたハイブリッドアプローチを采用しています。

```tsx
// hooks/useGame.ts

export function useGame(difficulty: Difficulty) {
  // 単純な状態
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.READY);
  const [minesCount, setMinesCount] = useState(0);
  const [timer, setTimer] = useState(0);

  // 複雑な状態（boardとflagsCount）はreducerで管理
  const [boardState, dispatchBoardAction] = useReducer(boardReducer, {
    board: [],
    flagsCount: 0
  });

  // 初期化
  useEffect(() => {
    initializeGame(difficulty);
  }, [difficulty]);

  // ゲーム初期化
  const initializeGame = useCallback((diff: Difficulty) => {
    const newBoard = createEmptyBoard(diff);
    dispatchBoardAction({
      type: 'INITIALIZE_BOARD',
      payload: { board: newBoard }
    });
    setGameStatus(GameStatus.READY);
    setMinesCount(getMineCount(diff));
    setTimer(0);
  }, []);
```

```tsx
  // セルを開く
  const revealCell = useCallback((x: number, y: number) => {
    if (gameStatus === GameStatus.LOST || gameStatus === GameStatus.WON) return;

    // 初回クリック
    if (gameStatus === GameStatus.READY) {
      dispatchBoardAction({
        type: 'PLACE_MINES',
        payload: { excludeX: x, excludeY: y, count: minesCount }
      });
      setGameStatus(GameStatus.PLAYING);
    }

    // セルを開く
    const result = dispatchBoardAction({
      type: 'REVEAL_CELL',
      payload: { x, y }
    });

    // 結果に基づいて状態更新
    if (result.hitMine) {
      setGameStatus(GameStatus.LOST);
    } else if (result.isComplete) {
      setGameStatus(GameStatus.WON);
    }
  }, [boardState.board, gameStatus, minesCount]);
```

```tsx
  // フラグ設置
  const toggleFlag = useCallback((x: number, y: number) => {
    if (gameStatus !== GameStatus.PLAYING && gameStatus !== GameStatus.READY) return;

    dispatchBoardAction({
      type: 'TOGGLE_FLAG', 
      payload: { x, y }
    });
  }, [gameStatus]);

  // その他のロジック...

  return {
    board: boardState.board,
    flagsCount: boardState.flagsCount,
    gameStatus,
    minesCount,
    timer,
    revealCell,
    toggleFlag,
    resetGame: () => initializeGame(difficulty),
  };
}
```

この実装では、複雑なボード状態の操作は、クリックやフラグ設置などの操作に対してreducerを使用し、ゲームの状態やタイマーなどの単純な状態はuseStateで管理しています。

## Reducerパターンの実装

ボード操作の複雑な状態遷移を管理するためのReducer実装の一部を以下に示します：

```tsx
// reducers/boardReducer.ts

// アクションの型定義
type BoardAction = 
  | { type: 'INITIALIZE_BOARD'; payload: { board: SquareNode[][] } }
  | { type: 'PLACE_MINES'; payload: { excludeX: number, excludeY: number, count: number } }
  | { type: 'REVEAL_CELL'; payload: { x: number, y: number } }
  | { type: 'TOGGLE_FLAG'; payload: { x: number, y: number } };

// Reducerの状態
type BoardState = {
  board: SquareNode[][];
  flagsCount: number;
};
```

```tsx
// Reducer関数
export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'INITIALIZE_BOARD':
      return {
        ...state,
        board: action.payload.board,
        flagsCount: 0
      };
      
    case 'PLACE_MINES': {
      const { excludeX, excludeY, count } = action.payload;
      const newBoard = placeMinesOnBoard(state.board, count, excludeX, excludeY);
      return {
        ...state,
        board: newBoard
      };
    }
```

```tsx
    case 'REVEAL_CELL': {
      const { x, y } = action.payload;
      const cell = state.board[y][x];
      
      // 既に開いているかフラグが付いている場合は何もしない
      if (cell.isRevealed || cell.isFlagged) {
        return state;
      }
      
      // 地雷を踏んだ場合
      if (cell.isMine) {
        const newBoard = revealAllMines(state.board);
        return {
          ...state,
          board: newBoard,
          result: { hitMine: true, isComplete: false }
        };
      }
      
      // 安全なセルを開く
      const newBoard = openCell(state.board, x, y);
      
      // 勝利判定
      const isComplete = checkWinCondition(newBoard);
      
      return {
        ...state,
        board: newBoard,
        result: { hitMine: false, isComplete }
      };
    }
```

```tsx
    case 'TOGGLE_FLAG': {
      const { x, y } = action.payload;
      const board = [...state.board];
      const cell = { ...board[y][x] };
      
      // 既に開いているセルはフラグを立てられない
      if (cell.isRevealed) {
        return state;
      }
      
      // フラグの切り替え
      cell.isFlagged = !cell.isFlagged;
      board[y][x] = cell;
      
      // フラグの数を更新
      const flagsCount = countFlags(board);
      
      return {
        ...state,
        board,
        flagsCount
      };
    }
      
    default:
      return state;
  }
}
```

このreducerは、ボードの複雑な操作（初期化、地雷の配置、セルを開く、フラグの切り替え）をすべて統合的に管理しています。特に、セルを開いたときの連鎖的な開示处理や勝利条件のチェックなどの複雑なロジックをカプセル化しています。

## コンテキストを用いた状態管理

コンポーネント間でゲーム状態を共有するために、Context APIを使用します：

```tsx
// contexts/GameContext.tsx
import React, { createContext, useContext } from 'react';
import { Difficulty, GameStatus } from '../types';
import { useGame } from '../hooks/useGame';

// コンテキストの型定義
type GameContextType = ReturnType<typeof useGame>;

// GameContextの作成
const GameContext = createContext<GameContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const GameProvider: React.FC<{
  children: React.ReactNode;
  initialDifficulty?: Difficulty;
}> = ({ children, initialDifficulty = Difficulty.BEGINNER }) => {
  // useGameカスタムフックを使用して状態とロジックを取得
  const gameState = useGame(initialDifficulty);
  
  return (
    <GameContext.Provider value={gameState}>
      {children}
    </GameContext.Provider>
  );
};

// カスタムフックでコンテキストを使用する
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

```

このアプローチでは、ゲームの状態とロジックをコンテキストを通じて共有することで、コンポーネント間での状態の受け渡しが簡単になります。また、状態更新のロジックはカスタムフックに集約され、UIコンポーネントは単にコンテキストから状態を読み取り、アクションをディスパッチするだけで済みます。

## まとめ

マインスイーパーのデータモデルと状態管理は、将来の拡張性を考慮したグリッド接続モデルと、カスタムフックと部分的なreducerパターンを組み合わせた状態管理を特徴としています。これにより、コードの複雑さとメンテナンス性のバランスが取れ、機能拡張も容易になります。