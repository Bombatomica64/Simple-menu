-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BackgroundConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "page" TEXT,
    "background" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BackgroundConfig" ("background", "createdAt", "id", "page", "updatedAt") SELECT "background", "createdAt", "id", "page", "updatedAt" FROM "BackgroundConfig";
DROP TABLE "BackgroundConfig";
ALTER TABLE "new_BackgroundConfig" RENAME TO "BackgroundConfig";
CREATE UNIQUE INDEX "BackgroundConfig_page_key" ON "BackgroundConfig"("page");
CREATE TABLE "new_Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "backgroundId" INTEGER,
    CONSTRAINT "Menu_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "BackgroundConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Menu" ("createdAt", "id") SELECT "createdAt", "id" FROM "Menu";
DROP TABLE "Menu";
ALTER TABLE "new_Menu" RENAME TO "Menu";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
