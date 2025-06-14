-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "backgroundId" INTEGER,
    "orientation" TEXT NOT NULL DEFAULT 'vertical',
    "availableImages" TEXT,
    "logoUrl" TEXT,
    "logoPosition" TEXT NOT NULL DEFAULT 'top-left',
    "logoSize" TEXT NOT NULL DEFAULT 'medium',
    "globalPastaTypeShowImage" BOOLEAN NOT NULL DEFAULT true,
    "globalPastaTypeImageSize" TEXT NOT NULL DEFAULT 'size-medium',
    "globalPastaTypeShowDescription" BOOLEAN NOT NULL DEFAULT true,
    "globalPastaTypeFontSize" INTEGER NOT NULL DEFAULT 100,
    "globalPastaSauceShowImage" BOOLEAN NOT NULL DEFAULT true,
    "globalPastaSauceImageSize" TEXT NOT NULL DEFAULT 'size-medium',
    "globalPastaSauceShowDescription" BOOLEAN NOT NULL DEFAULT true,
    "globalPastaSauceFontSize" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "Menu_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "BackgroundConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Menu" ("availableImages", "backgroundId", "createdAt", "globalPastaSauceFontSize", "globalPastaSauceImageSize", "globalPastaSauceShowDescription", "globalPastaSauceShowImage", "globalPastaTypeFontSize", "globalPastaTypeImageSize", "globalPastaTypeShowDescription", "globalPastaTypeShowImage", "id", "orientation") SELECT "availableImages", "backgroundId", "createdAt", "globalPastaSauceFontSize", "globalPastaSauceImageSize", "globalPastaSauceShowDescription", "globalPastaSauceShowImage", "globalPastaTypeFontSize", "globalPastaTypeImageSize", "globalPastaTypeShowDescription", "globalPastaTypeShowImage", "id", "orientation" FROM "Menu";
DROP TABLE "Menu";
ALTER TABLE "new_Menu" RENAME TO "Menu";
CREATE TABLE "new_MenuSection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "header" TEXT,
    "sectionType" TEXT NOT NULL DEFAULT 'general',
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "menuId" INTEGER NOT NULL,
    CONSTRAINT "MenuSection_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MenuSection" ("header", "id", "menuId", "name", "position") SELECT "header", "id", "menuId", "name", "position" FROM "MenuSection";
DROP TABLE "MenuSection";
ALTER TABLE "new_MenuSection" RENAME TO "MenuSection";
CREATE UNIQUE INDEX "MenuSection_menuId_position_key" ON "MenuSection"("menuId", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
