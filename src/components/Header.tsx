'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

import Login from './Login';
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const openMenu = () => {
    setShowOverlay(true);
    setTimeout(() => setIsMenuOpen(true), 10);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setTimeout(() => setShowOverlay(false), 500);
  };

  const levels = [
    {
      name: '1급',
      link: '1',
    },
    {
      name: '2급',
      link: '2',
    },
    {
      name: '3급',
      link: '3',
    },
    {
      name: '4급',
      link: '4',
    },
    {
      name: '5급',
      link: '5',
    },
    {
      name: '6급',
      link: '6',
    },
  ];

  return (
    // <div className="px-4 md:px-10 py-5 bg-white/80 backdrop-blur-md border-b border-white/50">
    <div className="px-4 md:px-10 py-5 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl md:text-3xl text-slate-800">
          <Link href="/">HSKPass</Link>
        </h1>
        {/* desktop layout */}
        <div className="hidden md:flex items-center gap-10">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>新HSK 급수</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-2 md:grid-cols-2">
                    {levels.map((item, index) => (
                      <li key={index}>
                        <NavigationMenuLink
                          href={`/word/${item.link}`}
                          className="text-center"
                        >
                          {item.name}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>퀴즈</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-2 md:grid-cols-2">
                    {levels.map((item, index) => (
                      <li key={index}>
                        <NavigationMenuLink
                          href={`/quiz/${item.link}`}
                          className="text-center"
                        >
                          {item.name}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <Login />
        </div>
        <button
          className="md:hidden text-white"
          onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {showOverlay && (
        <div
          className="w-full fixed inset-0 z-50 md:hidden transition-all duration-500"
          style={{
            backgroundColor: isMenuOpen ? 'bg-black/50' : 'transparent',
          }}
        >
          <div
            className={`fixed top-0 right-0 h-full w-80 bg-stone-700 transform transition-transform duration-500 ease-out ${
              isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-end p-4 border-b border-stone-600">
              <button
                onClick={closeMenu}
                className="text-white hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-3">新HSK 급수</h3>
                <div className="grid grid-cols-2 gap-2">
                  {levels.map((item, index) => (
                    <Link
                      key={index}
                      href={`/word/${item.link}`}
                      className="text-gray-300 hover:text-white text-center py-3 px-4 rounded bg-stone-600 hover:bg-stone-500 transition-colors"
                      onClick={closeMenu}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">퀴즈</h3>
                <div className="grid grid-cols-2 gap-2">
                  {levels.map((item, index) => (
                    <Link
                      key={index}
                      href={`/quiz/${item.link}`}
                      className="text-gray-300 hover:text-white text-center py-3 px-4 rounded bg-stone-600 hover:bg-stone-500 transition-colors"
                      onClick={closeMenu}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-stone-600">
                <Login />
              </div>
            </div>
          </div>
        </div>
      )}
      {showOverlay && (
        <div
          className="fixed inset-0 bg-transparent z-40 md:hidden"
          onClick={closeMenu}
        />
      )}
    </div>
  );
}
