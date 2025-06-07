-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "backgroundId" INTEGER,
    "orientation" TEXT NOT NULL DEFAULT 'vertical',
    "availableImages" TEXT,
    CONSTRAINT "Menu_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "BackgroundConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Menu" ("backgroundId", "createdAt", "id") SELECT "backgroundId", "createdAt", "id" FROM "Menu";
DROP TABLE "Menu";
ALTER TABLE "new_Menu" RENAME TO "Menu";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
