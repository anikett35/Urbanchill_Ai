import Link from 'next/link';
import { Globe, MessageCircle, Mail, Hash } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/20 bg-white/50 dark:border-slate-800/50 dark:bg-slate-950/50 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-6 w-6 text-red-500" />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                UrbanChill <span className="text-red-500">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Geo-intelligent decision support for urban heat island mitigation. Empowering cities with data.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-slate-400 hover:text-red-500 transition-colors">
                <MessageCircle className="h-5 w-5" />
                <span className="sr-only">Social 1</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-red-500 transition-colors">
                <Hash className="h-5 w-5" />
                <span className="sr-only">Social 2</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-red-500 transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Contact</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Features</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Case Studies</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">API Reference</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">Partners</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200/20 dark:border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} UrbanChill AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
