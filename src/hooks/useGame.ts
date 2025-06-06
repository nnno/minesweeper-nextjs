import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Difficulty, GameSettings, GameStatus, SquareNode } from '../types';
import { DIFFICULTY_SETTINGS, checkWinCondition, createEmptyBoard } from '../utils/gameHelpers';
import { boardReducer } from '../reducers/boardReducer';

export interface UseGameResult {
  board: SquareNode[][];
  status: GameStatus;
  difficulty: Difficulty;
  minesCount: number;
  flagsCount: number;
  timer: number;
  revealCell: (x: number, y: number) => void;
  toggleFlag: (x: number, y: number) => void;
  chordCell: (x: number, y: number) => void; // 追加：中クリック操作の関数
  resetGame: () => void;
  changeDifficulty: (difficulty: Difficulty, customSettings?: GameSettings) => void;
}

/**
 * マインスイーパーゲームロジックのカスタムフック
 * UI層とゲームロジックを分離するためのフック
 * 
 * @param initialDifficulty 初期難易度
 * @param customSettings カスタム設定（難易度がCUSTOMの場合）
 * @returns ゲームの状態と操作関数
 */
export function useGame(
  initialDifficulty: Difficulty = Difficulty.BEGINNER,
  customSettings?: GameSettings
): UseGameResult {
  // 単純な状態（useState）
  const [status, setStatus] = useState<GameStatus>(GameStatus.READY);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [settings, setSettings] = useState<GameSettings>(
    initialDifficulty === Difficulty.CUSTOM 
      ? customSettings! 
      : DIFFICULTY_SETTINGS[initialDifficulty]
  );
  const [minesCount, setMinesCount] = useState<number>(settings.mines);
  const [timer, setTimer] = useState<number>(0);
  const [isFirstClick, setIsFirstClick] = useState<boolean>(true);

  // 複雑な状態（useReducer）
  const [boardState, dispatch] = useReducer(boardReducer, {
    board: createEmptyBoard(difficulty, settings),
    flagsCount: 0
  });

  // タイマー処理
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // プレイ中のみタイマーを動かす
    if (status === GameStatus.PLAYING) {
      intervalId = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    // クリーンアップ関数（コンポーネントのアンマウント時やステータス変更時に実行）
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [status]);

  // ボード状態の変更を監視し、勝利条件をチェックするためのuseEffect
  useEffect(() => {
    // ゲームがプレイ中の場合のみチェック
    if (status === GameStatus.PLAYING) {
      // 勝利条件をチェック - 全ての非地雷セルが開かれているか
      const isWin = checkWinCondition(boardState.board);
      if (isWin) {
        setStatus(GameStatus.WON);
      }
    }
  }, [boardState.board, status]);

  // ゲームリセット
  const resetGame = useCallback((
    difficultyToUse: Difficulty = difficulty,
    settingsToUse: GameSettings = settings
  ) => {
    const newBoard = createEmptyBoard(difficultyToUse, settingsToUse);
    
    dispatch({
      type: 'INITIALIZE_BOARD',
      payload: { board: newBoard }
    });
    
    setStatus(GameStatus.READY);
    setTimer(0);
    setIsFirstClick(true);
    setMinesCount(settingsToUse.mines);
  }, [difficulty, settings]);

  // 難易度変更
  const changeDifficulty = useCallback((newDifficulty: Difficulty, newCustomSettings?: GameSettings) => {
    const newSettings = newDifficulty === Difficulty.CUSTOM 
      ? newCustomSettings! 
      : DIFFICULTY_SETTINGS[newDifficulty];
    
    setDifficulty(newDifficulty);
    setSettings(newSettings);
    setMinesCount(newSettings.mines);
    
    // ゲームをリセット
    resetGame(newDifficulty, newSettings);
  }, [resetGame]);

  // セルを開く
  const revealCell = useCallback((x: number, y: number) => {
    // 準備中またはプレイ中以外は何もしない
    if (status !== GameStatus.READY && status !== GameStatus.PLAYING) {
      return;
    }

    // 初回クリック時：地雷の配置とゲームスタート
    if (isFirstClick) {
      dispatch({
        type: 'PLACE_MINES',
        payload: { excludeX: x, excludeY: y, count: minesCount }
      });
      
      setIsFirstClick(false);
      setStatus(GameStatus.PLAYING);
    }

    // セルを開く前のチェック
    const currentCell = boardState.board[y][x];
    if (currentCell.isRevealed || currentCell.isFlagged) {
      return; // 既に開かれている、またはフラグがついている場合は何もしない
    }

    // 地雷を開いた場合
    if (currentCell.isMine) {
      dispatch({
        type: 'REVEAL_CELL',
        payload: { x, y }
      });
      setStatus(GameStatus.LOST);
      return;
    }

    // 安全なセルを開く
    dispatch({
      type: 'REVEAL_CELL',
      payload: { x, y }
    });
    
    // 注: 勝利条件のチェックはuseEffectで行うため、ここでは行わない
  }, [status, isFirstClick, minesCount, boardState.board]);

  // フラグを切り替える
  const toggleFlag = useCallback((x: number, y: number) => {
    // 準備中またはプレイ中以外は何もしない
    if (status !== GameStatus.READY && status !== GameStatus.PLAYING) {
      return;
    }

    dispatch({
      type: 'TOGGLE_FLAG',
      payload: { x, y }
    });
  }, [status]);

  // 中クリック操作（コード）- 隣接セルの一括オープン
  const chordCell = useCallback((x: number, y: number) => {
    // 準備中またはプレイ中以外は何もしない
    if (status !== GameStatus.PLAYING) {
      return;
    }

    const cell = boardState.board[y][x];
    
    // 開いていないセルや数字がないセルでは動作しない
    if (!cell.isRevealed || cell.adjacentMines === 0) {
      return;
    }

    // 隣接するセルを取得
    const adjacentCells: { x: number, y: number }[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        // ボード範囲内かチェック
        if (nx >= 0 && nx < boardState.board[0].length && ny >= 0 && ny < boardState.board.length) {
          adjacentCells.push({ x: nx, y: ny });
        }
      }
    }
    
    // 隣接するフラグの数をカウント
    const flaggedCount = adjacentCells.reduce((count, { x: nx, y: ny }) => {
      return boardState.board[ny][nx].isFlagged ? count + 1 : count;
    }, 0);
    
    // フラグの数が隣接地雷数と一致する場合のみ動作
    if (flaggedCount === cell.adjacentMines) {
      // フラグのないすべての隣接セルを開く
      let hitMine = false;
      
      for (const { x: nx, y: ny } of adjacentCells) {
        const adjacentCell = boardState.board[ny][nx];
        
        // フラグがなく、まだ開かれていないセルのみを開く
        if (!adjacentCell.isFlagged && !adjacentCell.isRevealed) {
          // 地雷をヒットした場合
          if (adjacentCell.isMine) {
            hitMine = true;
            dispatch({
              type: 'REVEAL_CELL',
              payload: { x: nx, y: ny }
            });
          } else {
            // 安全なセルを開く
            dispatch({
              type: 'REVEAL_CELL',
              payload: { x: nx, y: ny }
            });
          }
        }
      }
      
      // 地雷を踏んだ場合はゲームオーバー
      if (hitMine) {
        setStatus(GameStatus.LOST);
      }
    }
  }, [status, boardState.board, dispatch]); // dispatchを依存配列に追加

  // 残りの地雷数を計算（地雷総数 - フラグ数）
  const remainingMines = useMemo(() => {
    return Math.max(0, minesCount - boardState.flagsCount);
  }, [minesCount, boardState.flagsCount]);

  return {
    board: boardState.board,
    status,
    difficulty,
    minesCount: remainingMines,
    flagsCount: boardState.flagsCount,
    timer,
    revealCell,
    toggleFlag,
    chordCell, // 追加: 中クリック処理関数
    resetGame: () => resetGame(),
    changeDifficulty
  };
}