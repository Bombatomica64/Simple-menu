-- CreateTable
CREATE TABLE "PastaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PastaSauce" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MenuToPastaType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuId" INTEGER NOT NULL,
    "pastaTypeId" INTEGER NOT NULL,
    CONSTRAINT "MenuToPastaType_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MenuToPastaType_pastaTypeId_fkey" FOREIGN KEY ("pastaTypeId") REFERENCES "PastaType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuToPastaSauce" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuId" INTEGER NOT NULL,
    "pastaSauceId" INTEGER NOT NULL,
    CONSTRAINT "MenuToPastaSauce_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MenuToPastaSauce_pastaSauceId_fkey" FOREIGN KEY ("pastaSauceId") REFERENCES "PastaSauce" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuToPastaType_menuId_pastaTypeId_key" ON "MenuToPastaType"("menuId", "pastaTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuToPastaSauce_menuId_pastaSauceId_key" ON "MenuToPastaSauce"("menuId", "pastaSauceId");
