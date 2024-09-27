const axios = require('axios');

class PesapalV30Helper {
  constructor(api) {
    this.url = api === 'demo' ? 'https://cybqa.pesapal.com/pesapalv3' : 'https://pay.pesapal.com/v3';
  }

  // Get Access Token
  async getAccessToken(consumer_key, consumer_secret) {
    try {
      const response = await axios.post(`${this.url}/api/Auth/RequestToken`, {
        consumer_key,
        consumer_secret,
      }, {
        headers: {
          Accept: 'text/plain',
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching access token: ${this.extractErrorMessage(error)}`);
    }
  }

  // Register IPN
  async registerIPN(accessToken, { ipn_notification_type = 'GET', callbackUrl }) {
    try {
      const response = await axios.post(`${this.url}/api/URLSetup/RegisterIPN`, {
        ipn_notification_type,
        callbackUrl,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'text/plain',
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error registering IPN: ${this.extractErrorMessage(error)}`);
    }
  }

  async registerIPN(accessToken, { ipn_notification_type = 'GET', url }) {
    try {
        const response = await axios.post(`${this.url}/api/URLSetup/RegisterIPN`, {
            ipn_notification_type,
            url,
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'text/plain',
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        // Log the full error response for debugging
        console.error('Pesapal IPN Registration Error:', error.response?.data || error.message);
        throw new Error(`Error registering IPN: ${this.extractErrorMessage(error)}`);
    }
}

  // Submit Order
  async submitOrder(request, accessToken) {
    try {
        console.log('Submitting order with payload:', request);  // Log the request payload

        const response = await axios.post(`${this.url}/api/Transactions/SubmitOrderRequest`, request, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'text/plain',
                'Content-Type': 'application/json',
            },
        });

        // console.log('Order submitted successfully:', response.data);  // Log the successful response
        return response.data;
    } catch (error) {
        // Log the full error response for debugging
        console.error('Pesapal Order Submission Error:', error.response?.data || error.message);
        throw new Error(`Error submitting order: ${this.extractErrorMessage(error)}`);
    }
}


  // Get Transaction Status
  async getTransactionStatus(orderTrackingId, accessToken) {
    try {
      const response = await axios.get(`${this.url}/api/Transactions/GetTransactionStatus`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'text/plain',
          'Content-Type': 'application/json',
        },
        params: { orderTrackingId },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching transaction status: ${this.extractErrorMessage(error)}`);
    }
  }

  // Helper function to extract error message from Axios error
  extractErrorMessage(error) {
    return error.response?.data?.message || error.message || 'Unknown error';
  }
}

module.exports = PesapalV30Helper;
