const express = require('express');
const app = express();
const promBundle = require("express-prom-bundle");

// Add the options to the prometheus middleware most option are for http_request_duration_seconds histogram metric
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    customLabels: {project_name: 'hello_world', project_type: process.env.CONTAINER_NAME},
    promClient: {
        collectDefaultMetrics: {
        }
      }
});


// Handle SIGTERM signal for graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal. Gracefully shutting down...');

    server.close(() => {
      console.log('Server closed. Exiting process.');
      process.exit(0);
    });
  });

// add the prometheus middleware to all routes
app.use(metricsMiddleware)

// default endpoint
app.get("/",(req,res) => res.json({
    "GET /": "All Routes",
    "GET /hello": "{hello:world}",
    "GET /metrics": "Metrics data",
    "POST /bye": "POST Request: + post data"
}));
// hello world rest endpoint
app.get("/hello", (req,res) => res.json({hello:"world"}));
app.post("/bye", (req,res) => res.send("POST Request : "+ req));

const server = app.listen(process.env.PORT, function () {
    console.log(`Listening at http://localhost:${process.env.PORT}`);
  });
