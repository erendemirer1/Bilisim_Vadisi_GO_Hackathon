const http = require("http");

const PORT = process.env.PORT || 3000;

// Monitoring metrics
let metrics = {
  requestCount: 0,
  errorCount: 0,
  healthCheckCount: 0,
  startTime: Date.now(),
};

// Helper function for standardized JSON responses
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(data));
};

// Prometheus metrics formatter
const formatMetrics = () => {
  const uptime = Math.floor((Date.now() - metrics.startTime) / 1000);
  const memUsage = process.memoryUsage();

  return `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${metrics.requestCount}

# HELP http_errors_total Total number of HTTP errors
# TYPE http_errors_total counter
http_errors_total ${metrics.errorCount}

# HELP health_checks_total Total number of health checks
# TYPE health_checks_total counter
health_checks_total ${metrics.healthCheckCount}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${uptime}

# HELP nodejs_memory_heap_used_bytes Node.js heap memory used in bytes
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memUsage.heapUsed}

# HELP nodejs_memory_heap_total_bytes Node.js heap memory total in bytes
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memUsage.heapTotal}

# HELP nodejs_memory_rss_bytes Node.js RSS memory in bytes
# TYPE nodejs_memory_rss_bytes gauge
nodejs_memory_rss_bytes ${memUsage.rss}
`;
};

const server = http.createServer((req, res) => {
  // CORS headers for development
  if (process.env.ENABLE_CORS === "true") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }

  metrics.requestCount++;

  // Health check endpoint
  if (req.url === "/health") {
    metrics.healthCheckCount++;
    return sendJSON(res, 200, {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - metrics.startTime) / 1000),
    });
  }

  // Metrics endpoint for Prometheus
  if (req.url === "/metrics") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end(formatMetrics());
  }

  // Root endpoint
  if (req.url === "/") {
    return sendJSON(res, 200, {
      success: true,
      message: "Backend is running",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  }

  // 404 handler
  metrics.errorCount++;
  sendJSON(res, 404, {
    success: false,
    error: "Not found",
    path: req.url,
  });
});

server.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Metrics: http://localhost:${PORT}/metrics`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
