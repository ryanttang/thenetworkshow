const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCoordinationArchive() {
  try {
    console.log('Adding isArchived field to Coordination table...');
    
    // Add the isArchived column to the Coordination table
    await prisma.$executeRaw`
      ALTER TABLE "Coordination" 
      ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;
    `;
    
    console.log('✅ Successfully added isArchived field to Coordination table');
    
    // Verify the column was added
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'Coordination' AND column_name = 'isArchived';
    `;
    
    console.log('Verification result:', result);
    
  } catch (error) {
    console.error('❌ Error adding isArchived field:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addCoordinationArchive()
  .then(() => {
    console.log('✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
