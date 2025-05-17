import mongoose from "mongoose";

// Health check controller
export const checkHealth = async (req, res) => {
  try {
    // Check database connection
    const dbStatus =
      mongoose.connection.readyState === 1
        ? { status: "ok", message: "Database connection is healthy" }
        : {
            status: "error",
            message: "Database connection is not established",
          };

    // Service dependencies health checks can be added here
    const services = {
      book_service: { status: "ok", message: "Book service is running" },
      database: dbStatus,
      // Add other dependent services here as needed
    };

    // Overall health status is 'error' if any service is unhealthy
    const overallStatus = Object.values(services).some(
      (service) => service.status === "error"
    )
      ? "error"
      : "ok";

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: `Health check failed: ${error.message}`,
      timestamp: new Date().toISOString(),
    });
  }
};
