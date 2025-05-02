import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.createMany({
    data: [
      {
        email: 'user@example.com',
        name: 'Regular User',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
      },
    ],
    skipDuplicates: true,
  });

  // Seed Trips
  await prisma.trip.createMany({
    data: [
      {
        destination: 'Bali',
        country: 'Indonesia',
        description:
          'Explore beautiful beaches and temples in Bali. Includes 10-day luxury resort stay with daily breakfast.',
        highlights: 'Ubud Monkey Forest, Tanah Lot Temple, Uluwatu Cliff',
        price: 1200.0,
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-11'),
      },
      {
        destination: 'Paris',
        country: 'France',
        description:
          'Romantic getaway to the City of Lights. Includes Eiffel Tower access and Seine River cruise.',
        highlights: 'Eiffel Tower, Louvre Museum, Montmartre',
        price: 1500.0,
        startDate: new Date('2024-02-14'),
        endDate: new Date('2024-02-21'),
      },
      {
        destination: 'Tokyo',
        country: 'Japan',
        description:
          'Experience the blend of traditional and modern Japan. Includes guided tours and bullet train pass.',
        highlights: 'Shibuya Crossing, Asakusa Temple, Akihabara',
        price: 1800.0,
        startDate: new Date('2024-04-10'),
        endDate: new Date('2024-04-20'),
      },
    ],
    skipDuplicates: true,
  });

  // Seed Destination
  const uttarakhand = await prisma.destination.upsert({
    where: { name: 'Uttarakhand' },
    update: {},
    create: {
      name: 'Uttarakhand',
      location: 'India',
      description: 'The Devbhoomi with breathtaking natural beauty and adventure spots.',
    },
  });

  // Seed Media for Uttarakhand
  await prisma.media.createMany({
    data: [
      {
        title: 'Valley of Flowers',
        type: 'IMAGE',
        url: 'https://res.cloudinary.com/demo/image/upload/valley.jpg',
        destinationId: uttarakhand.id,
      },
      {
        title: 'Ganga Aarti Video',
        type: 'VIDEO',
        url: 'https://res.cloudinary.com/demo/video/upload/gangaaarti.mp4',
        destinationId: uttarakhand.id,
      },
      {
        title: 'Rishikesh Adventure Reels',
        type: 'REEL',
        url: 'https://res.cloudinary.com/demo/video/upload/rishikesh-reel.mp4',
        destinationId: uttarakhand.id,
      },
    ],
  });

  console.log('🌱 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
