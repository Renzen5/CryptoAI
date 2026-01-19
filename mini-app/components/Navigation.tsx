'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { hapticFeedback } from '@/lib/telegram';

const NAV_ITEMS = [
  {
    name: 'Новости',
    path: '/news',
    icon: (isActive: boolean) => (
      <svg className={`w-6 h-6 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    name: 'История',
    path: '/history',
    icon: (isActive: boolean) => (
      <svg className={`w-6 h-6 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Trade',
    path: '/',
    isMain: true,
    icon: (isActive: boolean) => (
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center -mt-6 
        transition-all duration-300
        ${isActive
          ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]'
          : 'bg-[#141b2d] border border-white/10'
        }
      `}>
        <svg className={`w-8 h-8 ${isActive ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h2l2 4 4-8 4 8 2-4h2" />
        </svg>
      </div>
    ),
  },
  {
    name: 'AI Чат',
    path: '/chat',
    icon: (isActive: boolean) => (
      <svg className={`w-6 h-6 ${isActive ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    name: 'Ещё',
    path: '/more',
    icon: (isActive: boolean) => (
      <svg className={`w-6 h-6 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const pathname = usePathname();

  const handleNavClick = () => {
    hapticFeedback.selection();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a] border-t border-white/5 pb-safe">
      <div className="flex justify-around items-end h-16 w-full max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={handleNavClick}
              className={`
                flex flex-col items-center justify-center w-full h-full pb-2
                ${item.isMain ? 'relative' : ''}
              `}
            >
              <div className="mb-1">
                {item.icon(isActive)}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
