import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import {
  createSemesterCourses,
  createStarterSubjects,
} from "../src/data/catalog.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be configured before seeding the DTH catalogue.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const subjects = createStarterSubjects();
  for (const subject of subjects) {
    const data = {
      title: subject.title,
      bnTitle: subject.bnTitle,
      overview: subject.overview,
      bnOverview: subject.bnOverview,
      department: subject.department,
      semester: subject.semester,
      price: subject.price,
    };
    await prisma.subject.upsert({
      where: { id: subject.id },
      create: { id: subject.id, ...data },
      update: {},
    });
  }

  for (const course of createSemesterCourses(subjects)) {
    const data = {
      title: course.title,
      bnTitle: course.bnTitle,
      description: course.description,
      bnDescription: course.bnDescription,
      department: course.department,
      semester: course.semester,
      price: course.price,
    };
    await prisma.course.upsert({
      where: { id: course.id },
      create: {
        id: course.id,
        ...data,
        subjects: {
          create: course.subjects.map((subject) => ({ subjectId: subject.id })),
        },
      },
      update: {
        ...data,
        subjects: {
          deleteMany: {},
          create: course.subjects.map((subject) => ({ subjectId: subject.id })),
        },
      },
    });
  }

  console.log(`Seeded ${subjects.length} editable starter subjects and 224 semester course packs.`);
}

main()
  .catch((error) => {
    console.error("Could not seed the DTH course catalogue.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
