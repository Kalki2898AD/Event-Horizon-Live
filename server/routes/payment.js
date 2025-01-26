const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create subscription order
router.post('/create-subscription', async (req, res) => {
  try {
    const { plan, userId } = req.body;
    
    const plans = {
      monthly: {
        amount: 29900,
        currency: 'INR'
      },
      yearly: {
        amount: 299900,
        currency: 'INR'
      }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const options = {
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      receipt: `receipt_${Date.now()}_${userId}`,
      notes: {
        userId: userId,
        plan: plan
      }
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription order' });
  }
});

// Verify payment
router.post('/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      plan
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is verified
      // Here you would typically:
      // 1. Update the user's subscription in your database
      // 2. Create a record of the payment
      // 3. Send confirmation email
      
      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
