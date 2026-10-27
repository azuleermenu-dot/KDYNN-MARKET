import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KDYNN Market | San Jose del Monte",
  description: "A modern community market for fresh goods, essentials, halal products, local vendors and phone services.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}