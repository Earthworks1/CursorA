import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './app/components'),
      '@/lib': path.resolve(__dirname, './app/lib'),
      '@/types': path.resolve(__dirname, './app/types'),
    };
    return config;
  },
  experimental: {
    esmExternals: true,
  },
  // Assurez-vous que Next.js traite correctement les fichiers CSS
  transpilePackages: ['@radix-ui/react-icons'],
  // Optimisations pour le build
  swcMinify: true,
  // Désactive le cache en développement pour éviter les problèmes de styles
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;