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

// Test Workday credentials endpoint
app.post('/api/workday/test-credentials', async (req, res) => {
  try {
    const { tenantUrl, username, password, service } = req.body;

    if (!tenantUrl || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required credentials: tenantUrl, username, and password are required'
      });
    }

    // Construct the full Workday API URL
    const workdayUrl = `${tenantUrl}/${service || 'Human_Resources'}`;

    // Simple SOAP envelope for testing credentials (Get_Workers with minimal params)
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <env:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${password}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </env:Header>
  <env:Body>
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
    </bsvc:Get_Workers_Request>
  </env:Body>
</env:Envelope>`;

    // Make the SOAP request to Workday
    const response = await axios.post(workdayUrl, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': ''
      },
      timeout: 30000 // 30 second timeout
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
        details: fault.faultstring || 'Invalid credentials or insufficient permissions'
      });
    }

    // If we got here, credentials are valid
    res.json({
      success: true,
      message: 'Credentials are valid! Successfully connected to Workday.',
      tenantUrl,
      service: service || 'Human_Resources'
    });

  } catch (error) {
    console.error('Error testing Workday credentials:', error);

    // Handle specific error cases
    if (error.response) {
      // Workday returned an error response
      if (error.response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          details: 'Invalid username or password'
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

    // Generic error
    res.status(500).json({
      success: false,
      error: 'An error occurred while testing credentials',
      details: error.message
    });
  }
});

// Proxy endpoint for making Workday SOAP requests
app.post('/api/workday/soap', async (req, res) => {
  try {
    const { tenantUrl, username, password, soapEnvelope, service } = req.body;

    if (!tenantUrl || !username || !password || !soapEnvelope) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    const workdayUrl = `${tenantUrl}/${service || 'Human_Resources'}`;

    // Replace credentials placeholder in SOAP envelope if present
    let finalSoapEnvelope = soapEnvelope;
    if (soapEnvelope.includes('${username}') || soapEnvelope.includes('${password}')) {
      finalSoapEnvelope = soapEnvelope
        .replace(/\${username}/g, username)
        .replace(/\${password}/g, password);
    }

    const response = await axios.post(workdayUrl, finalSoapEnvelope, {
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': ''
      },
      timeout: 60000 // 60 second timeout for data operations
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
  console.log(`🌐 SOAP proxy: POST http://localhost:${PORT}/api/workday/soap`);
});
