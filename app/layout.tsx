import type React from "react"
import "./globals.css"

import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

const sourceSerif = Source_Serif_4({
  weight: ["200","300","400","500","600","700","800","900"],
  variable: "--font-source-serif",
  subsets: ["latin"],
})

export const metadata = {
  title: "PicPopper - Share Your World",
  description: "The ultimate photo and video sharing platform",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${sourceSerif.variable} dark`}
    >
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
