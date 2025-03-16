import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Car Game',
  description: 'Car game created by Ifti',
  generator: 'Ifti',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
