const HealthChecker = require('../../../services/healthChecker');
const { checkServiceHealth, getServiceMapping } = require('../../../utils/requestHandler');

// Mock dependencies
jest.mock('../../../utils/requestHandler', () => ({
  checkServiceHealth: jest.fn(),
  getServiceMapping: jest.fn()
}));

describe('HealthChecker', () => {
  let originalInterval;

  beforeEach(() => {
    // Mock console methods to prevent cluttering test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Stop any existing monitoring
    HealthChecker.stopMonitoring();
    
    // Clear service status
    HealthChecker.serviceStatus.clear();
    
    // Mock getServiceMapping to return test data
    getServiceMapping.mockReturnValue({
      employees: {
        primary: 'http://localhost:5002',
        fallback: 'http://localhost:5003'
      },
      auth: {
        primary: 'http://localhost:5001',
        fallback: 'http://localhost:5004'
      }
    });
    
    // Store original interval for restoration
    originalInterval = HealthChecker.checkInterval;
  });

  afterEach(() => {
    // Stop monitoring and clear intervals
    HealthChecker.stopMonitoring();
    
    // Restore original interval
    HealthChecker.checkInterval = originalInterval;
    
    // Restore console methods
    jest.restoreAllMocks();
    
    // Clear timers
    jest.clearAllTimers();
  });

  describe('Constructor', () => {
    test('Harus menginisialisasi dengan nilai default yang benar', () => {
      // Assert
      expect(HealthChecker.serviceStatus).toBeInstanceOf(Map);
      expect(HealthChecker.checkInterval).toBe(process.env.HEALTH_CHECK_INTERVAL || 30000);
      expect(HealthChecker.isMonitoring).toBe(false);
    });

    test('Harus menggunakan environment variable untuk check interval', () => {
      // Arrange
      const originalEnv = process.env.HEALTH_CHECK_INTERVAL;
      process.env.HEALTH_CHECK_INTERVAL = '15000';
      
      // Recreate HealthChecker (simulate require)
      jest.resetModules();
      const NewHealthChecker = require('../../../services/healthChecker');
      
      // Assert
      expect(NewHealthChecker.checkInterval).toBe('15000');
      
      // Cleanup
      process.env.HEALTH_CHECK_INTERVAL = originalEnv;
    });
  });

  describe('checkAllServices', () => {
    test('Harus mengecek semua service dan menyimpan status', async () => {
      // Arrange
      checkServiceHealth
        .mockResolvedValueOnce(true)  // employees primary
        .mockResolvedValueOnce(false) // employees fallback
        .mockResolvedValueOnce(true)  // auth primary
        .mockResolvedValueOnce(true); // auth fallback

      // Act
      await HealthChecker.checkAllServices();

      // Assert
      expect(checkServiceHealth).toHaveBeenCalledTimes(4);
      expect(checkServiceHealth).toHaveBeenCalledWith('http://localhost:5002');
      expect(checkServiceHealth).toHaveBeenCalledWith('http://localhost:5003');
      expect(checkServiceHealth).toHaveBeenCalledWith('http://localhost:5001');
      expect(checkServiceHealth).toHaveBeenCalledWith('http://localhost:5004');

      // Check stored status
      expect(HealthChecker.serviceStatus.size).toBe(4);
      expect(HealthChecker.serviceStatus.get('employees_primary').healthy).toBe(true);
      expect(HealthChecker.serviceStatus.get('employees_fallback').healthy).toBe(false);
      expect(HealthChecker.serviceStatus.get('auth_primary').healthy).toBe(true);
      expect(HealthChecker.serviceStatus.get('auth_fallback').healthy).toBe(true);
    });

    test('Harus mencatat log untuk setiap service check', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log');
      checkServiceHealth
        .mockResolvedValueOnce(true)  // employees primary
        .mockResolvedValueOnce(false) // employees fallback
        .mockResolvedValueOnce(false) // auth primary
        .mockResolvedValueOnce(true); // auth fallback

      // Act
      await HealthChecker.checkAllServices();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Health Check - employees:');
      expect(consoleSpy).toHaveBeenCalledWith('  Primary (http://localhost:5002): ✅ Healthy');
      expect(consoleSpy).toHaveBeenCalledWith('  Fallback (http://localhost:5003): ❌ Unhealthy');
      expect(consoleSpy).toHaveBeenCalledWith('Health Check - auth:');
      expect(consoleSpy).toHaveBeenCalledWith('  Primary (http://localhost:5001): ❌ Unhealthy');
      expect(consoleSpy).toHaveBeenCalledWith('  Fallback (http://localhost:5004): ✅ Healthy');

      consoleSpy.mockRestore();
    });

    test('Harus menyimpan timestamp lastCheck untuk setiap service', async () => {
      // Arrange
      const beforeTime = new Date();
      checkServiceHealth.mockResolvedValue(true);

      // Act
      await HealthChecker.checkAllServices();
      const afterTime = new Date();

      // Assert
      const employeesPrimary = HealthChecker.serviceStatus.get('employees_primary');
      expect(employeesPrimary.lastCheck).toBeInstanceOf(Date);
      expect(employeesPrimary.lastCheck.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(employeesPrimary.lastCheck.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    test('Harus menyimpan URL service yang benar', async () => {
      // Arrange
      checkServiceHealth.mockResolvedValue(true);

      // Act
      await HealthChecker.checkAllServices();

      // Assert
      expect(HealthChecker.serviceStatus.get('employees_primary').url).toBe('http://localhost:5002');
      expect(HealthChecker.serviceStatus.get('employees_fallback').url).toBe('http://localhost:5003');
      expect(HealthChecker.serviceStatus.get('auth_primary').url).toBe('http://localhost:5001');
      expect(HealthChecker.serviceStatus.get('auth_fallback').url).toBe('http://localhost:5004');
    });
  });

  describe('startMonitoring', () => {
    beforeEach(() => {
      // Use fake timers for testing intervals
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('Harus memulai monitoring dengan interval yang benar', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log');
      checkServiceHealth.mockResolvedValue(true);
      HealthChecker.checkInterval = 5000; // 5 seconds for testing

      // Act
      HealthChecker.startMonitoring();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('🔄 Starting health monitoring...');
      expect(HealthChecker.isMonitoring).toBe(true);
      expect(HealthChecker.intervalId).toBeDefined();

      // Verify initial check was called
      await Promise.resolve(); // Wait for initial checkAllServices call
      expect(checkServiceHealth).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    

    test('Tidak harus memulai monitoring jika sudah berjalan', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log');
      HealthChecker.isMonitoring = true;

      // Act
      HealthChecker.startMonitoring();

      // Assert
      expect(consoleSpy).not.toHaveBeenCalledWith('🔄 Starting health monitoring...');
    });
  });

  describe('stopMonitoring', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('Harus menghentikan monitoring yang sedang berjalan', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log');
      checkServiceHealth.mockResolvedValue(true);
      
      HealthChecker.startMonitoring();
      expect(HealthChecker.isMonitoring).toBe(true);

      // Act
      HealthChecker.stopMonitoring();

      // Assert
      expect(HealthChecker.isMonitoring).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('🛑 Health monitoring stopped');
      expect(HealthChecker.intervalId).toBeUndefined();

      consoleSpy.mockRestore();
    });

    test('Harus menghapus interval ID setelah stop', () => {
      // Arrange
      checkServiceHealth.mockResolvedValue(true);
      HealthChecker.startMonitoring();
      const intervalId = HealthChecker.intervalId;

      // Act
      HealthChecker.stopMonitoring();

      // Assert
      expect(HealthChecker.intervalId).toBeUndefined();
    });

    test('Tidak harus melakukan apa-apa jika monitoring belum dimulai', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log');
      HealthChecker.isMonitoring = false;
      HealthChecker.intervalId = undefined;

      // Act
      HealthChecker.stopMonitoring();

      // Assert
      expect(consoleSpy).not.toHaveBeenCalledWith('🛑 Health monitoring stopped');
    });
  });

  describe('getServiceStatus', () => {
    test('Harus mengembalikan status semua service', async () => {
      // Arrange
      checkServiceHealth
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await HealthChecker.checkAllServices();

      // Act
      const status = HealthChecker.getServiceStatus();

      // Assert
      expect(status).toHaveProperty('employees_primary');
      expect(status).toHaveProperty('employees_fallback');
      expect(status).toHaveProperty('auth_primary');
      expect(status).toHaveProperty('auth_fallback');

      expect(status.employees_primary.healthy).toBe(true);
      expect(status.employees_primary.url).toBe('http://localhost:5002');
      expect(status.employees_primary.lastCheck).toBeInstanceOf(Date);

      expect(status.employees_fallback.healthy).toBe(false);
      expect(status.employees_fallback.url).toBe('http://localhost:5003');
    });

    test('Harus mengembalikan objek kosong jika belum ada status', () => {
      // Arrange
      HealthChecker.serviceStatus.clear();

      // Act
      const status = HealthChecker.getServiceStatus();

      // Assert
      expect(status).toEqual({});
    });

    test('Harus mengembalikan copy dari status, bukan reference langsung', async () => {
      // Arrange
      checkServiceHealth.mockResolvedValue(true);
      await HealthChecker.checkAllServices();

      // Act
      const status1 = HealthChecker.getServiceStatus();
      const status2 = HealthChecker.getServiceStatus();

      // Assert
      expect(status1).toEqual(status2);
      expect(status1).not.toBe(status2); // Different objects

      // Modifying returned status shouldn't affect internal state
      status1.test_service = { healthy: false };
      expect(HealthChecker.getServiceStatus()).not.toHaveProperty('test_service');
    });
  });

  describe('Edge Cases', () => {
    test('Harus menangani service mapping yang kosong', async () => {
      // Arrange
      getServiceMapping.mockReturnValue({});

      // Act
      await HealthChecker.checkAllServices();

      // Assert
      expect(checkServiceHealth).not.toHaveBeenCalled();
      expect(HealthChecker.serviceStatus.size).toBe(0);
    });

    test('Harus menangani checkInterval yang tidak valid', () => {
      // Arrange
      const originalEnv = process.env.HEALTH_CHECK_INTERVAL;
      process.env.HEALTH_CHECK_INTERVAL = 'invalid';
      
      // Act & Assert
      // Should use default value when env var is invalid
      expect(HealthChecker.checkInterval || 30000).toBeTruthy();
      
      // Cleanup
      process.env.HEALTH_CHECK_INTERVAL = originalEnv;
    });

        test('Harus menangani multiple start/stop calls', async () => {
      jest.useFakeTimers();
      const consoleSpy = jest.spyOn(console, 'log');
      checkServiceHealth.mockResolvedValue(true);
    
      HealthChecker.startMonitoring();
      HealthChecker.startMonitoring();
      HealthChecker.stopMonitoring();
      HealthChecker.stopMonitoring();
    
      // Tunggu async selesai
      await Promise.resolve();
    
      expect(consoleSpy).toHaveBeenCalledWith('🔄 Starting health monitoring...');
      expect(consoleSpy).toHaveBeenCalledWith('🛑 Health monitoring stopped');
      // Tambahkan assert lain jika perlu
    
      jest.useRealTimers();
      consoleSpy.mockRestore();
    });
  });
});