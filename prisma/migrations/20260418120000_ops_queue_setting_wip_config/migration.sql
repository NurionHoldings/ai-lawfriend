-- CreateTable
CREATE TABLE "OpsQueueSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "jsonValue" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsQueueSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpsQueueSetting_key_key" ON "OpsQueueSetting"("key");
