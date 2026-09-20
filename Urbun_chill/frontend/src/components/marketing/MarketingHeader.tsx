'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, Globe, Sparkles } from 'lucide-react';

export default function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV_LINKS = [
    { label: 'Platform', href: '#platform' },
    { label: 'Solutions', href: '#solutions' },
    { label: 'Research', href: '#research' },
    { label: 'Docs', href: '#docs' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-50/85 backdrop-blur-md border-b border-gray-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <Globe className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gray-900">
            UrbanChill <span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">
            Sign In
          </Link>

          <Link href="/globe" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-mild text-white text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-150 group">
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-gray-900 hover:bg-gray-200/40 transition-colors" aria-label="Toggle menu" aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-gray-50 border-b border-gray-200 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-base font-medium text-gray-900 hover:bg-gray-200/40">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-gray-200 flex flex-col gap-2.5">
            <Link href="/globe" onClick={() => setMobileOpen(false)} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm">
              Launch Platform
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
