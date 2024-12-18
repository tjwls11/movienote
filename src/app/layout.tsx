import Providers from '@/components/Providers'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
