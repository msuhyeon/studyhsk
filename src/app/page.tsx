import { HeroSection } from '@/features/home/HeroSection';

export default function Home() {
  return (
    <section className="text-center w-full mx-auto">
      <HeroSection />
      {/* <h1 className="text-3xl font-bold mb-4 text-left">
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
        </div> */}
    </section>
  );
}
