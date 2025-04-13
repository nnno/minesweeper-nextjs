import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { CellActionResult, Difficulty, GameSettings, GameStatus, SquareNode } from '../types';
import { DIFFICULTY_SETTINGS, createEmptyBoard } from '../utils/gameHelpers';
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

    // 勝利条件チェック - 全ての非地雷セルが開かれている場合
    // boardState.boardは最新ではないので、直接チェックできない
    // 代わりに、非地雷セルの数と開かれたセルの数を比較する簡易的な方法を使用
    const totalNonMineCells = settings.rows * settings.cols - minesCount;
    let revealedNonMineCells = 0;
    
    // 開かれたセルをカウント（現在のboardStateに基づく）
    for (let ry = 0; ry < boardState.board.length; ry++) {
      for (let rx = 0; rx < boardState.board[0].length; rx++) {
        if (boardState.board[ry][rx].isRevealed && !boardState.board[ry][rx].isMine) {
          revealedNonMineCells++;
        }
      }
    }
    
    // 新しく開いたセルも含める（現在の操作で開かれるセル）
    if (!currentCell.isMine) {
      revealedNonMineCells++;
    }

    // 勝利条件チェック（簡易版）
    if (revealedNonMineCells >= totalNonMineCells) {
      setStatus(GameStatus.WON);
    }
  }, [status, isFirstClick, minesCount, boardState.board, settings.rows, settings.cols]);

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
    resetGame: () => resetGame(),
    changeDifficulty
  };
}