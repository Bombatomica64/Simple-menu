/*
  Warnings:

  - You are about to drop the column `availableImages` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `availableImages` on the `PastaSauce` table. All the data in the column will be lost.
  - You are about to drop the column `availableImages` on the `PastaType` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "showImage" BOOLEAN NOT NULL DEFAULT false,
    "menuId" INTEGER NOT NULL,
    "sectionId" INTEGER,
    CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "MenuSection" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MenuItem" ("id", "imageUrl", "menuId", "name", "position", "price", "sectionId", "showImage") SELECT "id", "imageUrl", "menuId", "name", "position", "price", "sectionId", "showImage" FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
CREATE TABLE "new_PastaSauce" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT
);
INSERT INTO "new_PastaSauce" ("description", "id", "imageUrl", "name") SELECT "description", "id", "imageUrl", "name" FROM "PastaSauce";
DROP TABLE "PastaSauce";
ALTER TABLE "new_PastaSauce" RENAME TO "PastaSauce";
CREATE TABLE "new_PastaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT
);
INSERT INTO "new_PastaType" ("description", "id", "imageUrl", "name") SELECT "description", "id", "imageUrl", "name" FROM "PastaType";
DROP TABLE "PastaType";
ALTER TABLE "new_PastaType" RENAME TO "PastaType";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
