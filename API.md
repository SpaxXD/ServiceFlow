# ServiceFlow API Documentation

Complete API reference for ServiceFlow backend.

## Base URL

- Development: `http://localhost:3000`
- Production: `https://api.your-domain.com`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

### Include Token in Requests

```bash
# In Authorization header
Authorization: Bearer <jwt_token>

# Example with curl
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3000/api/clients
```

## HTTP Status Codes

- `200` - OK (successful GET/PUT/PATCH)
- `201` - Created (successful POST)
- `204` - No Content (successful DELETE)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate email, etc.)
- `500` - Internal Server Error

## Error Response Format

All error responses follow this format:

```json
{
  "statusCode": 400,
  "error": "Validation Error",
  "message": "Invalid request body",
  "details": [
    {
      "field": "email",
      "reason": "Invalid email format"
    }
  ]
}
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "role": "user"
}
```

**Query Parameters:**
- `role` (optional): `user`, `manager`, or `admin` (defaults to `user`)

**Success Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "user",
  "createdAt": "2024-02-14T10:00:00Z"
}
```

**Error Examples:**
```json
{
  "statusCode": 400,
  "error": "Validation Error",
  "message": "Password too weak",
  "details": []
}
```

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Email already registered",
  "details": []
}
```

### Login

Authenticate and receive JWT tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "manager"
  }
}
```

**Error Examples:**
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password",
  "details": []
}
```

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

Invalidate refresh token.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (204):** No content

---

## Client Endpoints

### List Clients

Get paginated list of clients.

**Endpoint:** `GET /api/clients`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional, default=1): Page number
- `pageSize` (optional, default=10): Items per page
- `search` (optional): Search by name or email

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Acme Corp",
      "email": "contact@acme.com",
      "createdAt": "2024-02-14T10:00:00Z",
      "updatedAt": "2024-02-14T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

**Example Requests:**
```bash
# First page
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/clients"

# Search with pagination
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/clients?page=2&pageSize=20&search=acme"
```

### Create Client

Create a new client.

**Endpoint:** `POST /api/clients`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Client",
  "email": "contact@newclient.com"
}
```

**Permissions:** Requires `manager` or `admin` role

**Success Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "New Client",
  "email": "contact@newclient.com",
  "createdAt": "2024-02-14T10:30:00Z",
  "updatedAt": "2024-02-14T10:30:00Z"
}
```

**Error Examples:**
```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Email already in use",
  "details": []
}
```

### Get Client

Retrieve a specific client.

**Endpoint:** `GET /api/clients/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "createdAt": "2024-02-14T10:00:00Z",
  "updatedAt": "2024-02-14T10:00:00Z"
}
```

### Update Client

Update client information.

**Endpoint:** `PUT /api/clients/:id`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@acme.com"
}
```

**Permissions:** Only `admin` or client's assigned manager can edit

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Updated Name",
  "email": "newemail@acme.com",
  "createdAt": "2024-02-14T10:00:00Z",
  "updatedAt": "2024-02-14T11:00:00Z"
}
```

### Delete Client

Remove a client.

**Endpoint:** `DELETE /api/clients/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** Only `admin` can delete

**Success Response (204):** No content

**Error Examples:**
```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "You don't have permission to delete this client",
  "details": []
}
```

---

## Service Endpoints

### List Services

Get paginated list of services.

**Endpoint:** `GET /api/services`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional, default=1): Page number
- `pageSize` (optional, default=10): Items per page
- `search` (optional): Search by title or description
- `status` (optional): Filter by status - `pending`, `in_progress`, `completed`
- `clientId` (optional): Filter by client ID

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "clientId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Website Redesign",
      "description": "Complete redesign of company website",
      "value": 5000.00,
      "status": "in_progress",
      "createdAt": "2024-02-14T10:00:00Z",
      "updatedAt": "2024-02-14T10:00:00Z",
      "client": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Acme Corp"
      }
    }
  ],
  "pagination": {
    "total": 87,
    "page": 1,
    "pageSize": 10,
    "totalPages": 9
  }
}
```

**Example Requests:**
```bash
# All services
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/services"

# Filter by status and client
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/services?status=completed&clientId=550e8400..."

# Search with pagination
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/services?page=2&search=design"
```

### Create Service

Create a new service.

**Endpoint:** `POST /api/services`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Mobile App Development",
  "description": "Build iOS and Android apps",
  "value": 25000.00
}
```

**Permissions:** Requires `manager` or `admin` role

**Success Response (201):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Mobile App Development",
  "description": "Build iOS and Android apps",
  "value": 25000.00,
  "status": "pending",
  "createdAt": "2024-02-14T10:30:00Z",
  "updatedAt": "2024-02-14T10:30:00Z"
}
```

