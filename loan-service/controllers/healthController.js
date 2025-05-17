import { checkBookServiceHealth } from "../services/BookApi.js";
import { checkUserServiceHealth } from "../services/UserApi.js";

// Health check controller
export const checkHealth = async (req, res) => {
  try {
    const services = {
      loan_service: { status: "ok", message: "Loan service is running" },
      book_service: await checkBookServiceHealth(),
      user_service: await checkUserServiceHealth(),
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
