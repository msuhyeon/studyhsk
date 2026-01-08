import CTASection from '@/features/home/CTASection';
import { HeroSection } from '@/features/home/HeroSection';
import PrimaryContentSection from '@/features/home/PrimaryContentSection';

export default function Home() {
  return (
    <section className="text-center w-full mx-auto">
      <HeroSection />
      <PrimaryContentSection />
      <CTASection />
    </section>
  );
}
