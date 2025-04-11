import Link from 'next/link';
import { Container } from '@/components/ui/container';

export function Header() {
  return (
    <header className="py-4 sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 text-transparent bg-clip-text">
              Beauty AI
            </h1>
          </Link>
          {/* Optional: Add navigation links here */}
        </div>
      </Container>
    </header>
  );
} 