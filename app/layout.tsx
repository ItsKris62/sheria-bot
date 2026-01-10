// app/layout.tsx
import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { AuthProvider } from "@/lib/auth-context"
import { ChatProvider } from "@/lib/chat-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "SheriaBot - Regulatory Intelligence for Kenya",
  description:
    "The AI co-pilot for regulators and innovators. Draft policy, analyze gaps, and ensure compliance with the Data Protection Act and CBK Guidelines.",
  generator: "v0.app",
  keywords: ["Kenya", "Regulatory", "Compliance", "AI", "Legal", "CBK", "Data Protection", "Policy", "Fintech"],
  authors: [{ name: "SheriaBot" }],
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased`}>
        <AuthProvider>
          <ChatProvider>{children}</ChatProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
