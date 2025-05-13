import './globals.css'
import './styles/components.css'
// Trigger Vercel redeploy - test synchro
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Providers from './providers'
import MainLayout from './components/layout/main-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spiess TP',
  description: 'Application de gestion de chantiers pour Spiess TP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
      </body>
    </html>
  )
} 