import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We need to test the logger in different environments
describe('logger', () => {
  let consoleLogSpy: any;
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.resetModules();
  });

  describe('in development mode', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
    });

    it('debug logs in development', async () => {
      const { logger } = await import('../logger');

      logger.debug('TestContext', 'test message', { data: 'value' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TestContext] test message',
        { data: 'value' }
      );
    });

    it('debug logs without message', async () => {
      const { logger } = await import('../logger');

      logger.debug('TestContext', undefined, { data: 'value' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TestContext]',
        { data: 'value' }
      );
    });

    it('info logs in development', async () => {
      const { logger } = await import('../logger');

      logger.info('TestContext', 'info message', { extra: 'data' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TestContext] info message',
        { extra: 'data' }
      );
    });

    it('warn logs in development', async () => {
      const { logger } = await import('../logger');

      logger.warn('TestContext', 'warning message');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[TestContext] warning message',
        ''
      );
    });

    it('error logs with Error object in development', async () => {
      const { logger } = await import('../logger');
      const error = new Error('test error');

      logger.error('TestContext', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TestContext]',
        'test error',
        ''
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Stack trace:',
        expect.stringContaining('Error: test error')
      );
    });

    it('error logs with string message in development', async () => {
      const { logger } = await import('../logger');

      logger.error('TestContext', 'error message', { context: 'data' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TestContext]',
        'error message',
        { context: 'data' }
      );
    });

    it('time utility works in development', async () => {
      const { logger } = await import('../logger');

      const endTimer = logger.time('TestContext', 'operation');

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));

      endTimer();

      // Check that timer was called with correct format (time will vary)
      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0];
      expect(call[0]).toMatch(/\[TestContext\] operation took \d+\.\d{2}ms/);
    });
  });

  describe('in production mode', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      vi.resetModules();
    });

    it('does not log debug messages in production', async () => {
      const { logger } = await import('../logger');

      logger.debug('TestContext', 'debug message');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('logs info messages in production', async () => {
      const { logger } = await import('../logger');

      logger.info('TestContext', 'info message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[TestContext] info message',
        ''
      );
    });

    it('logs warn messages in production', async () => {
      const { logger } = await import('../logger');

      logger.warn('TestContext', 'warning');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[TestContext] warning',
        ''
      );
    });

    it('logs error messages in production', async () => {
      const { logger } = await import('../logger');

      logger.error('TestContext', 'error message');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TestContext]',
        'error message',
        ''
      );
    });

    it('does not log stack trace in production', async () => {
      const { logger } = await import('../logger');
      const error = new Error('test error');

      consoleErrorSpy.mockClear();
      logger.error('TestContext', error);

      // Should only be called once (for the error message, not the stack)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[TestContext]',
        'test error',
        ''
      );
    });

    it('time utility returns no-op in production', async () => {
      const { logger } = await import('../logger');

      const endTimer = logger.time('TestContext', 'operation');
      endTimer();

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
    });

    it('handles empty context', async () => {
      const { logger } = await import('../logger');

      logger.info('', 'message');

      expect(consoleLogSpy).toHaveBeenCalledWith('[] message', '');
    });

    it('handles undefined data parameter', async () => {
      const { logger } = await import('../logger');

      logger.info('Context', 'message', undefined);

      expect(consoleLogSpy).toHaveBeenCalledWith('[Context] message', '');
    });

    it('handles null data parameter', async () => {
      const { logger } = await import('../logger');

      logger.info('Context', 'message', null);

      expect(consoleLogSpy).toHaveBeenCalledWith('[Context] message', null);
    });

    it('handles complex objects in data', async () => {
      const { logger } = await import('../logger');
      const complexData = {
        nested: { array: [1, 2, 3], obj: { key: 'value' } },
        func: () => {},
      };

      logger.debug('Context', 'message', complexData);

      expect(consoleLogSpy).toHaveBeenCalledWith('[Context] message', complexData);
    });

    it('handles Error object with additional data', async () => {
      const { logger } = await import('../logger');
      const error = new Error('test error');

      logger.error('Context', error, { requestId: '123' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Context]',
        'test error',
        { requestId: '123' }
      );
    });
  });
});
