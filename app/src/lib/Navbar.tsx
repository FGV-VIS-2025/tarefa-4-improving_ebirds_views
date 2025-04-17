// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-blue-600">
            MeuSite
          </Link>

          {/* Links */}
          <div className="space-x-6 hidden md:flex">
            <Link href="/" className="hover:text-blue-600">
              Root
            </Link>
            <Link href="/aboult" className="hover:text-blue-600">
              Aboult
            </Link>
            <Link href="/aedv" className="hover:text-blue-600">
              AEDV
            </Link>
          </div>

          {/* Botão responsivo (exemplo simplificado) */}
          <div className="md:hidden">
            <button className="text-blue-600 focus:outline-none">
              ☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
