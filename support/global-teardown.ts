import * as dotenv from 'dotenv';
import { cleanupCreatedPrograms } from './cleanup-programs';

dotenv.config();

export default async function globalTeardown(): Promise<void> {
  await cleanupCreatedPrograms();
}
