'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Mail, Lock, User, Eye, EyeOff, Globe } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-gray-950">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-success/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-gray-900/75 backdrop-blur-2xl rounded-2xl border border-gray-700 shadow-2xl px-8 py-10">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-100">
            UrbanChill <span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Create your account</h1>
          <p className="text-gray-400 text-sm">Start analyzing urban heat patterns for any city on Earth</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input id="name" type="text" placeholder="Jane Doe" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-subtle transition-colors" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input id="email" type="email" placeholder="planner@municipality.gov" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-subtle transition-colors" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" className="w-full pl-10 pr-11 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-subtle transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role</label>
            <select id="role" className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-subtle transition-colors appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
              <option value="" className="bg-gray-900">Select your role</option>
              <option value="planner" className="bg-gray-900">Urban Planner</option>
              <option value="researcher" className="bg-gray-900">Climate Researcher</option>
              <option value="engineer" className="bg-gray-900">GIS Professional</option>
              <option value="student" className="bg-gray-900">Student / Academic</option>
              <option value="other" className="bg-gray-900">Other</option>
            </select>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary-subtle" />
            <span className="text-xs text-gray-400 leading-relaxed">
              I agree to the{' '}
              <button type="button" className="text-primary hover:text-primary-mild font-medium transition-colors">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-primary hover:text-primary-mild font-medium transition-colors">Privacy Policy</button>
            </span>
          </label>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-mild text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-150 group">
            Create Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700" /></div>
          <div className="relative flex justify-center"><span className="px-3 bg-gray-900/75 text-xs text-gray-500">or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 text-xs font-medium hover:bg-gray-700 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            GitHub
          </button>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary-mild font-semibold transition-colors">Sign in</Link>
        </p>
      </div>

      <Link href="/" className="absolute top-6 left-6 text-gray-500 hover:text-gray-100 text-xs font-medium transition-colors">Back to Home</Link>
    </div>
  );
}
