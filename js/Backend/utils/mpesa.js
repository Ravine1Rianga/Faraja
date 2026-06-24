// M-PESA Daraja API helper (Safaricom sandbox / production)
// Docs: https://developer.safaricom.co.ke/Documentation

const axios = require('axios');

const DARAJA_BASE = 'https://sandbox.safaricom.co.ke'; // change to live when ready

// Get OAuth token
async function getToken() {
  const key    = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const creds  = Buffer.from(`${key}:${secret}`).toString('base64');

  const res = await axios.get(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` },
  });
  return res.data.access_token;
}

// STK Push (Lipa Na M-PESA Online)
async function stkPush({ phone, amount, funeralId, callbackUrl }) {
  const token     = await getToken();
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey   = process.env.MPESA_PASSKEY;
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const password  = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

  // Normalise phone: 0712345678 → 254712345678
  const normalised = phone.replace(/^0/, '254').replace(/^\+/, '');

  const payload = {
    BusinessShortCode: shortcode,
    Password:          password,
    Timestamp:         timestamp,
    TransactionType:   'CustomerPayBillOnline',
    Amount:            Math.ceil(amount),
    PartyA:            normalised,
    PartyB:            shortcode,
    PhoneNumber:       normalised,
    CallBackURL:       callbackUrl || process.env.MPESA_CALLBACK_URL,
    AccountReference:  `FARAJA-${funeralId}`,
    TransactionDesc:   'Faraja Harambee Contribution',
  };

  const res = await axios.post(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });

  return res.data; // { MerchantRequestID, CheckoutRequestID, ResponseCode, CustomerMessage, ... }
}

module.exports = { stkPush };
