import type { Metadata } from "next";
import "./globals.css";
import "./system.css";

export const metadata: Metadata = {
  title: {
    default: "Mehedi Rahat — Digital Products & Web Solutions",
    template: "%s | Mehedi Rahat",
  },
  description:
    "Premium digital products, ready themes and practical web solutions by Mehedi Rahat.",
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
