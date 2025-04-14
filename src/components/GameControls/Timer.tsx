import React from 'react';

/**
 * タイマーの表示形式を整形する
 * @param time 時間（秒）
 * @returns 3桁の整形された時間文字列（例: 001, 059, 999）
 */
const formatTime = (time: number): string => {
  // 999秒を上限とする
  const cappedTime = Math.min(time, 999);
  return cappedTime.toString().padStart(3, '0');
};

interface TimerProps {
  time: number;
  className?: string;
}

/**
 * タイマー表示コンポーネント
 * ゲーム経過時間を表示するデジタル時計風のコンポーネント
 */
const Timer: React.FC<TimerProps> = ({ time, className = '' }) => {
  const displayTime = formatTime(time);
  
  return (
    <div 
      className={`bg-black text-red-500 font-mono font-bold px-2 py-1 rounded border border-gray-700 shadow-inner ${className}`}
      aria-label={`経過時間: ${time}秒`}
      role="timer"
    >
      <span className="text-xl tracking-wider">
        {displayTime}
      </span>
    </div>
  );
};

export default Timer;