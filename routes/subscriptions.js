const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plansSnapshot = await admin.firestore().collection('subscription_plans').get();
    const plans = [];
    
    plansSnapshot.forEach(doc => {
      plans.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
router.post('/', async (req, res) => {
  try {
    const { planId, paymentMethod } = req.body;
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    
    // Create subscription in Firestore
    await admin.firestore().collection('users').doc(req.user.uid).set({
      subscription: {
        planId,
        status: 'active',
        startDate: admin.firestore.FieldValue.serverTimestamp(),
        endDate: admin.firestore.FieldValue.serverTimestamp() + (30 * 24 * 60 * 60 * 1000) // 30 days
      }
    }, { merge: true });
    
    res.json({ message: 'Subscription created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.delete('/', async (req, res) => {
  try {
    await admin.firestore().collection('users').doc(req.user.uid).update({
      'subscription.status': 'cancelled',
      'subscription.cancelDate': admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
