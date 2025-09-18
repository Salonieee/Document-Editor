import type React from "react"
import type { Metadata } from "next"
import {
  Inter,
  Libre_Baskerville,
  JetBrains_Mono,
  Lora,
  Dancing_Script,
  Fredoka as Fredoka_One,
  Orbitron,
  Creepster,
} from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
})

const fredokaOne = Fredoka_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fredoka-one",
  display: "swap",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
})

const creepster = Creepster({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-creepster",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Collaborative Document Editor",
  description: "Real-time collaborative document editing inspired by MS Word",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${libreBaskerville.variable} ${jetbrainsMono.variable} ${lora.variable} ${dancingScript.variable} ${fredokaOne.variable} ${orbitron.variable} ${creepster.variable} font-sans`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
