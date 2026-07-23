import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/*", "/api/*", "/_next/*"],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || "https://rentcar.example.com"}/sitemap.xml`,
  };
}
