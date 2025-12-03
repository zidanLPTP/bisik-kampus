import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordAdmin = await bcrypt.hash('adminGaul69Like', 10) 

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      nama: 'Super Sigma Admin',
      username: 'admin',
      password: passwordAdmin,
      role: 'superadmin'
    },
  })
  console.log("✅ Akun admin berhasil dibuat. User: admin, Pass: adminGaul69Like")
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })