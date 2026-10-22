import { randomUUID } from 'node:crypto';

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidv4 = (): string => randomUUID();
export const isUUID = (str?: unknown): boolean => typeof str === 'string' && GUID_REGEX.test(str);
export default uuidv4;

