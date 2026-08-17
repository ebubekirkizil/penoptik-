import { prisma } from './src/lib/prisma'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  // Find pen optik firm
  let firm = await prisma.firm.findFirst({
    where: { domain: { contains: 'penoptik' } }
  })
  
  if (!firm) {
    firm = await prisma.firm.findFirst()
  }

  // Upsert the admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin' },
    update: {
      password: hashedPassword, // we can reset to admin123 or leave it alone, wait, let's just create if not exists
    },
    create: {
      email: 'admin',
      password: hashedPassword,
      firstName: 'Pen Optik',
      lastName: 'Yönetici',
      role: 'SUPER_ADMIN',
      firmId: firm?.id
    }
  })

  console.log('Admin user ensured in DB:', adminUser.email)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
