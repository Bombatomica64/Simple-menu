/*
  Warnings:

  - You are about to drop the column `logoPosition` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `logoSize` on the `Menu` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `Menu` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Logo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "position" TEXT NOT NULL DEFAULT 'top-left',
    "size" TEXT NOT NULL DEFAULT 'medium',
    "opacity" REAL NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "backgroundId" INTEGER,
    "logoId" INTEGER,
    "orientation" TEXT NOT NULL DEFAULT 'vertical',
    "availableImages" TEXT,
    "globalPastaTypeShowImage" BOOLEAN NOT NULL DEFAULT true,
    "globalPastaTypeImageSize" TEXT NOT NULL DEFAULT 'size-medium',
    "globalPastaTypeShowDescription" BOOLEAN NOT NULL DEFAULT true,
    "globalPastaTypeFontSize" INTEGER NOT NULL DEFAULT 100,
    "globalPastaSauceShowImage" BOOLEAN NOT NULL DEFAULT true,
    "globalPastaSauceImageSize" TEXT NOT NULL DEFAULT 'size-medium',
    "globalPastaSauceShowDescription" BOOLEAN NOT NULL DEFAULT true,
    "globalPastaSauceFontSize" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "Menu_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "BackgroundConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Menu_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Logo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Menu" ("availableImages", "backgroundId", "createdAt", "globalPastaSauceFontSize", "globalPastaSauceImageSize", "globalPastaSauceShowDescription", "globalPastaSauceShowImage", "globalPastaTypeFontSize", "globalPastaTypeImageSize", "globalPastaTypeShowDescription", "globalPastaTypeShowImage", "id", "orientation") SELECT "availableImages", "backgroundId", "createdAt", "globalPastaSauceFontSize", "globalPastaSauceImageSize", "globalPastaSauceShowDescription", "globalPastaSauceShowImage", "globalPastaTypeFontSize", "globalPastaTypeImageSize", "globalPastaTypeShowDescription", "globalPastaTypeShowImage", "id", "orientation" FROM "Menu";
DROP TABLE "Menu";
ALTER TABLE "new_Menu" RENAME TO "Menu";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
