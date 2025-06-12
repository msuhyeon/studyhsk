import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClientUserProvider from '@/components/ClientUserProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HSKPass',
  description: 'HSK에 합격하기 위해 직접 만드는 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`flex flex-col min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientUserProvider />
        <Header />
        <main className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
