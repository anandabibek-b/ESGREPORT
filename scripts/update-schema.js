const fs = require('fs');
const path = require('path');

const schemaPath = path.resolve(__dirname, '../database/prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// Replace provider with sqlite
content = content.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
// Replace @db.Uuid
content = content.replace(/\s*@db\.Uuid/g, '');
// Replace Json with String for SQLite compatibility
content = content.replace(/Json\?/g, 'String?');
content = content.replace(/Json(\s+@default)/g, 'String$1');
content = content.replace(/Json/g, 'String');

// Append new models if not present
if (!content.includes('model MetricValueVersion')) {
  content += `

// ============================================================
// RESPONSE VERSIONING & CALCULATIONS (PHASE 3, 11, 16)
// ============================================================

model MetricValueVersion {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  metricValueId String   @map("metric_value_id")
  versionNumber Int      @map("version_number")
  numericValue  Float?   @map("numeric_value")
  textValue     String?  @map("text_value")
  unit          String?
  reason        String?
  changedById   String?  @map("changed_by_id")
  createdAt     DateTime @default(now()) @map("created_at")

  @@index([tenantId])
  @@index([metricValueId])
  @@map("metric_value_versions")
}

model Calculation {
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  submissionId    String?  @map("submission_id")
  metricValueId   String?  @map("metric_value_id")
  name            String
  code            String
  category        String
  formula         String
  methodology     String?
  resultValue     Float    @map("result_value")
  resultUnit      String   @map("result_unit")
  calculatedBy    String?  @map("calculated_by")
  version         Int      @default(1)
  status          String   @default("active")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  inputs          CalculationInput[]

  @@index([tenantId])
  @@index([category])
  @@map("calculations")
}

model CalculationInput {
  id            String   @id @default(uuid())
  calculationId String   @map("calculation_id")
  name          String
  inputCode     String   @map("input_code")
  inputValue    Float    @map("input_value")
  inputUnit     String   @map("input_unit")
  source        String?
  sourceFileId  String?  @map("source_file_id")
  createdAt     DateTime @default(now()) @map("created_at")

  calculation   Calculation @relation(fields: [calculationId], references: [id], onDelete: Cascade)

  @@index([calculationId])
  @@map("calculation_inputs")
}

model WorkflowStep {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  name         String
  stepOrder    Int      @map("step_order")
  roleRequired String   @map("role_required")
  status       String   @default("active")
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([tenantId])
  @@map("workflow_steps")
}
`;
}

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Successfully updated database/prisma/schema.prisma for SQLite!');
