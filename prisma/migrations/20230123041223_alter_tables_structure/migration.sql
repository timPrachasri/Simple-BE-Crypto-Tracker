/*
  Warnings:

  - You are about to drop the column `balance` on the `current_balances` table. All the data in the column will be lost.
  - You are about to drop the column `precision` on the `wallet_histories` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `wallet_histories` table. All the data in the column will be lost.
  - Added the required column `amount` to the `current_balances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_id` to the `current_balances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_id` to the `wallet_histories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "current_balances" DROP COLUMN "balance",
ADD COLUMN     "amount" BIGINT NOT NULL,
ADD COLUMN     "token_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "wallet_histories" DROP COLUMN "precision",
DROP COLUMN "updated_at",
ADD COLUMN     "token_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "current_balances_token_id_idx" ON "current_balances" USING HASH ("token_id");

-- AddForeignKey
ALTER TABLE "wallet_histories" ADD CONSTRAINT "wallet_histories_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "current_balances" ADD CONSTRAINT "current_balances_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "Token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
