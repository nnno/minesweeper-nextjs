import React from 'react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`w-full bg-white dark:bg-gray-800 shadow-sm ${className}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">マインスイーパー</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* 難易度選択は将来的に実装 */}
          <select 
            className="px-3 py-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
            aria-label="難易度選択"
            defaultValue="beginner"
          >
            <option value="beginner">初級 (9x9, 10地雷)</option>
            <option value="intermediate">中級 (16x16, 40地雷)</option>
            <option value="expert">上級 (16x30, 99地雷)</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;