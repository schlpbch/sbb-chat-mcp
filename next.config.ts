import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Enable for Docker/Cloud Run deployment
  /* config options here */
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
