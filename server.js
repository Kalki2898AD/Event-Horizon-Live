const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');

// Load environment variables
const result = dotenv.config();
if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Log environment variables (remove in production)
console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);

// Initialize Firebase Admin with service account
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

// Initialize Razorpay with keys from .env
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Razorpay credentials are missing in .env file');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'https://eventhorizonlive.space'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(__dirname));

// Mock data
const mockData = {
  sports: {
    streams: [
      {
        id: 'nba1',
        title: 'NBA: Lakers vs Warriors',
        thumbnail: 'https://www.nba.com/assets/logos/teams/primary/web/LAL.svg',
        isPremium: true
      },
      {
        id: 'soccer1',
        title: 'Premier League: Manchester United vs Liverpool',
        thumbnail: 'https://resources.premierleague.com/premierleague/badges/t1.svg',
        isPremium: true
      },
      {
        id: 'cricket1',
        title: 'IPL: CSK vs MI',
        thumbnail: 'https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/CSK/logos/Roundbig/CSKroundbig.png',
        isPremium: false
      }
    ],
    news: [
      {
        title: 'Lakers Dominate Warriors in Overtime Thriller',
        summary: 'LeBron James leads Lakers to victory with triple-double',
        content: 'In an exciting game that went down to the wire...',
        image: 'https://www.nba.com/assets/logos/teams/primary/web/LAL.svg'
      },
      {
        title: 'Premier League Title Race Heats Up',
        summary: 'Top teams battle for supremacy in final stretch',
        content: 'With just a few games remaining in the season...',
        image: 'https://resources.premierleague.com/premierleague/badges/t1.svg'
      }
    ]
  },
  movies: {
    streams: [
      {
        id: 'movie1',
        title: 'The Dark Knight',
        thumbnail: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        isPremium: true
      },
      {
        id: 'movie2',
        title: 'Inception',
        thumbnail: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        isPremium: false
      },
      {
        id: 'movie3',
        title: 'The Matrix',
        thumbnail: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        isPremium: true
      }
    ],
    news: [
      {
        title: 'New Batman Movie Announced',
        summary: 'Warner Bros reveals plans for next Batman film',
        content: 'The studio has announced an exciting new direction...',
        image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
      },
      {
        title: 'Christopher Nolan\'s Next Project',
        summary: 'Director begins work on new sci-fi epic',
        content: 'The acclaimed director has started production...',
        image: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
      }
    ]
  },
  music: {
    streams: [
      {
        id: 'concert1',
        title: 'Taylor Swift - Eras Tour',
        thumbnail: 'https://i.scdn.co/image/ab6761610000e5eb6a224073987b930f99adc706',
        isPremium: true
      },
      {
        id: 'concert2',
        title: 'Ed Sheeran World Tour',
        thumbnail: 'https://i.scdn.co/image/ab6761610000e5eb12a2ef08d00dd7451a6dbed6',
        isPremium: false
      },
      {
        id: 'concert3',
        title: 'Coldplay Concert',
        thumbnail: 'https://i.scdn.co/image/ab6761610000e5eb989ed05e1f0570cc4726c2d3',
        isPremium: true
      }
    ],
    news: [
      {
        title: 'Taylor Swift Breaks Records',
        summary: 'Eras Tour becomes highest-grossing tour ever',
        content: 'The global phenomenon continues as Taylor Swift...',
        image: 'https://i.scdn.co/image/ab6761610000e5eb6a224073987b930f99adc706'
      },
      {
        title: 'Ed Sheeran Announces New Album',
        summary: 'Singer reveals details of upcoming release',
        content: 'The chart-topping artist has announced...',
        image: 'https://i.scdn.co/image/ab6761610000e5eb12a2ef08d00dd7451a6dbed6'
      }
    ]
  }
};

// API endpoints
app.get('/api/:category/streams', (req, res) => {
  const { category } = req.params;
  const data = mockData[category]?.streams || [];
  res.json({ streams: data });
});

app.get('/api/:category/news', (req, res) => {
  const { category } = req.params;
  const data = mockData[category]?.news || [];
  res.json({ news: data });
});

// Stream playback endpoint
app.get('/api/streams/:streamId/play', (req, res) => {
  const { streamId } = req.params;
  // Mock stream URL
  res.json({
    url: `https://mockstream.com/${streamId}/index.m3u8`,
    title: 'Live Stream'
  });
});

// Payment Routes
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { plan, userId } = req.body;
    
    // Verify user exists in Firebase
    const user = await admin.auth().getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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

app.post('/api/verify-payment', async (req, res) => {
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
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Calculate subscription end date
      const now = new Date();
      const subscriptionEnd = new Date(now);
      if (plan === 'monthly') {
        subscriptionEnd.setMonth(now.getMonth() + 1);
      } else {
        subscriptionEnd.setFullYear(now.getFullYear() + 1);
      }

      // Update user's subscription in Firestore
      await admin.firestore().collection('users').doc(userId).update({
        premium: true,
        subscriptionPlan: plan,
        subscriptionEndDate: admin.firestore.Timestamp.fromDate(subscriptionEnd),
        lastPaymentId: razorpay_payment_id
      });

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

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ message: 'Event Horizon Live API is running!' });
});

// Catch all other routes and serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`
========================================
🚀 Event Horizon Live Server is running!
📡 Port: ${PORT}
🌐 API Endpoints:
   - GET /api
   - GET /api/news/sports
   - GET /api/news/movies
   - GET /api/news/music
   - GET /api/streams
========================================
`);
});
