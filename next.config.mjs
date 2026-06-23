/** @type {import('next').NextConfig} */
const nextConfig = {
  // puppeteer-core must not be bundled by webpack/turbopack — it is loaded at
  // runtime inside the serverless function and only connects to a remote
  // browser (Browserless) over a WebSocket, so it stays well under Vercel's
  // function size limit.
  serverExternalPackages: ["puppeteer-core"],
  experimental: {
    // Allow large responses (base64 screenshots) to stream back through the
    // MCP transport without being truncated.
    largePageDataBytes: 12 * 1024 * 1024,
  },
};

export default nextConfig;
