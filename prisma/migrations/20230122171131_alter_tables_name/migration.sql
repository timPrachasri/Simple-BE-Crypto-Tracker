/*
  Warnings:

  - You are about to drop the `CurrentBalance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WalletHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "CurrentBalance";

-- DropTable
DROP TABLE "WalletHistory";

-- CreateTable
CREATE TABLE "wallet_histories" (
    "id" SERIAL NOT NULL,
    "datetime" TIMESTAMPTZ(3) NOT NULL,
    "amount" BIGINT NOT NULL,
    "precision" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_balances" (
    "id" SERIAL NOT NULL,
    "balance" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "current_balances_pkey" PRIMARY KEY ("id")
);
