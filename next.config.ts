import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["http://172.19.0.1:3000"],
  images: {
    // Разрешаем любые HTTPS-источники — необходимо для admin-панели,
    // где администраторы вставляют произвольные URL изображений товаров,
    // новостных баннеров и логотипов заведений.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

