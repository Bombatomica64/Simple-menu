/*
  Warnings:

  - Added the required column `value` to the `BackgroundConfig` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BackgroundConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "page" TEXT,
    "type" TEXT NOT NULL DEFAULT 'color',
    "value" TEXT NOT NULL,
    "background" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BackgroundConfig" ("background", "createdAt", "id", "page", "updatedAt", "type", "value") SELECT "background", "createdAt", "id", "page", "updatedAt", 'color', COALESCE("background", '#ffffff') FROM "BackgroundConfig";
DROP TABLE "BackgroundConfig";
ALTER TABLE "new_BackgroundConfig" RENAME TO "BackgroundConfig";
CREATE UNIQUE INDEX "BackgroundConfig_page_key" ON "BackgroundConfig"("page");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
