-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WatchProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "season" INTEGER,
    "episode" INTEGER,
    "positionPct" REAL NOT NULL DEFAULT 0,
    "durationSec" INTEGER,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WatchProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatchlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "WatchProgress_userId_updatedAt_idx" ON "WatchProgress"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WatchProgress_userId_mediaType_tmdbId_season_episode_key" ON "WatchProgress"("userId", "mediaType", "tmdbId", "season", "episode");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_userId_mediaType_tmdbId_key" ON "WatchlistItem"("userId", "mediaType", "tmdbId");
