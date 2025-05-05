// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-black shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-4xl font-bold text-blue-500">
            Bird watching around the world 2025-05-04 &#40; •`►
          </Link>

          {/* Links */}
          <div className="space-x-6 hidden md:flex">
            <Link href="/" className="text-green-200 hover:text-blue-600">
              Git-Hub
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
