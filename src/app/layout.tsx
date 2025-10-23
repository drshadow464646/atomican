import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google"
import { cn } from '@/lib/utils';
import { AppProviders } from '@/components/app-providers';

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'Atomican: Virtual Chemistry Laboratory',
  description: 'An interactive virtual chemistry laboratory for students to learn and experiment.',
  openGraph: {
    title: 'Atomican: Virtual Chemistry Laboratory',
    description: 'An interactive virtual chemistry laboratory for students to learn and experiment.',
    url: 'https://atomican.com',
    siteName: 'Atomican',
    images: [
      {
        url: 'https://atomican.com/og-image.png', // Assuming you will add an OG image here
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Atomican: Virtual Chemistry Laboratory',
    description: 'An interactive virtual chemistry laboratory for students to learn and experiment.',
    images: ['https://atomican.com/og-image.png'], // Assuming you will add an OG image here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        suppressHydrationWarning={true}
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
