import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toaster } from '@/components';

interface AppLayoutProps {
  children: ReactNode;
  isConnected: boolean;
}

export function AppLayout({ children, isConnected }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground font-sans flex flex-col transition-colors duration-300">
      {/* Top Status Banner */}
      {!isConnected && (
        <div className="bg-destructive text-destructive-foreground text-[10px] uppercase tracking-widest py-1.5 text-center font-bold sticky top-0 z-50">
          Connection lost. Re-establishing secure uplink...
        </div>
      )}

      <Header />

      <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {children}
      </main>

      <Footer />

      <Toaster position="bottom-right" />
    </div>
  );
}
