# WWS Weaver Backend Server

A simple Express proxy server to bypass CORS restrictions when making requests to Workday APIs.

## Features

- **CORS Proxy**: Allows frontend to make Workday API calls without CORS issues
- **Credential Testing**: Validates Workday credentials before using them
- **SOAP Request Proxy**: Forwards SOAP requests to Workday with proper authentication

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create a `.env` file (optional):
```bash
cp .env.example .env
```

3. Start the server:
```bash
npm start        # Production
npm run dev      # Development with auto-reload
```

## API Endpoints

### Health Check
```
GET /health
```

Returns server status.

### Test Workday Credentials
```
POST /api/workday/test-credentials
Content-Type: application/json

{
  "tenantUrl": "https://wd2-impl-services1.workday.com/ccx/service/your_tenant",
  "username": "ISU_Admin@your_tenant",
  "password": "your_password",
  "service": "Human_Resources"  // Optional, defaults to "Human_Resources"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Credentials are valid! Successfully connected to Workday.",
  "tenantUrl": "https://...",
  "service": "Human_Resources"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Authentication failed",
  "details": "Invalid username or password"
}
```

### Proxy SOAP Request
```
POST /api/workday/soap
Content-Type: application/json

{
  "tenantUrl": "https://wd2-impl-services1.workday.com/ccx/service/your_tenant",
  "username": "ISU_Admin@your_tenant",
  "password": "your_password",
  "service": "Human_Resources",
  "soapEnvelope": "<?xml version=\"1.0\"?>..."
}
```

Returns the raw XML response from Workday.

## Security Notes

- This server should only be used for development/testing
- For production, implement proper authentication and authorization
- Never commit actual credentials to version control
- Consider using environment variables for sensitive data

## Development

The server runs on port 3001 by default. You can change this in `.env`:

```
PORT=3001
```

The frontend should be configured to make API calls to `http://localhost:3001/api/workday/*`
