
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Orbitron, Lora } from "next/font/google"
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontDisplay = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
});

const fontSerif = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
});


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
          fontSans.variable,
          fontDisplay.variable,
          fontSerif.variable
        )}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
