# コアゲームロジック

# マインスイーパーのコアゲームロジック

マインスイーパーのゲームロジックは、符号論理と将来の拡張性を考慮した設計で実装されています。ノードの作成、地雷の配置、セルを開くという基本操作が、ノードベースのグリッド設計を通じて実現されます。

## ゲームロジックの主要コンポーネント

マインスイーパーのゲームロジックは以下の主要コンポーネントから成り立っています：

1. **グリッドの初期化** - 選択された難易度に基づいてグリッドを作成
2. **地雷の配置** - 最初のクリックが安全になるように地雷をランダム配置
3. **セルを開く施策** - クリックしたセルと連鎖する空白セルを開く
4. **勝敗判定** - 勝利条件や敗北条件のチェック

## グリッドの初期化

グリッドの初期化は、選択された難易度に基づいて行われます。以下は、グリッド初期化のコード例です：

```tsx
// utils/gameHelpers.ts

// 難易度に基づくゲーム設定
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
```

```tsx
// 空のグリッドを作成
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
```

このコードでは、難易度に基づいて適切なサイズのグリッドを生成し、各セルに初期状態を設定しています。カスタム難易度の場合は、ユーザーが指定した設定を使用します。

## 地雷の配置

地雷の配置は、ユーザーが最初にクリックしたセルとその周囲を避けてランダムに配置されます。これにより、最初のクリックが常に安全になります。

```tsx
// ボードに地雷を配置する
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

// 隣接する地雷の数をカウント
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
```

この実装では、以下のステップで地雷配置を行います：

1. 最初にクリックされたセルとその周囲8マスを除外した地雷配置候補を作成
2. 候補位置をシャッフルしてランダム性を確保
3. 指定された数の地雷を配置（候補数より多い場合は安全対策あり）
4. 各セルに隣接する地雷数を計算して設定

## セルを開く処理

セルを開く処理は、マインスイーパーの最も重要な機能の一つです。セルに地雷がなく、隣接する地雷がない場合は、自動的に隣接セルも開示されます。これは再帰的な処理で実装されます。

```tsx
// セルを開く处理
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
        
        newBoard = openCell(newBoard, nx, ny);
      }
    }
  }
  
  return newBoard;
}

// 全地雷を開く（敗北時）
export function revealAllMines(board: SquareNode[][]): SquareNode[][] {
  return board.map(row => row.map(cell => ({
    ...cell,
    isRevealed: cell.isMine ? true : cell.isRevealed
  })));
}

// 勝利条件のチェック
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
```

この実装の重要なポイント：

- **再帰的な開示ロジック** - 隣接地雷が0のセルが開かれた場合、その周囲のセルも自動的に開きます
- **データ不変性の確保** - 毎回の操作で新しいボードを作成し、元のボードは変更しません
- **勝利条件のチェック** - 地雷以外のすべてのセルが開かれたときに勝利と判定
- **全地雷の表示** - 敗北時にはすべての地雷を表示する機能