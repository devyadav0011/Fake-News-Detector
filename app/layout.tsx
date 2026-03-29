import type {Metadata} from 'next';
import './globals.css';
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
const cormorant = Cormorant_Garamond({subsets:['latin'], weight: ['300', '400', '500', '600'], variable:'--font-serif'});
const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: 'VeraCT Scan',
  description: 'Combating Fake News in the Digital Age',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, cormorant.variable, jetbrainsMono.variable)}>
      <body className="bg-black text-white antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
