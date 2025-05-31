-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PastaSauce" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "availableImages" TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO "new_PastaSauce" ("id", "imageUrl", "name") SELECT "id", "imageUrl", "name" FROM "PastaSauce";
DROP TABLE "PastaSauce";
ALTER TABLE "new_PastaSauce" RENAME TO "PastaSauce";
CREATE TABLE "new_PastaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "availableImages" TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO "new_PastaType" ("id", "imageUrl", "name") SELECT "id", "imageUrl", "name" FROM "PastaType";
DROP TABLE "PastaType";
ALTER TABLE "new_PastaType" RENAME TO "PastaType";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
