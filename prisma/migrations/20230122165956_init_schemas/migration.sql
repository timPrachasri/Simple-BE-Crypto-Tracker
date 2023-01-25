-- CreateTable
CREATE TABLE "WalletHistory" (
    "id" SERIAL NOT NULL,
    "datetime" TIMESTAMPTZ(3) NOT NULL,
    "amount" BIGINT NOT NULL,
    "precision" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurrentBalance" (
    "id" SERIAL NOT NULL,
    "balance" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurrentBalance_pkey" PRIMARY KEY ("id")
);
