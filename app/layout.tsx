import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";

const MontserratFont = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Recall",
    default: "Recall",
  },
  description: "Альтернатива Quizlet для студентов AITU.",
  openGraph: {
    title: "Recall",
    description: "Альтернатива Quizlet для студентов AITU.",
    url: "https://recall.tallfly.me",
    siteName: "Recall",
    images: [
      {
        url: "https://recall.tallfly.me/og-image.png",
        width: 1200,
        height: 630,
        alt: "Recall",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${MontserratFont.variable} font-[Montserrat] ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MaintenanceBanner />
          <Navbar />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
