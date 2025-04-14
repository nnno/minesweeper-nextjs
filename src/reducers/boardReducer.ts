import { BoardAction, BoardState, CellActionResult } from '../types';
import { checkWinCondition, countFlags, openCell, placeMinesOnBoard, revealAllMines } from '../utils/gameHelpers';

/**
 * ボードのReducer関数
 * ゲームボードの状態更新を担当
 * 
 * @param state 現在のボード状態
 * @param action 実行するアクション
 * @returns 更新されたボード状態
 */
export function boardReducer(state: BoardState, action: BoardAction): BoardState & { result?: CellActionResult } {
  switch (action.type) {
    // ボード初期化アクション
    case 'INITIALIZE_BOARD':
      return {
        ...state,
        board: action.payload.board,
        flagsCount: 0
      };
      
    // 地雷配置アクション
    case 'PLACE_MINES': {
      const { excludeX, excludeY, count } = action.payload;
      const newBoard = placeMinesOnBoard(state.board, count, excludeX, excludeY);
      return {
        ...state,
        board: newBoard
      };
    }
    
    // セルを開くアクション
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
      
      // 勝利判定（地雷以外のすべてのセルが開かれているか）
      const isComplete = checkWinCondition(newBoard);
      
      return {
        ...state,
        board: newBoard,
        result: { hitMine: false, isComplete }
      };
    }
    
    // フラグ切替アクション
    case 'TOGGLE_FLAG': {
      const { x, y } = action.payload;
      const board = state.board.map(row => [...row]);
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