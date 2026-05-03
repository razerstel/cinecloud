-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WatchProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL DEFAULT 0,
    "episode" INTEGER NOT NULL DEFAULT 0,
    "positionPct" REAL NOT NULL DEFAULT 0,
    "durationSec" INTEGER,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WatchProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WatchProgress" ("durationSec", "episode", "id", "mediaType", "positionPct", "season", "tmdbId", "updatedAt", "userId") SELECT "durationSec", coalesce("episode", 0) AS "episode", "id", "mediaType", "positionPct", coalesce("season", 0) AS "season", "tmdbId", "updatedAt", "userId" FROM "WatchProgress";
DROP TABLE "WatchProgress";
ALTER TABLE "new_WatchProgress" RENAME TO "WatchProgress";
CREATE INDEX "WatchProgress_userId_updatedAt_idx" ON "WatchProgress"("userId", "updatedAt");
CREATE UNIQUE INDEX "WatchProgress_userId_mediaType_tmdbId_season_episode_key" ON "WatchProgress"("userId", "mediaType", "tmdbId", "season", "episode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
