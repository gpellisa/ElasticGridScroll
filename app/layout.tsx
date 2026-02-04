import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Elastic Grid Scroll",
  description: "A smooth scrolling grid layout with elastic column effects using GSAP ScrollSmoother",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qvq2ysy.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
