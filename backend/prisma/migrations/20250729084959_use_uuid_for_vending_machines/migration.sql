/*
  Warnings:

  - The primary key for the `VendingMachine` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentMethod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "vendingMachineId" TEXT NOT NULL,
    CONSTRAINT "PaymentMethod_vendingMachineId_fkey" FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PaymentMethod" ("available", "id", "type", "vendingMachineId") SELECT "available", "id", "type", "vendingMachineId" FROM "PaymentMethod";
DROP TABLE "PaymentMethod";
ALTER TABLE "new_PaymentMethod" RENAME TO "PaymentMethod";
CREATE TABLE "new_Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "vendingMachineId" TEXT NOT NULL,
    CONSTRAINT "Photo_vendingMachineId_fkey" FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Photo" ("id", "url", "vendingMachineId") SELECT "id", "url", "vendingMachineId" FROM "Photo";
DROP TABLE "Photo";
ALTER TABLE "new_Photo" RENAME TO "Photo";
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "vendingMachineId" TEXT NOT NULL,
    CONSTRAINT "Product_vendingMachineId_fkey" FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("description", "id", "name", "photo", "vendingMachineId") SELECT "description", "id", "name", "photo", "vendingMachineId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "vendingMachineId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_vendingMachineId_fkey" FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("comment", "createdAt", "id", "rating", "userId", "vendingMachineId") SELECT "comment", "createdAt", "id", "rating", "userId", "vendingMachineId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE TABLE "new_VendingMachine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "VendingMachine_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VendingMachine" ("id", "location", "name", "ownerId") SELECT "id", "location", "name", "ownerId" FROM "VendingMachine";
DROP TABLE "VendingMachine";
ALTER TABLE "new_VendingMachine" RENAME TO "VendingMachine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
