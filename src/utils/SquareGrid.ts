import { GameSettings, IGrid, SquareNode } from '../types';
import { countAdjacentMines } from './gameHelpers';

/**
 * 正方形グリッドの実装クラス
 * IGrid<SquareNode>インターフェースを実装
 */
export class SquareGrid implements IGrid<SquareNode> {
  private grid: SquareNode[][] = [];
  private rows: number = 0;
  private cols: number = 0;

  /**
   * コンストラクター
   * @param settings 初期化設定
   */
  constructor(settings?: GameSettings) {
    if (settings) {
      this.generateGrid(settings);
    }
  }

  /**
   * 指定されたIDのノードを取得
   * @param id ノードID ("x,y"形式)
   * @returns ノードまたはundefined
   */
  getNode(id: string): SquareNode | undefined {
    const [x, y] = id.split(',').map(Number);
    if (
      isNaN(x) || isNaN(y) || 
      x < 0 || x >= this.cols || 
      y < 0 || y >= this.rows
    ) {
      return undefined;
    }
    return this.grid[y][x];
  }

  /**
   * 指定されたノードに隣接するノードを取得
   * @param nodeId ノードID
   * @returns 隣接ノードの配列
   */
  getAdjacentNodes(nodeId: string): SquareNode[] {
    const node = this.getNode(nodeId);
    if (!node) return [];

    const { x, y } = node;
    const adjacentNodes: SquareNode[] = [];

    // 8方向の隣接ノードをチェック
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
          adjacentNodes.push(this.grid[ny][nx]);
        }
      }
    }

    return adjacentNodes;
  }

  /**
   * グリッド内のすべてのノードを取得
   * @returns すべてのノードの配列
   */
  getAllNodes(): SquareNode[] {
    const allNodes: SquareNode[] = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        allNodes.push(this.grid[y][x]);
      }
    }
    return allNodes;
  }

  /**
   * グリッドを生成
   * @param params グリッド生成パラメータ（GameSettings）
   */
  generateGrid(params: GameSettings): void {
    const { rows, cols } = params;
    this.rows = rows;
    this.cols = cols;
    this.grid = [];

    // グリッドを初期化
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
      this.grid.push(row);
    }
  }

  /**
   * 地雷を配置
   * @param count 配置する地雷の数
   * @param excludedNodeId 地雷を配置しないノードのID（最初のクリック位置）
   */
  placeMines(count: number, excludedNodeId?: string): void {
    if (!excludedNodeId) {
      this.placeRandomMines(count);
      return;
    }

    // 除外するノードとその周囲を特定
    const excludedNode = this.getNode(excludedNodeId);
    if (!excludedNode) {
      this.placeRandomMines(count);
      return;
    }

    const { x: excludeX, y: excludeY } = excludedNode;
    
    // 地雷を配置できる候補位置を収集（除外ノードとその周囲を除く）
    const candidates: SquareNode[] = [];
    
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        // 除外ノードからの距離を計算
        const dx = Math.abs(x - excludeX);
        const dy = Math.abs(y - excludeY);
        
        // 除外ノードから1マス以上離れている場合、候補に追加
        if (dx > 1 || dy > 1) {
          candidates.push(this.grid[y][x]);
        }
      }
    }
    
    // 候補をシャッフル
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    
    // 地雷を配置
    const mineCount = Math.min(count, candidates.length);
    for (let i = 0; i < mineCount; i++) {
      const node = candidates[i];
      node.isMine = true;
    }
    
    // 隣接地雷数を計算
    this.calculateAdjacentMines();
  }

  /**
   * ランダムに地雷を配置（除外なし）
   * @param count 配置する地雷の数
   */
  private placeRandomMines(count: number): void {
    const allNodes = this.getAllNodes();
    
    // ノードをシャッフル
    for (let i = allNodes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNodes[i], allNodes[j]] = [allNodes[j], allNodes[i]];
    }
    
    // 地雷を配置
    const mineCount = Math.min(count, allNodes.length);
    for (let i = 0; i < mineCount; i++) {
      allNodes[i].isMine = true;
    }
    
    // 隣接地雷数を計算
    this.calculateAdjacentMines();
  }

  /**
   * 全ノードの隣接地雷数を計算
   */
  private calculateAdjacentMines(): void {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!this.grid[y][x].isMine) {
          this.grid[y][x].adjacentMines = countAdjacentMines(this.grid, x, y);
        }
      }
    }
  }

  /**
   * グリッドの2次元配列を取得
   * @returns グリッドの2次元配列
   */
  getGrid(): SquareNode[][] {
    return this.grid;
  }

  /**
   * ノードを開く
   * @param nodeId 開くノードのID
   * @returns 地雷に当たったかどうか
   */
  revealNode(nodeId: string): boolean {
    const node = this.getNode(nodeId);
    if (!node || node.isRevealed || node.isFlagged) {
      return false;
    }

    // ノードを開く
    node.isRevealed = true;

    // 地雷の場合
    if (node.isMine) {
      return true; // 地雷に当たった
    }

    // 隣接地雷が0の場合、周囲のノードも開く
    if (node.adjacentMines === 0) {
      const adjacentNodes = this.getAdjacentNodes(nodeId);
      for (const adjacentNode of adjacentNodes) {
        if (!adjacentNode.isRevealed && !adjacentNode.isFlagged) {
          this.revealNode(adjacentNode.id);
        }
      }
    }

    return false; // 地雷に当たっていない
  }

  /**
   * フラグを切り替える
   * @param nodeId フラグを切り替えるノードのID
   * @returns 操作が成功したかどうか
   */
  toggleFlag(nodeId: string): boolean {
    const node = this.getNode(nodeId);
    if (!node || node.isRevealed) {
      return false;
    }

    node.isFlagged = !node.isFlagged;
    return true;
  }

  /**
   * 勝利条件を満たしているかチェック
   * @returns 勝利条件を満たしているかどうか
   */
  checkWinCondition(): boolean {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const cell = this.grid[y][x];
        if (!cell.isMine && !cell.isRevealed) {
          return false; // まだ開いていない非地雷セルがある
        }
      }
    }
    return true; // 全ての非地雷セルが開かれている
  }

  /**
   * 全地雷を表示（敗北時）
   */
  revealAllMines(): void {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x].isMine) {
          this.grid[y][x].isRevealed = true;
        }
      }
    }
  }

  /**
   * フラグが設置されたセルの数をカウント
   * @returns フラグ数
   */
  countFlags(): number {
    let count = 0;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x].isFlagged) {
          count++;
        }
      }
    }
    return count;
  }
}