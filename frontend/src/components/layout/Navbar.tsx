import Link from 'next/link';
import { Globe, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/20 bg-white/60 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/60 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-red-500" />
            <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              UrbanChill <span className="text-red-500">AI</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">Features</Link>
            <Link href="#solutions" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">Solutions</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/dashboard" className="rounded-full bg-red-500 px-5 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
              Get Started
            </Link>
          </div>

          <button 
            className="md:hidden p-2 text-slate-600 dark:text-slate-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/20 dark:border-slate-800/50 bg-white dark:bg-slate-950 px-4 py-4 space-y-4">
          <Link href="#features" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Features</Link>
          <Link href="#solutions" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Solutions</Link>
          <Link href="#pricing" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Pricing</Link>
          <div className="pt-4 flex flex-col gap-2 border-t border-slate-200/20 dark:border-slate-800/50">
            <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300">Log in</Link>
            <Link href="/dashboard" className="text-sm font-medium text-red-500">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
