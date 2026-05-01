try {
  process.loadEnvFile();
} catch {
  /* no .env file; rely on environment variables */
}

export function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }

  return value;
}

export function optionalEnv(
  key: string,
  fallback?: string,
): string | undefined {
  return process.env[key] ?? fallback;
}

export function requireNumber(key: string): number {
  const value = requireEnv(key);
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Env var ${key} must be a number`);
  }

  return parsed;
}
