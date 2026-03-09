require('dotenv').config();
process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^"|"$/g, '').trim();
if (process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.DIRECT_URL.replace(/^"|"$/g, '').trim();
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL.replace(/^"|"$/g, '').trim()
        }
    }
});

async function main() {
    console.log("Starting script with URL:", process.env.DATABASE_URL.replace(/^"|"$/g, '').trim());
    const videos = await prisma.video.findMany();
    let count = 0;
    for (const v of videos) {
        if (!v.duration || v.duration === 0) {
            const randomDuration = Math.floor(Math.random() * (600 - 60 + 1) + 60);
            await prisma.video.update({
                where: { id: v.id },
                data: { duration: randomDuration }
            });
            count++;
        }
    }
    console.log(`Updated ${count} videos with random durations.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect().then(() => process.exit(0)));
