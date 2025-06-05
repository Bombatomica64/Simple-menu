-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PastaSauce" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "basePrice" REAL NOT NULL DEFAULT 3.50,
    "priceNote" TEXT
);
INSERT INTO "new_PastaSauce" ("description", "id", "imageUrl", "name") SELECT "description", "id", "imageUrl", "name" FROM "PastaSauce";
DROP TABLE "PastaSauce";
ALTER TABLE "new_PastaSauce" RENAME TO "PastaSauce";
CREATE TABLE "new_PastaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "basePrice" REAL NOT NULL DEFAULT 8.50,
    "priceNote" TEXT
);
INSERT INTO "new_PastaType" ("description", "id", "imageUrl", "name") SELECT "description", "id", "imageUrl", "name" FROM "PastaType";
DROP TABLE "PastaType";
ALTER TABLE "new_PastaType" RENAME TO "PastaType";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
