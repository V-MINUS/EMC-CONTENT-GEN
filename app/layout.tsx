import './globals.css'
import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EMC Content Generator - AI-powered content creation for electronic music',
  description: 'Create stunning content for electronic music events, artists, and promotions with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <meta name="theme-color" content="#0e0e14" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>EMC Content Generator | Electronic Music Council</title>
        <meta name="description" content="Generate content for the Electronic Music Council" />
      </head>
      <body className="bg-background-dark text-text-light">{children}</body>
    </html>
  )
}
