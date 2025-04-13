/**
 * マインスイーパーのデータモデルと型定義
 * 
 * このファイルでは、マインスイーパーゲームのコアとなるデータ構造と型定義を提供します。
 * 設計の特徴として、マインスイーパーを「ノードとエッジからなるネットワーク構造」として
 * 抽象化することで、将来的に六角形や三角形などの異なるグリッド形状に拡張できるようにしています。
 */

/**
 * 座標インターフェース - グリッド形状に依存しない抽象インターフェース
 * 将来の拡張性のために、特定の実装に依存しない抽象インターフェースとして定義
 */
export interface Coordinate {
  // 実装に応じたプロパティが拡張される
}

/**
 * 正方形グリッド用の座標実装
 */
export interface SquareCoordinate extends Coordinate {
  x: number; // X座標
  y: number; // Y座標
}

/**
 * ゲームの難易度設定
 */
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERT = 'expert',
  CUSTOM = 'custom'
}

/**
 * 難易度ごとのゲーム設定
 */
export interface GameSettings {
  rows: number;  // 行数
  cols: number;  // 列数
  mines: number; // 地雷数
}

/**
 * マスの状態を表す列挙型
 */
export enum CellState {
  CLOSED = 'closed',   // 未開封
  OPENED = 'opened',   // 開封済み
  FLAGGED = 'flagged', // フラグ付き
}

/**
 * ゲームの進行状態を表す列挙型
 */
export enum GameStatus {
  READY = 'ready',     // 初期状態（最初のクリック前）
  PLAYING = 'playing', // プレイ中
  WON = 'won',         // 勝利
  LOST = 'lost',       // 敗北
}

/**
 * ノード（セル）インターフェース - グリッド形状に依存しない抽象インターフェース
 */
export interface INode {
  id: string;            // ユニークな識別子
  isMine: boolean;       // 地雷かどうか
  isRevealed: boolean;   // 開いたかどうか
  isFlagged: boolean;    // フラグが立てられているか
  adjacentMines: number; // 隣接する地雷の数
}

/**
 * 正方形グリッド用のノード実装
 */
export interface SquareNode extends INode {
  x: number;  // X座標
  y: number;  // Y座標
}

/**
 * グリッドインターフェース - 異なるグリッド形状を抽象化
 * ジェネリック型パラメータTはINodeを拡張した型を指定
 */
export interface IGrid<T extends INode> {
  /**
   * 指定されたIDのノードを取得
   * @param id ノードID
   * @returns ノードまたはundefined
   */
  getNode(id: string): T | undefined;
  
  /**
   * 指定されたノードに隣接するノードを取得
   * グリッド形状による隣接ノードの違いをここでカプセル化
   * @param nodeId ノードID
   * @returns 隣接ノードの配列
   */
  getAdjacentNodes(nodeId: string): T[];
  
  /**
   * グリッド内のすべてのノードを取得
   * @returns すべてのノードの配列
   */
  getAllNodes(): T[];
  
  /**
   * グリッドを生成
   * @param params グリッド生成に必要なパラメータ
   */
  generateGrid(params: any): void;
  
  /**
   * 地雷を配置
   * @param count 配置する地雷の数
   * @param excludedNodeId 地雷を配置しないノードのID（最初のクリック位置）
   */
  placeMines(count: number, excludedNodeId?: string): void;
}

/**
 * ゲーム全体の状態を表すインターフェース
 */
export interface GameState {
  status: GameStatus;       // ゲームの状態
  difficulty: Difficulty;    // 難易度
  settings: GameSettings;    // ゲーム設定
  minesCount: number;        // 総地雷数
  flagsCount: number;        // 設置されたフラグの数
  timer: number;             // タイマー
  firstClick: boolean;       // 最初のクリックかどうか
}

/**
 * ボードReducerの状態
 */
export interface BoardState {
  board: SquareNode[][];  // 2次元配列のボード
  flagsCount: number;     // 設置されたフラグの数
}

/**
 * ボードReducerのアクション型
 */
export type BoardAction = 
  | { type: 'INITIALIZE_BOARD'; payload: { board: SquareNode[][] } }
  | { type: 'PLACE_MINES'; payload: { excludeX: number, excludeY: number, count: number } }
  | { type: 'REVEAL_CELL'; payload: { x: number, y: number } }
  | { type: 'TOGGLE_FLAG'; payload: { x: number, y: number } };

/**
 * セルをクリックした結果
 */
export interface CellActionResult {
  hitMine: boolean;   // 地雷をヒットしたか
  isComplete: boolean; // ゲームがクリアされたか
}