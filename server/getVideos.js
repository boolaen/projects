require('dotenv').config();
process.env.DATABASE_URL = process.env.DATABASE_URL.replace(/^"|"$/g, '').trim();
if (process.env.DIRECT_URL) {
    process.env.DIRECT_URL = process.env.DIRECT_URL.replace(/^"|"$/g, '').trim();
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
    const videos = await prisma.video.findMany({
        select: { id: true, title: true }
    });
    fs.writeFileSync('titles.json', JSON.stringify(videos, null, 2), 'utf8');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect().then(() => process.exit(0)));
