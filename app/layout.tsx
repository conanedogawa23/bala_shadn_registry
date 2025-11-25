import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import NavigationWrapper from "@/components/navigation-wrapper";
import { ClinicProvider } from "@/lib/contexts/clinic-context";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true
});

export const metadata: Metadata = {
  title: "Body Bliss Management System",
  description: "Comprehensive management system for Body Bliss clients and appointments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(inter.className, "min-h-screen bg-slate-50 flex flex-col")}>
        <ClinicProvider>
          <NavigationWrapper />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </ClinicProvider>
      </body>
    </html>
  );
}
