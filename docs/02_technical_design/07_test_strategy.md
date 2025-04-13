# テスト戦略

# マインスイーパー テスト戦略

このドキュメントでは、マインスイーパーゲームプロジェクトのテスト戦略について詳細に説明します。品質の高いアプリケーションを提供するために、複数のレベルでテストを実施し、自動化を活用します。

## テスト戦略の概要

マインスイーパーは主にクライアントサイドで動作するゲームであり、複雑なゲームロジックとユーザーインターフェースを持ちます。テスト戦略は以下の原則に基づいています：

- **ロジックとUIの分離テスト** - コアゲームロジックとUI要素を分離してテストし、責任領域を明確にします
- **自動テストの活用** - CI/CDパイプラインでの自動テストを実施し、継続的な品質確保を目指します
- **テストピラミッドの採用** - 単体テスト、統合テスト、E2Eテストのバランスを取り、効率的なテスト体制を構築します
- **エッジケースのカバレッジ** - ゲームの特性上重要となる境界条件やエッジケースを重点的にテストします

## テストの層と適用技術

テストピラミッドモデルに基づいて、以下のテスト層を実装します：

### 1. 単体テスト (Unit Tests)

個々の関数、メソッド、クラスを単位としてテストします。特に以下に重点を置きます：

- コアゲームロジックのテスト（ボード生成、地雷配置、セルの公開ロジック、反応連鎖アルゴリズムなど）
- データモデルのテスト（タイプ定義の整合性、状態遷移など）
- ユーティリティ関数のテスト（ヘルパー関数やカスタムフックなど）

使用ツール： Jest

```tsx
// gameHelpers.test.ts
import { countAdjacentMines, revealCell, toggleFlag } from '../utils/gameHelpers';

describe('Game Helper Functions', () => {
  describe('countAdjacentMines', () => {
    it('should correctly count adjacent mines', () => {
      const board = [
        [{ isMine: true }, { isMine: false }],
        [{ isMine: false }, { isMine: true }]
      ];
      expect(countAdjacentMines(board, 0, 1)).toBe(2);
    });
  });

  describe('revealCell', () => {
    it('should reveal a single cell when clicked', () => {
      const board = [
        [{ isMine: false, isRevealed: false, adjacentMines: 1 }]
      ];
      const result = revealCell(board, 0, 0);
      expect(result.board[0][0].isRevealed).toBe(true);
    });

    it('should trigger game over when revealing a mine', () => {
      const board = [
        [{ isMine: true, isRevealed: false }]
      ];
      const result = revealCell(board, 0, 0);
      expect(result.hitMine).toBe(true);
    });
  });
});
```

### 2. 統合テスト (Integration Tests)

複数のコンポーネントやモジュールが連携して動作する様子をテストします：

- ゲームロジックとコンテキストの統合
- カスタムフックとコンポーネントの連携
- コンポーネント間のイベント伝播

使用ツール： Jest + React Testing Library

```tsx
// GameContext.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider, useGameContext } from '../contexts/GameContext';

const TestComponent = () => {
  const { board, revealCell } = useGameContext();
  return (
    <div>
      <div data-testid="cell-count">{board.flat().length}</div>
      <button data-testid="reveal-button" onClick={() => revealCell(0, 0)}>
        Reveal Cell
      </button>
    </div>
  );
};

describe('GameContext Integration', () => {
  it('should provide game state to components', () => {
    render(
      <GameProvider difficulty="beginner">
        <TestComponent />
      </GameProvider>
    );
    
    expect(screen.getByTestId('cell-count')).toHaveTextContent('81'); // 9x9 beginner board
  });

  it('should allow interaction with game state', () => {
    render(
      <GameProvider difficulty="beginner">
        <TestComponent />
      </GameProvider>
    );
    
    fireEvent.click(screen.getByTestId('reveal-button'));
    // Test that game state updated appropriately
  });
});
```

- **コアゲームロジック**: 90％以上のカバレッジ
- **ユーティリティ関数とカスタムフック**: 85％以上のカバレッジ
- **UIコンポーネント**: 80％以上のカバレッジ
- **E2Eテスト**: 主要ユーザーフローの完全カバレッジ

### CI/CDパイプラインとの統合

テストを自動化し、開発プロセスに統合するための計画：

- **GitHub Actionsを使用した自動テスト**

```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
    - run: npm ci
    - run: npm run lint
    - run: npm test
    - name: Upload test coverage
      uses: actions/upload-artifact@v3
      with:
        name: coverage
        path: coverage/

  e2e:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        cache: 'npm'
    - run: npm ci
    - name: Cypress run
      uses: cypress-io/github-action@v5
      with:
        build: npm run build
        start: npm start
```

- **プルリクエストとマージのプロセス**
- 全てのプルリクエストでテストの通過を必須条件とする
- コードカバレッジレポートを自動生成
- mainブランチへのマージ前にすべてのテストを実行

### エッジケースと特殊シナリオのテスト

マインスイーパーの特性上、以下のエッジケースシナリオに特に注意してテストします：

- **初回クリックでの地雷配置** - 初回クリックしたセルには地雷が配置されないことを確認
- **大規模なカスケード効果** - 大きな空白部分をクリックした際の複数セルの連鎖的な公開のパフォーマンスと正確性
- **タイマーと状態管理** - ゲーム中のタイマーの動作・停止、リセットが適切であること
- **フラグ管理と地雷カウンター** - フラグを立てる、解除する際の地雷カウンターの更新が正しいこと
- **勝利判定条件** - 地雷以外のすべてのセルが公開された時の勝利確定ロジックが正しく動作すること

## モックとテストデータ

テストの信頼性と再現性を確保するために、以下のストラテジーを采用します：

- **固定パターンのボードデータ** - 特定のテストケース用に、地雷の配置が既知のボードを作成
- **乱数生成のモック** - 地雷配置の乱数生成をモック化し、テストの再現性を確保
- **タイマーのモック** - setIntervalやsetTimeoutをモック化し、時間経過に依存しないテストを実現
- **ローカルストレージのモック** - 状態保存のテストのためにlocalStorageのモック実装

## テスト計画の実装スケジュール

テスト戦略は以下のスケジュールで段階的に実装します：

1. **フェーズ1: コアロジックのテスト基盤整備**
- テスト環境のセットアップ（Jest、React Testing Library）
- コアゲームロジックの単体テスト実装
1. **フェーズ2: UIコンポーネントと統合テスト**
- 個々のUIコンポーネントのテスト実装
- コンテキストとフックの統合テスト
1. **フェーズ3: E2EテストとCI/CD統合**
- E2Eテスト環境のセットアップ（CypressまたはPlaywright）
- 主要ユーザーフローのE2Eテスト実装
- GitHub Actionsとの統合
1. **フェーズ4: 継続的な改善とカバレッジ拡大**
- テストカバレッジの分析と弱点の特定
- 追加的なエッジケースのテスト実装
- パフォーマンステストの導入

## 結論

本テスト戦略はマインスイーパープロジェクトの品質、信頼性、保守性を確保するための包括的なアプローチを提供します。テストピラミッドモデルに従い、単体テストからE2Eテストまでの各レベルでのテストを実装し、自動化を通じて開発プロセスに完全に統合します。

特にゲームロジックの正確性とエッジケースの処理に重点を置き、ユーザーにスムーズで業界標準のマインスイーパー体験を提供することを目指します。

テストは開発と同時進行で行い、新機能の追加や既存機能の変更を安全に、自信を持って行えるようにします。