# API Documentation

## Base URL

- **Local Development**: `http://localhost:3000`
- **Kubernetes (Internal)**: `http://backend:3000`

## Authentication

Currently, no authentication is required. JWT authentication can be added using the `JWT_SECRET` from secrets.

## Endpoints

### Health Check

#### `GET /health`

Health check endpoint for monitoring and Kubernetes probes.

**Response: 200 OK**
```json
{
  "status": "ok"
}
```

**Example:**
```bash
curl http://localhost:3000/health
```

---

### Root Endpoint

#### `GET /`

Returns the backend service status.

**Response: 200 OK**
```json
{
  "message": "Backend is running"
}
```

**Example:**
```bash
curl http://localhost:3000/
```

---

### Error Handling

#### Not Found

Any undefined endpoint returns a 404 error.

**Response: 404 Not Found**
```json
{
  "error": "Not found"
}
```

**Example:**
```bash
curl http://localhost:3000/invalid-endpoint
```

---

## Response Format

All API responses follow a consistent JSON structure:

### Success Response
```json
{
  "message": "string",
  "data": {} // optional
}
```

### Error Response
```json
{
  "error": "string",
  "details": {} // optional
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request successful |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Authentication required |
| 404  | Not Found - Resource doesn't exist |
| 500  | Internal Server Error |

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production:

```javascript
// Example with express-rate-limit
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## CORS

CORS can be enabled via the `ENABLE_CORS` configuration in ConfigMap.

## Future Endpoints

Planned endpoints for expansion:

- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Testing the API

### Using curl

```bash
# Health check
curl -X GET http://localhost:3000/health

# Get status
curl -X GET http://localhost:3000/

# With headers
curl -X GET http://localhost:3000/ \
  -H "Content-Type: application/json"
```

### Using Postman

Import the following collection:

```json
{
  "info": {
    "name": "Hackathon API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/health"
      }
    },
    {
      "name": "Root",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/"
      }
    }
  ]
}
```

## Monitoring

Monitor API health with:

```bash
# Continuous health check
watch -n 5 curl -s http://localhost:3000/health

# In Kubernetes
kubectl exec -it <pod-name> -- curl localhost:3000/health
```
