-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentMethod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT false,
    "vendingMachineId" TEXT NOT NULL,
    CONSTRAINT "PaymentMethod_vendingMachineId_fkey" FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PaymentMethod" ("available", "id", "type", "vendingMachineId") SELECT "available", "id", "type", "vendingMachineId" FROM "PaymentMethod";
DROP TABLE "PaymentMethod";
ALTER TABLE "new_PaymentMethod" RENAME TO "PaymentMethod";
CREATE TABLE "new_Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "vendingMachineId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Photo_vendingMachineId_fkey" FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Photo" ("id", "url", "vendingMachineId") SELECT "id", "url", "vendingMachineId" FROM "Photo";
DROP TABLE "Photo";
ALTER TABLE "new_Photo" RENAME TO "Photo";
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "price" REAL,
    "slotCode" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "vendingMachineId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_vendingMachineId_fkey" FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("description", "id", "name", "photo", "vendingMachineId") SELECT "description", "id", "name", "photo", "vendingMachineId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "vendingMachineId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_vendingMachineId_fkey" FOREIGN KEY ("vendingMachineId") REFERENCES "VendingMachine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("comment", "createdAt", "id", "rating", "userId", "vendingMachineId") SELECT "comment", "createdAt", "id", "rating", "userId", "vendingMachineId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("email", "id", "name", "password") SELECT "email", "id", "name", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_VendingMachine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VendingMachine_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VendingMachine" ("id", "location", "name", "ownerId") SELECT "id", "location", "name", "ownerId" FROM "VendingMachine";
DROP TABLE "VendingMachine";
ALTER TABLE "new_VendingMachine" RENAME TO "VendingMachine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
