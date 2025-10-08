const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/xml' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WWS Weaver Server is running' });
});

// OAuth 2.0 Token Generation endpoint
app.post('/api/workday/oauth/token', async (req, res) => {
  try {
    const { tokenUrl, clientId, clientSecret } = req.body;

    if (!tokenUrl || !clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        error: 'Missing required OAuth parameters: tokenUrl, clientId, and clientSecret are required'
      });
    }

    // Prepare the token request (client_credentials grant type)
    const tokenRequestData = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    });

    // Request the token
    const response = await axios.post(tokenUrl, tokenRequestData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000
    });

    if (response.data.access_token) {
      res.json({
        success: true,
        access_token: response.data.access_token,
        token_type: response.data.token_type || 'Bearer',
        expires_in: response.data.expires_in,
        message: 'OAuth token generated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Token generation failed',
        details: 'No access token received from OAuth server'
      });
    }

  } catch (error) {
    console.error('Error generating OAuth token:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: 'OAuth token generation failed',
        details: error.response.data.error_description || error.response.data.error || 'Invalid client credentials'
      });
    }

    res.status(500).json({
      success: false,
      error: 'An error occurred while generating OAuth token',
      details: error.message
    });
  }
});

// Helper function to build SOAP headers based on auth type
function buildSoapHeaders(authType, authData) {
  const headers = {
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': ''
  };

  if (authType === 'oauth' || authType === 'refresh_token') {
    // Bearer token authentication
    headers['Authorization'] = `Bearer ${authData.token}`;
  }
  // For basic auth, credentials are in the SOAP envelope itself

  return headers;
}

// Helper function to build SOAP envelope with authentication
function buildAuthenticatedSoapEnvelope(soapBody, authType, authData) {
  let securityHeader = '';

  if (authType === 'basic') {
    // WS-Security UsernameToken for basic auth
    securityHeader = `
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${authData.username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${authData.password}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <env:Header>${securityHeader}</env:Header>
  <env:Body>${soapBody}</env:Body>
</env:Envelope>`;
}

// Test Workday credentials endpoint (supports all auth types)
app.post('/api/workday/test-credentials', async (req, res) => {
  try {
    const { tenantUrl, authType, username, password, refreshToken, oauthToken, service } = req.body;

    if (!tenantUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: tenantUrl'
      });
    }

    // Validate auth type specific credentials
    if (authType === 'basic' && (!username || !password)) {
      return res.status(400).json({
        success: false,
        error: 'Basic auth requires username and password'
      });
    }

    if (authType === 'refresh_token' && !refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token authentication requires a refresh token'
      });
    }

    if (authType === 'oauth' && !oauthToken) {
      return res.status(400).json({
        success: false,
        error: 'OAuth authentication requires an access token'
      });
    }

    // Construct the full Workday API URL
    const workdayUrl = `${tenantUrl}/${service || 'Human_Resources'}`;

    // Simple Get_Workers SOAP body for testing
    const soapBody = `
    <bsvc:Get_Workers_Request xmlns:bsvc="urn:com.workday/bsvc" bsvc:version="v39.1">
      <bsvc:Request_Criteria>
        <bsvc:Transaction_Log_Criteria_Data>
          <bsvc:Transaction_Date_Range_Data>
            <bsvc:Updated_From>2024-01-01T00:00:00.000-00:00</bsvc:Updated_From>
            <bsvc:Updated_Through>2024-01-01T00:00:01.000-00:00</bsvc:Updated_Through>
          </bsvc:Transaction_Date_Range_Data>
        </bsvc:Transaction_Log_Criteria_Data>
      </bsvc:Request_Criteria>
      <bsvc:Response_Group>
        <bsvc:Include_Reference>true</bsvc:Include_Reference>
        <bsvc:Include_Personal_Information>false</bsvc:Include_Personal_Information>
        <bsvc:Include_Employment_Information>false</bsvc:Include_Employment_Information>
      </bsvc:Response_Group>
    </bsvc:Get_Workers_Request>`;

    // Build authentication data
    let authData = {};
    if (authType === 'basic') {
      authData = { username, password };
    } else if (authType === 'refresh_token') {
      authData = { token: refreshToken };
    } else if (authType === 'oauth') {
      authData = { token: oauthToken };
    }

    // Build SOAP envelope and headers
    const soapEnvelope = buildAuthenticatedSoapEnvelope(soapBody, authType || 'basic', authData);
    const headers = buildSoapHeaders(authType || 'basic', authData);

    // Make the SOAP request to Workday
    const response = await axios.post(workdayUrl, soapEnvelope, {
      headers,
      timeout: 30000
    });

    // Parse the response to check for errors
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    // Check if response contains a fault
    if (result['env:Envelope'] && result['env:Envelope']['env:Body'] && result['env:Envelope']['env:Body']['env:Fault']) {
      const fault = result['env:Envelope']['env:Body']['env:Fault'];
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        details: fault.faultstring || 'Invalid credentials or insufficient permissions',
        authType: authType || 'basic'
      });
    }

    // If we got here, credentials are valid
    res.json({
      success: true,
      message: `Credentials are valid! Successfully connected to Workday using ${authType === 'oauth' ? 'OAuth 2.0' : authType === 'refresh_token' ? 'Refresh Token' : 'Basic Auth'}.`,
      tenantUrl,
      service: service || 'Human_Resources',
      authType: authType || 'basic'
    });

  } catch (error) {
    console.error('Error testing Workday credentials:', error);

    // Handle specific error cases
    if (error.response) {
      if (error.response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          details: 'Invalid credentials or expired token'
        });
      } else if (error.response.status === 404) {
        return res.status(404).json({
          success: false,
          error: 'Service not found',
          details: 'The specified tenant URL or service endpoint could not be found'
        });
      }
    } else if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Connection refused',
        details: 'Unable to connect to Workday. Please check the tenant URL.'
      });
    } else if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout',
        details: 'The request to Workday timed out. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'An error occurred while testing credentials',
      details: error.message
    });
  }
});

