/**
 * Setup global para tests E2E
 */

// Aumentar timeout para operaciones de DB
jest.setTimeout(30000);

// Silenciar logs durante tests (opcional)
if (process.env.SILENT_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
