const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Provide PayPal client ID to frontend
router.get('/paypal-client-id', (req, res) => {
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

router.post('/create-stripe-payment-intent', async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects paise
            currency: 'inr',
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;