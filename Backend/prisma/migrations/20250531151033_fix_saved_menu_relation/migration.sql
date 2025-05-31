/*
  Warnings:

  - You are about to drop the column `menuData` on the `SavedMenu` table. All the data in the column will be lost.
  - Added the required column `menuId` to the `SavedMenu` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavedMenu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "menuId" INTEGER NOT NULL,
    CONSTRAINT "SavedMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavedMenu" ("id", "name", "savedAt") SELECT "id", "name", "savedAt" FROM "SavedMenu";
DROP TABLE "SavedMenu";
ALTER TABLE "new_SavedMenu" RENAME TO "SavedMenu";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
