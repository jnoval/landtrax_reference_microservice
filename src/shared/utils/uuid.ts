import { randomUUID } from 'node:crypto';

export const uuidv4 = (): string => randomUUID();
export default uuidv4;
