/**
 * Migration script to convert absolute image URLs to relative paths
 * This script updates all imageUrl fields in the database to use relative paths instead of absolute URLs
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to convert absolute URL to relative path
function convertToRelativePath(absoluteUrl) {
  if (!absoluteUrl) return absoluteUrl;
  
  // Match pattern like http://IP:PORT/assets/filename or https://IP:PORT/assets/filename
  const match = absoluteUrl.match(/^https?:\/\/[^\/]+\/assets\/(.+)$/);
  if (match) {
    return `/assets/${match[1]}`;
  }
  
  // If it's already a relative path or doesn't match expected pattern, return as is
  return absoluteUrl;
}

async function migrateImageUrls() {
  console.log('Starting migration of image URLs from absolute to relative paths...');
  
  try {
    // Update MenuItem imageUrl
    console.log('Updating MenuItem imageUrl fields...');
    const menuItems = await prisma.menuItem.findMany({
      where: {
        imageUrl: {
          not: null,
          startsWith: 'http'
        }
      }
    });
    
    for (const item of menuItems) {
      const relativePath = convertToRelativePath(item.imageUrl);
      if (relativePath !== item.imageUrl) {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { imageUrl: relativePath }
        });
        console.log(`Updated MenuItem ${item.id}: ${item.imageUrl} -> ${relativePath}`);
      }
    }
    
    // Update PastaType imageUrl
    console.log('Updating PastaType imageUrl fields...');
    const pastaTypes = await prisma.pastaType.findMany({
      where: {
        imageUrl: {
          not: null,
          startsWith: 'http'
        }
      }
    });
    
    for (const type of pastaTypes) {
      const relativePath = convertToRelativePath(type.imageUrl);
      if (relativePath !== type.imageUrl) {
        await prisma.pastaType.update({
          where: { id: type.id },
          data: { imageUrl: relativePath }
        });
        console.log(`Updated PastaType ${type.id}: ${type.imageUrl} -> ${relativePath}`);
      }
    }
    
    // Update PastaSauce imageUrl
    console.log('Updating PastaSauce imageUrl fields...');
    const pastaSauces = await prisma.pastaSauce.findMany({
      where: {
        imageUrl: {
          not: null,
          startsWith: 'http'
        }
      }
    });
    
    for (const sauce of pastaSauces) {
      const relativePath = convertToRelativePath(sauce.imageUrl);
      if (relativePath !== sauce.imageUrl) {
        await prisma.pastaSauce.update({
          where: { id: sauce.id },
          data: { imageUrl: relativePath }
        });
        console.log(`Updated PastaSauce ${sauce.id}: ${sauce.imageUrl} -> ${relativePath}`);
      }
    }
    
    // Update availableImages fields (JSON arrays)
    console.log('Updating availableImages fields...');
    
    // Update Menu availableImages (this is the only model that has this field now)
    const menusWithImages = await prisma.menu.findMany({
      where: {
        availableImages: {
          not: null
        }
      }
    });
    
    for (const menu of menusWithImages) {
      try {
        const availableImages = JSON.parse(menu.availableImages);
        let updated = false;
        const newImages = availableImages.map(url => {
          const relativePath = convertToRelativePath(url);
          if (relativePath !== url) {
            updated = true;
          }
          return relativePath;
        });
        
        if (updated) {
          await prisma.menu.update({
            where: { id: menu.id },
            data: { availableImages: JSON.stringify(newImages) }
          });
          console.log(`Updated Menu ${menu.id} availableImages`);
        }
      } catch (error) {
        console.error(`Error parsing availableImages for Menu ${menu.id}:`, error);
      }
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateImageUrls()
    .then(() => {
      console.log('Migration script finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateImageUrls, convertToRelativePath };
