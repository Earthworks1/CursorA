import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  
  // Configuration des images
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },

  // Configurations expérimentales
  experimental: {
    esmExternals: true,
  },

  // Gestion des erreurs TypeScript et ESLint
  typescript: {
    ignoreBuildErrors: true, // Géré dans le CI
  },
  eslint: {
    ignoreDuringBuilds: true, // Géré dans le CI
  },

  // Configuration webpack avec aliases et optimisations
  webpack: (config) => {
    // Aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
      '@/components': path.resolve(__dirname, './app/components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/types': path.resolve(__dirname, './lib/types'),
    };

    // Optimisations
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
      },
    };

    return config;
  },

  // Support des packages qui nécessitent une transpilation
  transpilePackages: ['@radix-ui/react-icons'],
  
  // Optimisations de build
  swcMinify: true,
  
  // Configuration du cache en développement
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;