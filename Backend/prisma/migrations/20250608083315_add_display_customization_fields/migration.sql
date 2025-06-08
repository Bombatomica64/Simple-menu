-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Menu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "backgroundId" INTEGER,
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
    CONSTRAINT "Menu_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "BackgroundConfig" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Menu" ("availableImages", "backgroundId", "createdAt", "id", "orientation") SELECT "availableImages", "backgroundId", "createdAt", "id", "orientation" FROM "Menu";
DROP TABLE "Menu";
ALTER TABLE "new_Menu" RENAME TO "Menu";
CREATE TABLE "new_MenuToPastaSauce" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuId" INTEGER NOT NULL,
    "pastaSauceId" INTEGER NOT NULL,
    "showImage" BOOLEAN NOT NULL DEFAULT true,
    "imageSize" TEXT NOT NULL DEFAULT 'size-medium',
    "showDescription" BOOLEAN NOT NULL DEFAULT true,
    "fontSize" INTEGER NOT NULL DEFAULT 100,
    "customDescription" TEXT,
    "customFontColor" TEXT,
    "customBgColor" TEXT,
    CONSTRAINT "MenuToPastaSauce_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MenuToPastaSauce_pastaSauceId_fkey" FOREIGN KEY ("pastaSauceId") REFERENCES "PastaSauce" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MenuToPastaSauce" ("id", "menuId", "pastaSauceId") SELECT "id", "menuId", "pastaSauceId" FROM "MenuToPastaSauce";
DROP TABLE "MenuToPastaSauce";
ALTER TABLE "new_MenuToPastaSauce" RENAME TO "MenuToPastaSauce";
CREATE UNIQUE INDEX "MenuToPastaSauce_menuId_pastaSauceId_key" ON "MenuToPastaSauce"("menuId", "pastaSauceId");
CREATE TABLE "new_MenuToPastaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuId" INTEGER NOT NULL,
    "pastaTypeId" INTEGER NOT NULL,
    "showImage" BOOLEAN NOT NULL DEFAULT true,
    "imageSize" TEXT NOT NULL DEFAULT 'size-medium',
    "showDescription" BOOLEAN NOT NULL DEFAULT true,
    "fontSize" INTEGER NOT NULL DEFAULT 100,
    "customDescription" TEXT,
    "customFontColor" TEXT,
    "customBgColor" TEXT,
    CONSTRAINT "MenuToPastaType_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MenuToPastaType_pastaTypeId_fkey" FOREIGN KEY ("pastaTypeId") REFERENCES "PastaType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MenuToPastaType" ("id", "menuId", "pastaTypeId") SELECT "id", "menuId", "pastaTypeId" FROM "MenuToPastaType";
DROP TABLE "MenuToPastaType";
ALTER TABLE "new_MenuToPastaType" RENAME TO "MenuToPastaType";
CREATE UNIQUE INDEX "MenuToPastaType_menuId_pastaTypeId_key" ON "MenuToPastaType"("menuId", "pastaTypeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
