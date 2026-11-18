function publicSubject(subject) {
  const { driveUrl: _privateDriveUrl, ...publicFields } = subject;
  return {
    ...publicFields,
    subject: `${subject.department} · semester ${subject.semester} study notes`,
    bnSubject: `${subject.department} · ${subject.semester} পর্বের পড়ার নোট`,
    driveUrl: "",
    icon: "✳",
    tint: "green",
    isStarter: !subject.id.startsWith("admin-"),
  };
}

function publicCourse(course) {
  return {
    ...course,
    duration: `${course.semester} semester`,
    icon: "✳",
    subjects: course.subjects.map(({ subject }) => publicSubject(subject)),
  };
}

export function createPrismaRepository(prisma) {
  return {
    findProduct(type, id) {
      if (type === "subject") return prisma.subject.findUnique({ where: { id } });
      if (type === "course") {
        return prisma.course.findUnique({
          where: { id },
          include: { subjects: { include: { subject: true }, orderBy: { subject: { title: "asc" } } } },
        }).then((course) => course && ({
          ...course,
          subjects: course.subjects.map(({ subject }) => subject),
        }));
      }
      return null;
    },

    createPurchase(data) {
      return prisma.purchase.create({ data });
    },

    updatePurchase(id, data) {
      return prisma.purchase.update({ where: { id }, data });
    },

    findPurchase(id) {
      return prisma.purchase.findUnique({ where: { id } });
    },

    async markPurchasePaid(id, bkashPaymentId, bkashTransactionId) {
      const purchase = await prisma.purchase.findUnique({ where: { id } });
      if (!purchase) throw Object.assign(new Error("Purchase not found."), { statusCode: 404 });
      if (purchase.status === "PAID") {
        if (purchase.bkashPaymentId !== bkashPaymentId || purchase.bkashTransactionId !== bkashTransactionId) {
          throw Object.assign(new Error("The purchase was already settled with a different transaction."), { statusCode: 409 });
        }
        return purchase;
      }
      const updated = await prisma.purchase.updateMany({
        where: { id, status: "PENDING", bkashPaymentId },
        data: {
          status: "PAID",
          bkashTransactionId,
          paidAt: new Date(),
        },
      });
      if (updated.count !== 1) {
        throw Object.assign(new Error("Purchase payment status changed during verification."), { statusCode: 409 });
      }
      return prisma.purchase.findUnique({ where: { id } });
    },

    async getPublicCatalog() {
      const [subjects, courses] = await Promise.all([
        prisma.subject.findMany({ orderBy: [{ department: "asc" }, { semester: "asc" }, { title: "asc" }] }),
        prisma.course.findMany({
          include: { subjects: { include: { subject: true }, orderBy: { subject: { title: "asc" } } } },
          orderBy: [{ department: "asc" }, { semester: "asc" }],
        }),
      ]);
      return {
        subjects: subjects.map(publicSubject),
        courses: courses.map(publicCourse),
      };
    },

    createSubject(data) {
      return prisma.$transaction(async (transaction) => {
        const subject = await transaction.subject.create({ data });
        await transaction.courseSubject.createMany({
          data: [{
            courseId: `${subject.department}-semester-${subject.semester}`,
            subjectId: subject.id,
          }],
          skipDuplicates: true,
        });
        return subject;
      });
    },

    updateSubject(id, data) {
      return prisma.subject.update({ where: { id }, data });
    },

    deleteSubject(id) {
      return prisma.subject.delete({ where: { id } });
    },

    async updateCourse(id, data) {
      return prisma.course.update({ where: { id }, data }).then(publicCourse);
    },
  };
}
