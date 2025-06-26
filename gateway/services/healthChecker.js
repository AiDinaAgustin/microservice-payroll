const { checkServiceHealth, getServiceMapping } = require('../utils/requestHandler');

class HealthChecker {
  constructor() {
    this.serviceStatus = new Map();
    this.checkInterval = process.env.HEALTH_CHECK_INTERVAL || 30000;
    this.isMonitoring = false;
  }

  async checkAllServices() {
    const serviceMapping = getServiceMapping();
    
    for (const [serviceType, config] of Object.entries(serviceMapping)) {
      // Check primary service
      const primaryHealthy = await checkServiceHealth(config.primary);
      this.serviceStatus.set(`${serviceType}_primary`, {
        url: config.primary,
        healthy: primaryHealthy,
        lastCheck: new Date()
      });

      // Check fallback service
      const fallbackHealthy = await checkServiceHealth(config.fallback);
      this.serviceStatus.set(`${serviceType}_fallback`, {
        url: config.fallback,
        healthy: fallbackHealthy,
        lastCheck: new Date()
      });

      // Log status
      console.log(`Health Check - ${serviceType}:`);
      console.log(`  Primary (${config.primary}): ${primaryHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
      console.log(`  Fallback (${config.fallback}): ${fallbackHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    }
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    console.log('🔄 Starting health monitoring...');
    this.isMonitoring = true;
    
    // Initial check
    this.checkAllServices();
    
    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.checkAllServices();
    }, this.checkInterval);
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isMonitoring = false;
      console.log('🛑 Health monitoring stopped');
    }
  }

  getServiceStatus() {
    const status = {};
    
    for (const [key, value] of this.serviceStatus.entries()) {
      status[key] = value;
    }
    
    return status;
  }
}

module.exports = new HealthChecker();