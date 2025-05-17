import CircuitBreaker from "opossum";

/**
 * Creates a circuit breaker for a function
 * @param {Function} fn - The function to circuit break
 * @param {String} fnName - The name of the function (for logging purposes)
 * @param {Object} options - Circuit breaker options
 * @returns {CircuitBreaker} - The configured circuit breaker
 */
export const createCircuitBreaker = (fn, fnName, options = {}) => {
  // Default circuit breaker settings
  const defaultOptions = {
    timeout: 5000, // Time in milliseconds before timing out the request
    errorThresholdPercentage: 50, // When % of requests fail, open the circuit
    resetTimeout: 10000, // Time to wait before trying requests again (in ms)
    volumeThreshold: 5, // Minimum number of requests before tripping circuit
    rollingCountTimeout: 10000, // Time in milliseconds over which to measure success/failure rates
    rollingCountBuckets: 10, // Number of buckets to retain statistics for
  };

  // Merge default options with any provided options
  const circuitOptions = { ...defaultOptions, ...options };

  // Create the circuit breaker
  const breaker = new CircuitBreaker(fn, circuitOptions);

  // Setup event listeners for logging and monitoring
  breaker.on("open", () => {
    console.warn(`Circuit breaker for ${fnName} is open (failing fast)`);
  });

  breaker.on("halfOpen", () => {
    console.info(`Circuit breaker for ${fnName} is half open (testing)`);
  });

  breaker.on("close", () => {
    console.info(
      `Circuit breaker for ${fnName} is closed (operating normally)`
    );
  });

  breaker.on("fallback", (result) => {
    console.warn(
      `Fallback for ${fnName} executed with result: ${JSON.stringify(result)}`
    );
  });

  return breaker;
};

/**
 * Default fallback function factory
 * @param {String} serviceName - Name of the service for logging
 * @param {Any} fallbackValue - The value to return when circuit is open
 * @returns {Function} - A fallback function that returns the fallback value
 */
export const createDefaultFallback = (serviceName, fallbackValue = null) => {
  return (error) => {
    console.error(
      `Circuit breaker fallback for ${serviceName}: ${error.message}`
    );
    return fallbackValue;
  };
};
