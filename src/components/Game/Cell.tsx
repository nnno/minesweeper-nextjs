import React, { useCallback, useRef, useState, TouchEvent } from 'react';
import { SquareNode } from '@/types';

// セルの色の設定
const ADJACENT_MINE_COLORS = [
  'text-transparent',     // 0: 隠す
  'text-blue-600 dark:text-blue-400',        // 1: 青
  'text-green-600 dark:text-green-500',       // 2: 緑
  'text-red-600 dark:text-red-400',         // 3: 赤
  'text-blue-800 dark:text-blue-600',        // 4: 濃い青
  'text-red-800 dark:text-red-600',         // 5: 濃い赤
  'text-cyan-600 dark:text-cyan-400',        // 6: シアン
  'text-black dark:text-white',           // 7: 黒/白
  'text-gray-600 dark:text-gray-400',        // 8: グレー
];

// プロップスの型定義
interface CellProps {
  cell: SquareNode;
  onReveal: (x: number, y: number) => void;
  onFlag: (x: number, y: number) => void;
  onChord?: (x: number, y: number) => void; // 中クリック操作用（オプション）
}

/**
 * セルコンポーネント
 * マインスイーパーの個々のセルを表示
 */
const Cell: React.FC<CellProps> = ({ cell, onReveal, onFlag, onChord }) => {
  const { x, y, isRevealed, isFlagged, isMine, adjacentMines } = cell;
  const [isPressed, setIsPressed] = useState(false);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number, y: number } | null>(null);

  // 長押し検出のためのタッチ開始時間を保持
  const touchStartTimeRef = useRef<number>(0);
  // モバイルでの操作状態を追跡
  const [isTouching, setIsTouching] = useState(false);

  // クリックイベントハンドラー - パフォーマンス最適化のためuseCallbackでメモ化
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRevealed && !isFlagged) {
      onReveal(x, y);
    }
  }, [isRevealed, isFlagged, onReveal, x, y]);

  // 右クリックイベントハンドラー
  const handleRightClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRevealed) {
      onFlag(x, y);
    }
  }, [isRevealed, onFlag, x, y]);

  // 中クリックイベントハンドラー
  const handleMiddleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isRevealed && adjacentMines > 0 && onChord) {
      onChord(x, y);
    }
  }, [isRevealed, adjacentMines, onChord, x, y]);

  // マウスダウンイベントハンドラー
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 左クリック
    if (e.button === 0) {
      setIsPressed(true);
    }
    // 右クリック
    else if (e.button === 2) {
      handleRightClick(e);
    }
    // 中クリック
    else if (e.button === 1) {
      handleMiddleClick(e);
    }
  }, [handleRightClick, handleMiddleClick]);

  // マウスアップイベントハンドラー
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    setIsPressed(false);
  }, []);

  // マウスリーブイベントハンドラー
  const handleMouseLeave = useCallback(() => {
    setIsPressed(false);
  }, []);

  // コンテキストメニュー（右クリック）イベントを防止
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // タッチ開始イベントハンドラー
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsTouching(true);
    touchStartTimeRef.current = Date.now();
    
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    
    // 長押し検出のためのタイマーをセット
    touchTimeoutRef.current = setTimeout(() => {
      if (!isRevealed) {
        onFlag(x, y);
        setIsTouching(false);
      }
    }, 500); // 500ミリ秒間の長押しでフラグを切り替え
  }, [isRevealed, onFlag, x, y]);

  // タッチ終了イベントハンドラー
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // タイマーをクリア
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    setIsTouching(false);
    
    // 短いタップ（300ms未満）ならセルを開く
    const touchDuration = Date.now() - touchStartTimeRef.current;
    if (touchDuration < 300 && !isRevealed && !isFlagged) {
      onReveal(x, y);
    }
    
    touchStartPosRef.current = null;
  }, [isRevealed, isFlagged, onReveal, x, y]);

  // タッチ移動イベントハンドラー - 大きな移動があれば長押し判定をキャンセル
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartPosRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartPosRef.current.x;
      const dy = touch.clientY - touchStartPosRef.current.y;
      
      // 10px以上の移動でタイマーをキャンセル
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
          touchTimeoutRef.current = null;
        }
      }
    }
  }, []);

  // タッチイベントのキャンセル
  const handleTouchCancel = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    setIsTouching(false);
    touchStartPosRef.current = null;
  }, []);

  // キーボード操作のサポート
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // スペースキーでセルを開く
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isRevealed && !isFlagged) {
        onReveal(x, y);
      }
    }
    // Fキーでフラグを切り替え
    else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      if (!isRevealed) {
        onFlag(x, y);
      }
    }
  }, [isRevealed, isFlagged, onReveal, onFlag, x, y]);

  // セルのコンテンツを決定
  const getCellContent = () => {
    if (isRevealed) {
      if (isMine) {
        return (
          <span className="flex items-center justify-center text-red-600 dark:text-red-400 animate-pulse">
            💣
          </span>
        );
      } else if (adjacentMines > 0) {
        // 有効なインデックス範囲内か確認（0-8）
        const colorIndex = Math.min(Math.max(0, adjacentMines), 8);
        return (
          <span className={`font-bold ${ADJACENT_MINE_COLORS[colorIndex]}`}>
            {adjacentMines}
          </span>
        );
      }
      return null;
    } else if (isFlagged) {
      return (
        <span className="flex items-center justify-center text-red-600 dark:text-red-400">
          🚩
        </span>
      );
    }
    return null;
  };

  // セルのスタイルを決定
  const getCellStyle = () => {
    let baseStyle = "flex items-center justify-center w-8 h-8 md:w-10 md:h-10 select-none border border-gray-400 dark:border-gray-600 text-center transition-colors duration-150";
    
    if (isRevealed) {
      if (isMine) {
        return `${baseStyle} bg-red-200 dark:bg-red-900`;
      }
      return `${baseStyle} bg-gray-200 dark:bg-gray-700`;
    }
    
    if (isPressed || isTouching) {
      return `${baseStyle} bg-gray-400 dark:bg-gray-600 transform scale-95`;
    }
    
    return `${baseStyle} bg-gray-300 dark:bg-gray-800 hover:bg-gray-400 dark:hover:bg-gray-700 active:bg-gray-500 dark:active:bg-gray-600 cursor-pointer`;
  };

  return (
    <div
      className={getCellStyle()}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchCancel}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={
        isRevealed
          ? isMine
            ? "地雷"
            : adjacentMines > 0
              ? `隣接する地雷: ${adjacentMines}`
              : "空白マス"
          : isFlagged
            ? "フラグ"
            : "未開封"
      }
      aria-pressed={isRevealed}
      data-revealed={isRevealed ? "true" : "false"}
      data-flagged={isFlagged ? "true" : "false"}
      data-mine={isMine ? "true" : "false"}
      data-x={x}
      data-y={y}
    >
      {getCellContent()}
    </div>
  );
};

// メモ化によるパフォーマンス最適化
export default React.memo(Cell);