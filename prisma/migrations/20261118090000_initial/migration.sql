CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bnTitle" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "bnOverview" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "driveUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bnTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bnDescription" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseSubject" (
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    CONSTRAINT "CourseSubject_pkey" PRIMARY KEY ("courseId","subjectId")
);

CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "invoiceNumber" TEXT NOT NULL,
    "accessKeyHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bkashPaymentId" TEXT,
    "bkashTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Subject_department_semester_idx" ON "Subject"("department", "semester");
CREATE INDEX "Course_department_semester_idx" ON "Course"("department", "semester");
CREATE UNIQUE INDEX "Purchase_invoiceNumber_key" ON "Purchase"("invoiceNumber");
CREATE UNIQUE INDEX "Purchase_bkashPaymentId_key" ON "Purchase"("bkashPaymentId");
CREATE INDEX "Purchase_status_createdAt_idx" ON "Purchase"("status", "createdAt");

ALTER TABLE "CourseSubject"
    ADD CONSTRAINT "CourseSubject_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseSubject"
    ADD CONSTRAINT "CourseSubject_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "Subject"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
