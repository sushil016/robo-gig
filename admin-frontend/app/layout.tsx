import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoboRoot Admin",
  description: "Catalog, project, and Robomaniac store admin workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
