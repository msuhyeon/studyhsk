import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClientUserProvider from '@/components/ClientUserProvider';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from './providers';

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
        <Providers>
          <ClientUserProvider />
          <Header />
          <main className="w-full flex flex-1 flex-col">{children}</main>
          <Footer />
          <Toaster position="top-right" expand={true} richColors />
        </Providers>
      </body>
    </html>
  );
}
