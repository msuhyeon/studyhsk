import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  //   NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  //   NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
// import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from 'lucide-react';

const Header = () => {
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
    <div className="px-10 py-5 bg-stone-700 flex items-center gap-10">
      <h1 className="font-bold text-3xl text-white">
        <Link href="/">HSKPass</Link>
      </h1>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>新HSK 급수</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-2 md:grid-cols-2">
                {levels.map((item, index) => (
                  <li key={index}>
                    <NavigationMenuLink>
                      <Link href={`/word/${item.link}`} className="text-center">
                        {item.name}
                      </Link>
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
                    <NavigationMenuLink>
                      <Link href={`/quiz/${item.link}`} className="text-center">
                        {item.name}
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default Header;
