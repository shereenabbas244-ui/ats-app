CREATE TABLE "OrgSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "hrEmail" TEXT NOT NULL DEFAULT 'hr@lobah.com',
    "emailFromName" TEXT NOT NULL DEFAULT 'Lobah Careers',
    "notifyNewApplication" BOOLEAN NOT NULL DEFAULT true,
    "notifyStageChange" BOOLEAN NOT NULL DEFAULT false,
    "notifyHired" BOOLEAN NOT NULL DEFAULT true,
    "notifyRejected" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OrgSettings_pkey" PRIMARY KEY ("id")
);
