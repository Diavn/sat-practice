import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold">SAT Practice</Link>
            <div className="flex items-center gap-4">
              <Link href="/practice/rw" className="text-sm">Reading &amp; Writing</Link>
              <Link href="/practice/math" className="text-sm">Math</Link>
              <Link href="/review" className="text-sm">Review</Link>
              <Link href="/admin" className="text-sm font-semibold">Admin</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-gray-200 py-6 mt-10">
          <div className="max-w-6xl mx-auto px-4 text-xs text-gray-500">
            Built for digital SAT practice. Timers and counts align with College Board public specs.
          </div>
        </footer>
      </body>
    </html>
  );
}
