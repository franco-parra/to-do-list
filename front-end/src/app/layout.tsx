import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus Flow",
  description: "Enfócate en lo que importa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
