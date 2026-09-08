import { promises as fs } from 'fs';
import path from 'path';

const WAITLIST_PATH = path.join(process.cwd(), 'data', 'waitlist.json');
let writeLock: Promise<any> = Promise.resolve();

export async function getWaitlist(): Promise<string[]> {
  try {
    const data = await fs.readFile(WAITLIST_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addToWaitlist(email: string): Promise<{ success: boolean; message: string }> {
  return writeLock = writeLock.then(async () => {
    const list = await getWaitlist();
    if (list.includes(email.toLowerCase())) {
      return { success: false, message: 'You are already on the waitlist!' };
    }
    list.push(email.toLowerCase());
    await fs.writeFile(WAITLIST_PATH, JSON.stringify(list, null, 2), 'utf-8');
    return { success: true, message: 'Welcome to the Kingdom! You are on the list.' };
  }).catch(() => {
    return { success: false, message: 'Server error. Please try again.' };
  });
}
