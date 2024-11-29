import localFont from "next/font/local";
import Providers from "./_providers";
import { Toaster } from "sonner";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import TRPCProvider from "./_providers/trpc-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 5,
  width: "device-width",
};

export const metadata: Metadata = {
  title: "Waves Platform",
  description: "Waves Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCProvider>
          <Providers>
            {children}
            <Toaster position='top-right' />
          </Providers>
        </TRPCProvider>
      </body>
    </html>
  );
}
