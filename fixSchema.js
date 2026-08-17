const fs = require('fs');
let c = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf8');
const searchIndex = c.indexOf('model TaxOptimizationLog');
if (searchIndex !== -1) {
    const startOfLog = c.substring(0, searchIndex);
    const goodEnd = `model TaxOptimizationLog {
  id               String   @id @default(cuid())
  FirmId           String
  Firm             Firm     @relation(fields: [FirmId], references: [id], onDelete: Cascade)
  title            String
  description      String   @db.Text
  estimatedSavings Float?
  isImplemented    Boolean  @default(false)
  createdAt        DateTime @default(now())
}

model SystemFinanceTransaction {
  id          String   @id @default(cuid())
  type        String   // INCOME, EXPENSE
  amount      Float
  category    String   // SERVER_COST, LICENSE, SALARY, MARKETING, OTHER (for expenses), or SUBSCRIPTION (for incomes)
  description String?
  firmId      String?  
  firm        Firm?    @relation(fields: [firmId], references: [id], onDelete: SetNull)
  status      String   @default("COMPLETED")
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
`;
    fs.writeFileSync('packages/database/prisma/schema.prisma', startOfLog + goodEnd);
}
