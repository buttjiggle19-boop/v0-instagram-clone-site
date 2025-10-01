import type React from "react"
import "./globals.css"

import { 
  Inter, 
  JetBrains_Mono, 
  Geist as V0_Font_Geist, 
  Geist_Mono as V0_Font_Geist_Mono, 
  Source_Serif_4 as V0_Font_Source_Serif_4 
} from "next/font/google"

// ✅ Correct font initialization
const geist = V0_Font_Geist({ 
  weight: ["100","200","300","400","500","600","700","800","900"], 
  subsets: ["latin"], 
  variable: "--font-geist"
})

const geistMono = V0_Font_Geist_Mono({ 
  weight: ["100","200","300","400","500","600","700","800","900"], 
  subsets: ["latin"], 
  variable: "--font-geist-mono"
})

const sourceSerif = V0_Font_Source_Serif_4({ 
  weight: ["200","300","400","500","600","700","800","900"], 
  subsets: ["latin"], 
  variable: "--font-source-serif"
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${geist.variable} ${geistMono.variable} ${sourceSerif.variable} dark`}
    >
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
