const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.user.uid);
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    
    res.json({
      profile: userRecord,
      subscription: userDoc.data()?.subscription || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user subscription
router.post('/subscription', verifyToken, async (req, res) => {
  try {
    await admin.firestore().collection('users').doc(req.user.uid).set({
      subscription: req.body.subscription
    }, { merge: true });
    
    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
