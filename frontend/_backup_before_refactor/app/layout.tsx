import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { SiteNotifications } from "@/components/ui/site-notifications";

export const metadata: Metadata = {
  title: "RoboRoot - Robotics Components & DIY Projects Marketplace",
  description: "Your one-stop destination for robotics components and DIY projects. Browse projects, shop components, and build amazing things.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <QueryProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster />
          <SiteNotifications />
          <CookieConsent />
        </QueryProvider>
      </body>
    </html>
  );
}
