import os

schema_path = r'C:\Users\90551\OneDrive\Masaüstü\İMPECTA\packages\database\prisma\schema.prisma'

with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add to User model
if 'nfcCards' not in content:
    user_relations = '''  activityLogs        ActivityLog[]
  nfcCards            NfcCard[]
  nfcProfile          NfcProfile?'''
    content = content.replace('  activityLogs        ActivityLog[]', user_relations)

# Append NFC models
if 'model NfcCard' not in content:
    nfc_models = '''
// --- NFC MODULE MODELS ---

model NfcCard {
  id               String         @id @default(cuid())
  serialCode       String         @unique
  activationCode   String?
  userId           String?
  user             User?          @relation(fields: [userId], references: [id], onDelete: SetNull)
  isActive         Boolean        @default(true)
  createdAt        DateTime       @default(now())
  
  analytics        NfcAnalytics[]
}

model NfcProfile {
  id               String         @id @default(cuid())
  userId           String         @unique
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  slug             String         @unique
  
  name             String
  title            String?
  companyName      String?
  bio              String?        @db.Text
  profileImage     String?
  coverImage       String?
  themeColor       String         @default("#000000")
  isPublished      Boolean        @default(false)
  
  modules          NfcModule[]
  analytics        NfcAnalytics[]
}

model NfcModule {
  id               String         @id @default(cuid())
  profileId        String
  profile          NfcProfile     @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  type             String
  title            String
  url              String         @db.Text
  icon             String?
  order            Int            @default(0)
  isActive         Boolean        @default(true)
}

model NfcAnalytics {
  id               String         @id @default(cuid())
  profileId        String?
  profile          NfcProfile?    @relation(fields: [profileId], references: [id], onDelete: Cascade)
  cardId           String?
  card             NfcCard?       @relation(fields: [cardId], references: [id], onDelete: SetNull)
  
  scanDate         DateTime       @default(now())
  actionType       String
  targetId         String?
  
  userAgent        String?
  os               String?
  browser          String?
  deviceType       String?
  ipHash           String?
  isUnique         Boolean        @default(true)
}
'''
    content += nfc_models

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Prisma schema updated successfully.')
