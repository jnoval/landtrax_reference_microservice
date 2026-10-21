import { BadRequestException } from '@nestjs/common';

export const ALLOWED_FILENAME_VARIABLES = [
  'document name',
  'document identifier',
  'title number',
  'aprn',
  'tin',
  'notarization date',
  "owner's name",
  'or number',
  'id name',
  'id number',
  "requestor's name",
  "buyer's name",
  'name',
  'applicant name',
  'applicant id',
  'document type',
  'requirement code',
  'requirement name',
  'service name',
  'transaction number',
  'date',
  'timestamp',
  'original name',
] as const;

function normalizeVariable(token: string): string {
  return token.trim().toLowerCase().replace(/[_\s]+/g, ' ').trim();
}

const ALLOWED_VARIABLE_SET = new Set<string>(
  ALLOWED_FILENAME_VARIABLES.map(normalizeVariable),
);

export function getFileNameVariableTokens(format: string): string[] {
  const placeholders: string[] = format.match(/\{([^{}]+)\}/g) || [];
  const tokens = placeholders.map((p) => p.slice(1, -1));
  const normalized = tokens.map(normalizeVariable);
  return Array.from(new Set(normalized));
}

export function validateFileNameFormat(format: string): void {
  if (!format) return;

  const tokens = getFileNameVariableTokens(format);
  for (const token of tokens) {
    if (!ALLOWED_VARIABLE_SET.has(token)) {
      throw new BadRequestException(
        'The system cannot proceed because the filename convention contains variables that are not defined in the OCR configuration. Only existing predefined variables are allowed.',
      );
    }
  }
}
