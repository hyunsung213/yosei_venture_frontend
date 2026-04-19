'use server';

import { promises as fs } from 'fs';
import path from 'path';

export async function getApplications(programId: string) {
  try {
    const dbPath = path.join(process.cwd(), 'public', 'registrations.json');
    const fileData = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(fileData);
    
    // MongoDB _id(string) 기반 비교
    return db.filter((app: any) => String(app.programId) === programId);
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      return []; // DB not created yet
    }
    console.error("Read DB Error:", e);
    return [];
  }
}
