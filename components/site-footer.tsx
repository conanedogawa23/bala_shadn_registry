import React from 'react';
import Link from 'next/link';
import { PhoneCall, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-slate-900 text-slate-200', className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="font-bold text-xl flex items-center mb-4">
              <div className="h-8 w-8 rounded-md mr-2 bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white">
                BB
              </div>
              <span className="text-white">Body Bliss Visio</span>
            </Link>
            <p className="text-slate-400 mb-6 text-sm md:text-base max-w-md lg:max-w-full">
              Your journey to wellness and vitality starts with us. We provide comprehensive
              health and wellness services to help you live your best life.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-base md:text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li>
                <Link href="/services" className="text-slate-400 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/clinics" className="text-slate-400 hover:text-white transition-colors">
                  Clinics
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-semibold text-white text-base md:text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm md:text-base">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-slate-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400">
                  123 Main Street<br />
                  Wellness City, WS 12345
                </span>
              </li>
              <li className="flex items-center">
                <PhoneCall className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                <a href="tel:+15551234567" className="text-slate-400 hover:text-white transition-colors">
                  (555) 123-4567
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                <a href="mailto:info@bodyblissvisio.com" className="text-slate-400 hover:text-white transition-colors">
                  info@bodyblissvisio.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-white text-base md:text-lg mb-4">Newsletter</h3>
            <p className="text-slate-400 mb-4 text-sm md:text-base">
              Subscribe to our newsletter for the latest news and exclusive offers.
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-slate-800 border-slate-700 text-white h-10"
              />
              <Button className="w-full h-10">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 md:mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-xs md:text-sm mb-4 md:mb-0 text-center md:text-left">
            &copy; {currentYear} Body Bliss Visio. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-xs md:text-sm">
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-slate-400 hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 