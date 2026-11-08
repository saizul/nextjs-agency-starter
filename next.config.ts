import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./src/lib/security-headers";

const isStaticExport = process.env.STATIC_EXPORT === "true";

const securityHeaders = buildSecurityHeaders({ dev: process.env.NODE_ENV === "development" });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Set STATIC_EXPORT=true to emit a fully static site into ./out.
  // Note: the contact server action and the locale proxy need a Node runtime.
  ...(isStaticExport ? { output: "export" as const, images: { unoptimized: true } } : {}),
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }),
};

export default nextConfig;
