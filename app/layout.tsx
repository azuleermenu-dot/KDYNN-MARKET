import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KDYNN Market | San Jose del Monte",
  description: "Explore KDYNN Market, discover local goods and use an interactive 3D concept map to browse provisional stall availability.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}