// Proxy endpoint for making Workday SOAP requests (supports all auth types)
app.post('/api/workday/soap', async (req, res) => {
  try {
    const { tenantUrl, authType, username, password, refreshToken, oauthToken, soapBody, service } = req.body;

    if (!tenantUrl || !soapBody) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: tenantUrl and soapBody'
      });
    }

    const workdayUrl = `${tenantUrl}/${service || 'Human_Resources'}`;

    // Build authentication data
    let authData = {};
    if (authType === 'basic') {
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Basic auth requires username and password'
        });
      }
      authData = { username, password };
    } else if (authType === 'refresh_token') {
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token authentication requires a refresh token'
        });
      }
      authData = { token: refreshToken };
    } else if (authType === 'oauth') {
      if (!oauthToken) {
        return res.status(400).json({
          success: false,
          error: 'OAuth authentication requires an access token'
        });
      }
      authData = { token: oauthToken };
    }

    // Build SOAP envelope and headers
    const soapEnvelope = buildAuthenticatedSoapEnvelope(soapBody, authType || 'basic', authData);
    const headers = buildSoapHeaders(authType || 'basic', authData);

    const response = await axios.post(workdayUrl, soapEnvelope, {
      headers,
      timeout: 60000
    });

    res.set('Content-Type', 'text/xml');
    res.send(response.data);

  } catch (error) {
    console.error('Error making Workday SOAP request:', error);

    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).json({
        success: false,
        error: 'An error occurred while making the request',
        details: error.message
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WWS Weaver Server running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Test credentials: POST http://localhost:${PORT}/api/workday/test-credentials`);
  console.log(`🔑 OAuth token: POST http://localhost:${PORT}/api/workday/oauth/token`);
  console.log(`🌐 SOAP proxy: POST http://localhost:${PORT}/api/workday/soap`);
});
