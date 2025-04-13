import React from 'react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            &copy; {currentYear} マインスイーパー Next.js版
          </p>
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">プライバシーポリシー</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">お問い合わせ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;