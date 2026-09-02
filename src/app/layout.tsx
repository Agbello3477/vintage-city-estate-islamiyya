import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "Vintage City Estate Islamiyya | Management Portal (VCE-IMP)",
  description: "Secure, modern school management and parent portal for Vintage City Estate Islamiyya.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 min-h-screen">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
