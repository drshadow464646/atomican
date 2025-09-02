
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google"
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { SettingsProvider } from '@/hooks/use-settings';

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: 'LabSphere: Virtual Chemistry Laboratory',
  description: 'An interactive virtual chemistry laboratory for students to learn and experiment.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}>
        <SettingsProvider>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
