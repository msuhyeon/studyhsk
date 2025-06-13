import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
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
    <div className="">
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-left">
          도전할 HSK 급수를 선택하세요
        </h1>
        <div className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 grid grid-cols-3 gap-4">
          {levels.map((item, index) => (
            <Button
              asChild
              className="rounded-lg p-6 text-lg"
              variant="outline"
              key={index}
            >
              <Link href={`/word/${item.link}`} className="text-center">
                {item.name}
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
