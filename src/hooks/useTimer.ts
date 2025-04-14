import { useCallback, useEffect, useState } from 'react';

/**
 * ゲーム用タイマーフック
 * 経過時間を追跡し、開始・停止・リセット機能を提供する
 */
export function useTimer(initialTime: number = 0, autoStart: boolean = false) {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  
  // タイマーを開始する
  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);
  
  // タイマーを停止する
  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  // タイマーをリセットする
  const resetTimer = useCallback((newInitialTime: number = initialTime) => {
    setTime(newInitialTime);
    setIsRunning(false);
  }, [initialTime]);
  
  // タイマーの状態を切り替える
  const toggleTimer = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  // タイマーが実行中の場合、1秒ごとにインクリメント
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isRunning) {
      intervalId = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    // クリーンアップ関数
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning]);

  return {
    time,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    toggleTimer
  };
}