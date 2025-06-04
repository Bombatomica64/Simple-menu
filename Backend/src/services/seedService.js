// Database seeding service
const fs = require("fs");
const path = require("path");
const { prisma } = require("../config/database");

async function seedDefaultData() {
  try {
    // Check if data already exists
    const existingPastaTypes = await prisma.pastaType.count();
    const existingPastaSauces = await prisma.pastaSauce.count();

    // Load init data from JSON file
    const initDataPath = path.join(__dirname, "../../assets/init.json");
    let initData = {};
    
    if (fs.existsSync(initDataPath)) {
      const initDataContent = fs.readFileSync(initDataPath, "utf8");
      initData = JSON.parse(initDataContent);
      console.log("Loaded init data from init.json");
    } else {
      console.log("init.json not found, using fallback data");
    }

    if (existingPastaTypes === 0) {
      console.log("Seeding default pasta types...");
      const pastaTypesToSeed = initData.pastaTypes || [
        "Maltagliati", "Pici", "Gnocchi", "Trofie", "Penne", "Mezze Maniche"
      ];
      
      const pastaTypeData = pastaTypesToSeed.map(name => ({
        name,
        imageUrl: "", // No default images
        availableImages: JSON.stringify([]) // Empty array for images
      }));

      await prisma.pastaType.createMany({
        data: pastaTypeData,
      });
    }

    if (existingPastaSauces === 0) {
      console.log("Seeding default pasta sauces...");
      const pastaSaucesToSeed = initData.pastaSauces || [
        "Pancetta, Porro e Funghi", "Provola e Speck", "Puttanesca", 
        "Ragù", "Arrabbiata", "Pomodoro"
      ];
      
      const pastaSauceData = pastaSaucesToSeed.map(name => ({
        name,
        imageUrl: "", // No default images for sauces yet
        availableImages: JSON.stringify([]) // Empty array for now
      }));

      await prisma.pastaSauce.createMany({
        data: pastaSauceData,
      });
    }

    console.log("Default data seeding completed.");
  } catch (error) {
    console.error("Error seeding default data:", error);
  }
}

module.exports = { seedDefaultData };
