import * as dotenv from 'dotenv';

dotenv.config();

export interface Program {
  id: string;
  name: string;
}

export interface DeleteResult {
  id: string;
  success: boolean;
  status?: number;
  message?: string;
}

function getConfig() {
  const baseUrl = process.env.DIDAXIS_URL;
  const token = process.env.DIDAXIS_API_TOKEN;
  if (!baseUrl) throw new Error('DIDAXIS_URL is not set in .env');
  if (!token) throw new Error('DIDAXIS_API_TOKEN is not set in .env');
  return { baseUrl: baseUrl.replace(/\/$/, ''), token };
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

export async function fetchPrograms(): Promise<Program[]> {
  const { baseUrl, token } = getConfig();
  const response = await fetch(`${baseUrl}/api/programs`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`GET /api/programs failed: ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  const items = body.data ?? body;
  if (!Array.isArray(items)) return [];

  return items.map((item: { id: string; name?: string }) => ({
    id: item.id,
    name: item.name ?? '',
  }));
}

export async function findProgramIdByName(name: string): Promise<string | undefined> {
  const programs = await fetchPrograms();
  return programs.find((program) => program.name === name)?.id;
}

export async function deleteProgram(id: string): Promise<DeleteResult> {
  const { baseUrl, token } = getConfig();
  const response = await fetch(`${baseUrl}/api/programs/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  if (response.ok) {
    return { id, success: true, status: response.status };
  }

  const message = await response.text().catch(() => response.statusText);
  return { id, success: false, status: response.status, message };
}

export async function deletePrograms(ids: string[]): Promise<DeleteResult[]> {
  const results: DeleteResult[] = [];
  for (const id of ids) {
    results.push(await deleteProgram(id));
  }
  return results;
}
