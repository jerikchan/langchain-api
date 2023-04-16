import { join } from 'path';

export function resolvePath (path: string) {
  return join(__dirname, '../public', path);
}

export function len(v: any) {
  return v ? v.length : 0;
}