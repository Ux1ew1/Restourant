/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ["/admin/*", "/api/*", "/order/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/order"],
      },
    ],
  },
};
