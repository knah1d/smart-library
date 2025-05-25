import CircuitBreaker from "opossum";

export const createCircuitBreaker = (fn, fnName, options = {}) => {
    const defaultOptions = {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout:
            parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 10000,
        volumeThreshold: 5,
        rollingCountTimeout: 10000,
        rollingCountBuckets: 10,
    };

    const circuitOptions = { ...defaultOptions, ...options };

    const breaker = new CircuitBreaker(fn, circuitOptions);

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
            `Fallback for ${fnName} executed with result: ${JSON.stringify(
                result
            )}`
        );
    });

    return breaker;
};

export const createDefaultFallback = (serviceName, fallbackValue = null) => {
    return (error) => {
        console.error(
            `Circuit breaker fallback for ${serviceName}: ${error.message}`
        );
        return fallbackValue;
    };
};
