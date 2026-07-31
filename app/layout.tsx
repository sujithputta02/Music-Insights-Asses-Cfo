import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Music Insights - Discover and Analyze Your Music Taste",
  description: "A premium music catalog platform powered by iTunes API with AI-driven insights and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-canvas">
        {/* Ambient Background */}
        <div className="ambient-bg" />
        
        {/* Navigation */}
        <Navigation />
        
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-border py-8 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-text-muted font-mono">
              Music Insights Platform · Built with Next.js & iTunes API
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
