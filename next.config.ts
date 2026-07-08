import type { NextConfig } from "next";
import {
  getAdminDiscountPublicRouteSegments,
  INTERNAL_DISCOUNT_MANAGEMENT_PATH,
} from "./lib/utils/admin-discount-route";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const backendRewrite = {
      source: "/backend/:path*",
      destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/:path*`,
    };

    const publicRoute = getAdminDiscountPublicRouteSegments(
      process.env.ADMIN_DISCOUNT_ROUTE
    );

    if (publicRoute === INTERNAL_DISCOUNT_MANAGEMENT_PATH) {
      return [backendRewrite];
    }

    return [
      backendRewrite,
      {
        source: `/${publicRoute}`,
        destination: `/internal/discount-management`,
      },
      {
        source: `/${publicRoute}/:path*`,
        destination: `/internal/discount-management/:path*`,
      },
    ];
  },
};

export default nextConfig;
