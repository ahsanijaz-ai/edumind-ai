import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduMind | AI-Powered Learning Platform",
  description: "Master your subjects faster with EduMind. An adaptive AI tutoring platform featuring dynamic quizzes, mastery tracking, and personalized study plans.",
  keywords: ["AI Tutor", "EdTech", "E-Learning", "Study Tools", "Next.js Portfolio"],
  authors: [{ name: "EduMind Team" }],
  openGraph: {
    title: "EduMind | AI-Powered Learning Platform",
    description: "Discover firsthand the transformative impact of AI on your education.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
