const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://eventhorizonlive.space'],
  credentials: true
}));
app.use(express.json());

// Routes
// Sports News
app.get('/api/news/sports', async (req, res) => {
  try {
    const response = await fetch(
      `http://api.sportradar.us/nba/trial/v8/en/games/2024/schedule.json?api_key=${process.env.SPORTRADAR_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Sports API Error:', error);
    res.status(500).json({ error: 'Failed to fetch sports news' });
  }
});

// Movies News
app.get('/api/news/movies', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.TMDB_API_KEY}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Movies API Error:', error);
    res.status(500).json({ error: 'Failed to fetch movie news' });
  }
});

// Music News
app.get('/api/news/music', async (req, res) => {
  try {
    const response = await fetch(
      `https://www.eventbriteapi.com/v3/categories/103/events/?token=${process.env.EVENTBRITE_TOKEN}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Music API Error:', error);
    res.status(500).json({ error: 'Failed to fetch music news' });
  }
});

// Streams - Temporary mock data
app.get('/api/streams', async (req, res) => {
  const mockStreams = [
    {
      id: '1',
      title: 'NBA Live: Lakers vs Warriors',
      description: 'Watch the exciting match between Lakers and Warriors',
      category: 'sports',
      thumbnail: 'https://example.com/nba.jpg',
      isPremium: true
    },
    {
      id: '2',
      title: 'New Movie Premiere',
      description: 'Watch the latest blockbuster movie',
      category: 'movies',
      thumbnail: 'https://example.com/movie.jpg',
      isPremium: true
    },
    {
      id: '3',
      title: 'Live Concert',
      description: 'Popular artist live in concert',
      category: 'music',
      thumbnail: 'https://example.com/concert.jpg',
      isPremium: false
    }
  ];

  const category = req.query.category;
  const filteredStreams = category 
    ? mockStreams.filter(stream => stream.category === category)
    : mockStreams;
    
  res.json(filteredStreams);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
