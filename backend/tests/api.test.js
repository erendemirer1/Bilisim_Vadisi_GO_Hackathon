const http = require("http");

/**
 * Test helper to make HTTP requests
 */
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on("error", reject);
    req.end();
  });
}

describe("Backend API Tests", () => {
  test("GET / should return backend status", async () => {
    const response = await makeRequest({
      hostname: "localhost",
      port: 3000,
      path: "/",
      method: "GET",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.message).toBe("Backend is running");
  });

  test("GET /health should return OK status", async () => {
    const response = await makeRequest({
      hostname: "localhost",
      port: 3000,
      path: "/health",
      method: "GET",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe("ok");
  });

  test("GET /nonexistent should return 404", async () => {
    const response = await makeRequest({
      hostname: "localhost",
      port: 3000,
      path: "/nonexistent",
      method: "GET",
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.body);
    expect(body.error).toBe("Not found");
  });
});
