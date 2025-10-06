import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = "network_admin@example.com";
  const organizerEmail = "organizer@example.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      hashedPassword: await hash("admin123!", 10)
    }
  });

  await prisma.user.upsert({
    where: { email: organizerEmail },
    update: {},
    create: {
      email: organizerEmail,
      name: "Organizer",
      role: "ORGANIZER",
      hashedPassword: await hash("organizer123!", 10)
    }
  });

  console.log("Seeded:", adminEmail, organizerEmail);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
