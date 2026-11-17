import { prisma } from '../config/db.js';

const email = process.argv[2];
const field = process.argv[3] || 'verificationToken';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  if (user && user[field]) {
    console.log(user[field]);
  } else {
    console.log('');
  }
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
