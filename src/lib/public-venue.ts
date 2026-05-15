import { prisma } from "@/lib/prisma";

export async function getPublicVenueBySlug(slug: string) {
  try {
    return await prisma.venue.findFirst({
      where: {
        slug,
        isActive: true,
        city: { isActive: true },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        cityId: true,
        address: true,
        phone: true,
        logoUrl: true,
        storyEnabled: true,
        storyTitle: true,
        storyText: true,
        bookingEnabled: true,
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        categories: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            products: {
              where: { isHidden: false },
              orderBy: { name: "asc" },
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                price: true,
                weight: true,
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error(`[public-venue] Failed to load venue by slug "${slug}"`, error);
    return null;
  }
}
