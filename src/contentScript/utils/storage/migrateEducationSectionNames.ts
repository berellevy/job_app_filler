/**
 * For a short period of time, greenhouse react saved education sections as just the section number.
 * this would pose a problem of making it reusable in workday which has multiple types of repeating sections.
 * this migration converts any existing sections named "1" or "2" etc. to "education 1" etc..
 * 
 * it will only run once.
 */
const EDUCATION_MIGRATION_KEY = "educationMigrationCompleted_aee586a3-3230-4cb1-a841-0a7101983910"


async function migrationCompleted(): Promise<boolean> {
  const data = await chrome.storage.local.get(EDUCATION_MIGRATION_KEY)
  return !!data[EDUCATION_MIGRATION_KEY]
}

async function markMigrationAsCompleted() {
  await chrome.storage.local.set({[EDUCATION_MIGRATION_KEY]: true})
}

async function runMigration() {
  console.log("migrating education")
  const {answers1010} = await chrome.storage.local.get("answers1010")
  if (!answers1010) {
    return
  }

  for (const item of answers1010.store) {
    if (item[1].section.length === 1) {
      item[1].section = "education " + item[1].section
    }
  }
  await chrome.storage.local.set({answers1010})
}

export const migrateEducation = async () => {
  if (!(await migrationCompleted())) {
    await runMigration()
    await markMigrationAsCompleted()
  }
}