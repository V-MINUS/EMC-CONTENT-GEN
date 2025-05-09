'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-background-dark/95 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            initial={{ rotate: -20 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="text-primary flex"
          >
            <Zap size={28} />
          </motion.div>
          <span className="text-xl font-bold text-text-light">
            EMC <span className="text-secondary">Generator</span>
          </span>
        </Link>
        
        <div className="md:hidden">
          <button 
            onClick={toggleMenu}
            className="text-text-light hover:text-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <nav className={`
          fixed top-[68px] left-0 right-0 bg-background-dark/95 backdrop-blur-md shadow-md transition-all duration-300 transform 
          md:static md:bg-transparent md:shadow-none md:translate-y-0 md:flex md:items-center
          ${menuOpen ? 'translate-y-0' : '-translate-y-full'}
        `}>
          <ul className="flex flex-col md:flex-row gap-2 md:gap-8 p-4 md:p-0">
            <li>
              <Link 
                href="/" 
                className="block py-2 px-4 md:px-0 text-text-light hover:text-secondary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/social-content" 
                className="block py-2 px-4 md:px-0 text-text-light hover:text-secondary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Social Media
              </Link>
            </li>
            <li>
              <Link 
                href="/video-content" 
                className="block py-2 px-4 md:px-0 text-text-light hover:text-secondary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Video Scripts
              </Link>
            </li>
            <li>
              <Link 
                href="/calendar" 
                className="block py-2 px-4 md:px-0 text-text-light hover:text-secondary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Content Calendar
              </Link>
            </li>
            <li>
              <Link 
                href="/about" 
                className="block py-2 px-4 md:px-0 text-text-light hover:text-secondary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
