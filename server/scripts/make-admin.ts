
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
        take: 1
    });

    if (users.length > 0) {
        const user = users[0];
        console.log(`Promoting first user found: ${user.username} (${user.email}) to ADMIN`);
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        });
        console.log('Success!');
    } else {
        console.log('No users found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