### Get Service

Retrieve a specific service.

**Endpoint:** `GET /api/services/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Website Redesign",
  "description": "Complete redesign of company website",
  "value": 5000.00,
  "status": "in_progress",
  "createdAt": "2024-02-14T10:00:00Z",
  "updatedAt": "2024-02-14T10:00:00Z",
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Acme Corp"
  }
}
```

### Update Service

Update service information.

**Endpoint:** `PUT /api/services/:id`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "value": 6000.00,
  "status": "completed"
}
```

**Status Values:** `pending`, `in_progress`, `completed`

**Success Response (200):**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated Title",
  "description": "Updated description",
  "value": 6000.00,
  "status": "completed",
  "createdAt": "2024-02-14T10:00:00Z",
  "updatedAt": "2024-02-14T11:30:00Z"
}
```

### Delete Service

Remove a service.

**Endpoint:** `DELETE /api/services/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** Only `admin` can delete

**Success Response (204):** No content

---

## Dashboard Endpoints

### Get Dashboard Metrics

Retrieve dashboard statistics.

**Endpoint:** `GET /api/dashboard/metrics`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "totalClients": 42,
  "totalServices": 87,
  "totalRevenue": 450000.00,
  "statusBreakdown": {
    "pending": 15,
    "in_progress": 35,
    "completed": 37
  },
  "completionRate": 42.5,
  "averageServiceValue": 5172.41,
  "pendingRevenue": 77500.00,
  "completedRevenue": 192000.00,
  "lastUpdated": "2024-02-14T14:30:00Z"
}
```

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/dashboard/metrics"
```

---

## Audit Logs Endpoints

### List Audit Logs

Get paginated audit trail.

**Endpoint:** `GET /api/audit-logs`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional, default=1): Page number
- `pageSize` (optional, default=10): Items per page
- `entityType` (optional): Filter by `User`, `Client`, or `Service`
- `action` (optional): Filter by `CREATE`, `UPDATE`, or `DELETE`

**Success Response (200):**
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "user": {
        "email": "admin@serviceflow.com"
      },
      "entityType": "Client",
      "entityId": "550e8400-e29b-41d4-a716-446655440001",
      "action": "CREATE",
      "oldValues": null,
      "newValues": {
        "name": "New Client",
        "email": "contact@newclient.com"
      },
      "createdAt": "2024-02-14T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 256,
    "page": 1,
    "pageSize": 10,
    "totalPages": 26
  }
}
```

**Permissions:** Only `admin` can view audit logs

---

## Testing Endpoints

### Health Check

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-02-14T14:30:00Z"
}
```

---

## Common Patterns

### Pagination Pattern

All list endpoints support pagination:

```bash
# Second page, 20 items per page
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/clients?page=2&pageSize=20"
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 2,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### Search Pattern

Services and clients support full-text search:

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/clients?search=acme"
```

Search fields:
- **Clients**: name, email
- **Services**: title, description

### Filtering Pattern

Services support filtering by status and client:

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/services?status=completed&clientId=550e8400..."
```

---

## Rate Limiting

- 100 requests per 15 minutes per IP
- Returns `429 Too Many Requests` when exceeded

---

## CORS Configuration

Frontend URL is whitelisted in CORS:

```
Allowed Origins: http://localhost:5173, https://your-domain.com
Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: Content-Type, Authorization
```

---

## Request/Response Examples with cURL

### Complete Login Flow

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "role": "user"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }' | jq '.accessToken'

# Use access token for subsequent requests
TOKEN="<token_from_login>"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/clients
```

### Complete Client Management Flow

```bash
TOKEN="<your_access_token>"

# Create client
CLIENT_ID=$(curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Client","email":"client@example.com"}' | jq -r '.id')

# Get client
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/clients/$CLIENT_ID

# Update client
curl -X PUT http://localhost:3000/api/clients/$CLIENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newemail@example.com"}'

# Delete client
curl -X DELETE http://localhost:3000/api/clients/$CLIENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### 401 Unauthorized
- Token is missing or expired
- Solution: Login again to get fresh token

### 403 Forbidden
- You don't have permission for this action
- Solution: Check your role and verify you're trying to access your own resources

### 409 Conflict
- Duplicate email or unique constraint violation
- Solution: Use a different email or check if resource already exists

### 500 Internal Server Error
- Unexpected server error
- Solution: Check server logs for details

---

For more information, see [README.md](./README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md)
