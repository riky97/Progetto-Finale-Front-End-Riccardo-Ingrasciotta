-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "animeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watched" (
    "id" SERIAL NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "animeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watched_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Favorite_clerkUserId_idx" ON "Favorite"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_clerkUserId_animeId_key" ON "Favorite"("clerkUserId", "animeId");

-- CreateIndex
CREATE INDEX "Watched_clerkUserId_idx" ON "Watched"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Watched_clerkUserId_animeId_key" ON "Watched"("clerkUserId", "animeId");
