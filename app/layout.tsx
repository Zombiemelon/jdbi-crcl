import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'crcl.',
  description: 'Trust-based recommendations within personal circles.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
