import { Difficulty, GameSettings, SquareNode } from '../types';

/**
 * 難易度に基づくゲーム設定
 */
export const DIFFICULTY_SETTINGS: Record<Difficulty, GameSettings> = {
  [Difficulty.BEGINNER]: {
    rows: 9,
    cols: 9,
    mines: 10
  },
  [Difficulty.INTERMEDIATE]: {
    rows: 16,
    cols: 16,
    mines: 40
  },
  [Difficulty.EXPERT]: {
    rows: 16,
    cols: 30,
    mines: 99
  },
  [Difficulty.CUSTOM]: {
    rows: 0,  // カスタムの場合は別途設定が必要
    cols: 0,
    mines: 0
  }
};

/**
 * 空のグリッドを作成
 * @param difficulty 難易度
 * @param customSettings カスタム設定（難易度がCUSTOMの場合に使用）
 * @returns 初期化されたボード（2次元配列）
 */
export function createEmptyBoard(difficulty: Difficulty, customSettings?: GameSettings): SquareNode[][] {
  const settings = difficulty === Difficulty.CUSTOM 
    ? customSettings! 
    : DIFFICULTY_SETTINGS[difficulty];
  
  const { rows, cols } = settings;
  const board: SquareNode[][] = [];
  
  for (let y = 0; y < rows; y++) {
    const row: SquareNode[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        id: `${x},${y}`,
        x,
        y,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0
      });
    }
    board.push(row);
  }
  
  return board;
}

/**
 * ボードに地雷を配置する
 * @param board 地雷を配置するボード
 * @param count 配置する地雷の数
 * @param excludeX 地雷を配置しないX座標（最初のクリック位置）
 * @param excludeY 地雷を配置しないY座標（最初のクリック位置）
 * @returns 地雷配置後の新しいボード
 */
export function placeMinesOnBoard(
  board: SquareNode[][], 
  count: number, 
  excludeX: number, 
  excludeY: number
): SquareNode[][] {
  const rows = board.length;
  const cols = board[0].length;
  
  // 新しいボードのクローンを作成
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  // 地雷を配置できる候補位置を集める (最初のクリックセルとその周囲を除く)
  const candidates: {x: number, y: number}[] = [];
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // 最初のクリック位置からの距離を計算
      const dx = Math.abs(x - excludeX);
      const dy = Math.abs(y - excludeY);
      
      // 最初のクリックから1マス以上離れているか確認
      if (dx > 1 || dy > 1) {
        candidates.push({ x, y });
      }
    }
  }
  
  // シャッフルしてランダムな配置を保証
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  
  // 地雷を配置
  const mineCount = Math.min(count, candidates.length);
  for (let i = 0; i < mineCount; i++) {
    const { x, y } = candidates[i];
    newBoard[y][x].isMine = true;
  }
  
  // 隣接地雷数を計算
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!newBoard[y][x].isMine) {
        newBoard[y][x].adjacentMines = countAdjacentMines(newBoard, x, y);
      }
    }
  }
  
  return newBoard;
}

/**
 * 隣接する地雷の数をカウント
 * @param board ボード
 * @param x X座標
 * @param y Y座標
 * @returns 隣接する地雷の数
 */
export function countAdjacentMines(board: SquareNode[][], x: number, y: number): number {
  const rows = board.length;
  const cols = board[0].length;
  let count = 0;
  
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && board[ny][nx].isMine) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * セルを開く处理
 * @param board ボード
 * @param x X座標
 * @param y Y座標
 * @returns 更新されたボード
 */
export function openCell(board: SquareNode[][], x: number, y: number): SquareNode[][] {
  const rows = board.length;
  const cols = board[0].length;
  
  // 範囲外の場合または既に開いているかフラグなら何もしない
  if (x < 0 || x >= cols || y < 0 || y >= rows || 
      board[y][x].isRevealed || board[y][x].isFlagged) {
    return board;
  }
  
  // ボードのクローンを作成
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  // セルを開く
  newBoard[y][x].isRevealed = true;
  
  // 地雷の場合は開いただけで終了
  if (newBoard[y][x].isMine) {
    return newBoard;
  }
  
  // 隣接する地雷が0の場合は再帰的に開く
  if (newBoard[y][x].adjacentMines === 0) {
    // 全方向チェック
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        // 範囲内で未開封のセルを再帰的に開く
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && 
            !newBoard[ny][nx].isRevealed && !newBoard[ny][nx].isFlagged) {
          // 再帰的に開く
          const updatedBoard = openCell(newBoard, nx, ny);
          // 更新されたボードを使って続ける
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              newBoard[r][c] = updatedBoard[r][c];
            }
          }
        }
      }
    }
  }
  
  return newBoard;
}

/**
 * 全地雷を開く（敗北時）
 * @param board ボード
 * @returns 全地雷を表示したボード
 */
export function revealAllMines(board: SquareNode[][]): SquareNode[][] {
  return board.map(row => row.map(cell => ({
    ...cell,
    isRevealed: cell.isMine ? true : cell.isRevealed
  })));
}

/**
 * 勝利条件のチェック
 * @param board ボード
 * @returns 勝利条件を満たしているかどうか
 */
export function checkWinCondition(board: SquareNode[][]): boolean {
  // 地雷以外の全てのセルが開かれていれば勝利
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      const cell = board[y][x];
      if (!cell.isMine && !cell.isRevealed) {
        return false; // まだ開いていない非地雷セルがある
      }
    }
  }
  
  return true; // 全ての非地雷セルが開かれている
}

/**
 * フラグが設置されたセルの数をカウント
 * @param board ボード
 * @returns フラグが設置されたセルの数
 */
export function countFlags(board: SquareNode[][]): number {
  let count = 0;
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      if (board[y][x].isFlagged) {
        count++;
      }
    }
  }
  return count;
}