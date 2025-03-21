import React from 'react';
import Link from 'next/link';
import { UserCircle, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SiteHeaderProps {
  isLoggedIn?: boolean;
  className?: string;
}

export function SiteHeader({ isLoggedIn = false, className }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={cn('border-b bg-background sticky top-0 z-50 w-full', className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-lg md:text-xl flex items-center">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-md mr-2 bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs md:text-sm">
              BB
            </div>
            <span className="hidden sm:inline">Body Bliss Visio</span>
            <span className="sm:hidden">BBV</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link href="/services" className="text-sm font-medium hover:text-primary transition-colors">
            Services
          </Link>
          <Link href="/clinics" className="text-sm font-medium hover:text-primary transition-colors">
            Clinics
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center gap-2 lg:gap-4 pl-2 lg:pl-4 border-l border-gray-200">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="icon" aria-label="User Profile" className="h-8 w-8">
                  <UserCircle className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 lg:gap-4 pl-2 lg:pl-4 border-l border-gray-200">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm h-8">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="text-sm h-8">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-background shadow-lg border-b z-40">
          <nav className="container mx-auto py-4 px-4 flex flex-col space-y-3 max-w-7xl">
            <Link 
              href="/services" 
              className="text-sm font-medium px-2 py-1.5 hover:bg-gray-50 rounded hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              href="/clinics" 
              className="text-sm font-medium px-2 py-1.5 hover:bg-gray-50 rounded hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Clinics
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium px-2 py-1.5 hover:bg-gray-50 rounded hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="text-sm font-medium px-2 py-1.5 hover:bg-gray-50 rounded hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            <div className="border-t my-2 pt-2"></div>
            
            {isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium px-2 py-1.5 hover:bg-gray-50 rounded hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="text-sm font-medium px-2 py-1.5 hover:bg-gray-50 rounded hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
} 