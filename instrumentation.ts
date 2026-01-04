/**
 * Next.js Instrumentation Hook
 *
 * This file is called once when the Next.js server starts.
 * Perfect for validating environment variables before the app runs.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run validation on the server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./src/config/env');

    try {
      // Validate environment variables on server startup
      validateEnv();
      console.log('✅ Environment variables validated successfully');
    } catch (error) {
      // Log the error and exit the process
      // This prevents the app from starting with invalid configuration
      console.error('\n' + (error as Error).message + '\n');
      process.exit(1);
    }
  }
}
