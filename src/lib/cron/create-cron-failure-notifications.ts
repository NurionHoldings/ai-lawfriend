import { prisma } from "@/lib/prisma";

type Input = {
  jobName: string;
  cronLogId: string;
  errorMessage: string;
};

export async function createCronFailureNotifications(input: Input) {
  const recipients = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN"] },
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (recipients.length === 0) return;

  for (const user of recipients) {
    await prisma.adminNotification.create({
      data: {
        userId: user.id,
        type: "SYSTEM",
        title: `[Cron 실패] ${input.jobName}`,
        body: input.errorMessage.slice(0, 2000),
        targetHref: `/admin/cron-runs/${input.cronLogId}`,
      },
    });
  }
}
