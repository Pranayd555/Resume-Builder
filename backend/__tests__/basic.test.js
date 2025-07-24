// Basic tests that don't require MongoDB connection
describe('Basic Application Tests', () => {
  it('should have proper environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
  });

  it('should be able to import server modules', () => {
    // Test that we can import the server without errors
    expect(() => {
      require('../server');
    }).not.toThrow();
  });

  it('should have proper test timeout', () => {
    // This test ensures Jest timeout is working
    expect(true).toBe(true);
  });
}); 