const express = require('express');
const PesapalV30Helper = require('./helpers/pesapalV30Helper');
const app = express();
const PORT = process.env.PORT || 3001;

require('dotenv').config();


app.use(express.json()); // Enable JSON parsing

const pesapalHelper = new PesapalV30Helper('demo'); // Use 'live' for production

// Middleware to generate access token for every request
const generateAccessTokenMiddleware = async (req, res, next) => {
  try {
    const tokenData = await pesapalHelper.getAccessToken(process.env.CONSUMER_KEY, process.env.CONSUMER_SECRET);
    req.accessToken = tokenData.token;  // Store the token in the request object
    // console.log('Access Token Generated:', req.accessToken);
    next();  // Proceed to the next middleware or route handler
  } catch (error) {
    // console.error('Error generating access token:', error.message);
    res.status(500).json({ error: 'Error generating access token' });
  }
};

// Apply the middleware to the routes that need a fresh token
app.use(generateAccessTokenMiddleware);

// Route for submitting an order
app.post('/api/submit-order', async (req, res) => {
    const orderPayload = req.body;

    const request = {
        id: orderPayload.id,
        currency: orderPayload.currency,
        amount: orderPayload.amount,
        description: orderPayload.description,
        callback_url: orderPayload.callback_url,
        notification_id: orderPayload.notification_id,
        billing_address: orderPayload.billing_address,
    };

    if (!request.id || !request.currency || !request.amount || !request.callback_url || !request.notification_id) {
        return res.status(400).json({ error: 'Required fields are missing in the request payload' });
    }

    try {
        // Use the accessToken from the middleware
        const orderResponse = await pesapalHelper.submitOrder(request, req.accessToken);
        res.json(orderResponse);
    } catch (error) {
        console.error('Error submitting order:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route for registering IPN
app.post('/api/register-ipn', async (req, res) => {
  const { ipn_notification_type, url } = req.body;

  if (!ipn_notification_type || !url) {
    return res.status(400).json({ error: 'ipn_notification_type and callbackUrl are required' });
  }

  try {
    const ipnResponse = await pesapalHelper.registerIPN(req.accessToken, {
      ipn_notification_type,
      url,
    });
    res.json(ipnResponse);
  } catch (error) {
    // console.error('Error registering IPN:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route for getting transaction status
app.get('/api/transaction-status', async (req, res) => {
  const { orderTrackingId } = req.query;

  try {
    const statusResponse = await pesapalHelper.getTransactionStatus(orderTrackingId, req.accessToken);
    res.json(statusResponse);
  } catch (error) {
    console.error('Error fetching transaction status:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
