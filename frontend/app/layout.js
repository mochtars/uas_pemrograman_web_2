import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "Roti Ben-oi | Toko Roti Online",
  description: "UAS Pemrograman Web 2 - Toko Roti Online Full-Stack",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geist.className} bg-stone-100 min-h-screen antialiased`}>
        <nav className="bg-stone-900 text-stone-100 shadow-lg sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold flex items-center gap-2">
              <span>🍞</span> Roti Ben-oi
            </Link>
            <div className="flex gap-1 text-sm">
              <Link href="/" className="px-3 py-2 rounded-lg hover:bg-stone-700 transition">
                Menu
              </Link>
              <Link href="/produk" className="px-3 py-2 rounded-lg hover:bg-stone-700 transition">
                Kelola Produk
              </Link>
              <Link href="/pesanan" className="px-3 py-2 rounded-lg hover:bg-stone-700 transition">
                Pesanan
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center text-stone-400 text-sm py-6">
          UAS Pemrograman Web 2 · Beni Mochtar Samiraharja · TIF K 23B · UTB
        </footer>
      </body>
    </html>
  );
}
