import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

