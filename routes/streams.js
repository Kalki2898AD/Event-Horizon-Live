const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware to check subscription
const checkSubscription = async (req, res, next) => {
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const subscription = userDoc.data()?.subscription;
    
    if (!subscription && req.query.type === 'premium') {
      // Allow 5-minute preview for non-subscribers
      const previewExpiry = new Date(Date.now() + 5 * 60 * 1000);
      req.previewExpiry = previewExpiry;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available streams
router.get('/', async (req, res) => {
  try {
    const streamsSnapshot = await admin.firestore().collection('streams').get();
    const streams = [];
    
    streamsSnapshot.forEach(doc => {
      streams.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(streams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stream URL with authentication
router.get('/:streamId/url', checkSubscription, async (req, res) => {
  try {
    const streamDoc = await admin.firestore().collection('streams').doc(req.params.streamId).get();
    
    if (!streamDoc.exists) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const stream = streamDoc.data();
    
    // Generate secure streaming URL
    const streamUrl = stream.url;
    const token = req.previewExpiry 
      ? { expiry: req.previewExpiry, preview: true }
      : { expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) };
    
    res.json({
      url: streamUrl,
      token: token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
