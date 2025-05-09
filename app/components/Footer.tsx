'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Music 
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Zap size={24} className="text-purple-500" />
              <span className="text-xl font-bold">
                EMC <span className="text-purple-500">Generator</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              AI-powered content creation platform tailored for electronic music culture.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://instagram.com/electronicmusiccouncil" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={20} className="text-gray-400 hover:text-purple-500 transition-colors" />
              </a>
              <a href="https://facebook.com/emcork" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={20} className="text-gray-400 hover:text-purple-500 transition-colors" />
              </a>
              <a href="https://twitter.com/emcouncil" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Twitter size={20} className="text-gray-400 hover:text-purple-500 transition-colors" />
              </a>
              <a href="https://youtube.com/emcork" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube size={20} className="text-gray-400 hover:text-purple-500 transition-colors" />
              </a>
              <a href="https://soundcloud.com/emcork" target="_blank" rel="noopener noreferrer" aria-label="SoundCloud">
                <Music size={20} className="text-gray-400 hover:text-purple-500 transition-colors" />
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Content Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/social-content" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Social Media Content
                </Link>
              </li>
              <li>
                <Link href="/video-content" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Video Scripts
                </Link>
              </li>
              <li>
                <Link href="/seo-tools" className="text-gray-400 hover:text-purple-500 transition-colors">
                  SEO Optimization
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Music Research
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Planning</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/calendar" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Content Calendar
                </Link>
              </li>
              <li>
                <Link href="/content-ideas" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Content Ideas
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Templates
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-purple-500 transition-colors">
                  About EMC Generator
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-purple-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <Link href="/terms" className="text-gray-400 hover:text-purple-500 transition-colors">
                Terms of Service
              </Link>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Electronic Music Council. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-sm">
              Powered by AI for the electronic music community
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
