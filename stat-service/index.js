import express from "express";
import cors from "cors";

const app = express();

// Middleware
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

app.use(express.json());

// Routes
// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to Smart Library System API' });
// });

// Import routes
import statsRoutes from "./routes/statsRoutes.js";

// Use routes
app.use("/api/stats", statsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
