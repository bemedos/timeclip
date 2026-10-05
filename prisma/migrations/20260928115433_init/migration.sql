-- CreateTable
CREATE TABLE "VideoLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoUrl" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
