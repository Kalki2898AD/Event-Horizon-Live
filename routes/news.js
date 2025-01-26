const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Get sports news using SportRadar API
router.get('/sports', async (req, res) => {
  try {
    const response = await fetch(`http://api.sportradar.us/nba/trial/v8/en/games/2024/schedule.json?api_key=${process.env.SPORTRADAR_API_KEY}`);
    const data = await response.json();
    
    // Transform the data into a consistent format
    const formattedData = data.games.map(game => ({
      title: `${game.home.name} vs ${game.away.name}`,
      description: `${game.status}: ${game.home.alias} ${game.home_points} - ${game.away_points} ${game.away.alias}`,
      date: game.scheduled,
      type: 'sports',
      category: 'NBA'
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Sports API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get movies news using TMDB API
router.get('/movies', async (req, res) => {
  try {
    const response = await fetch('https://api.themoviedb.org/3/movie/upcoming', {
      headers: {
        'Authorization': `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    
    // Transform the data into a consistent format
    const formattedData = data.results.map(movie => ({
      title: movie.title,
      description: movie.overview,
      date: movie.release_date,
      poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      type: 'movie',
      rating: movie.vote_average
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('TMDB API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get music events using Eventbrite API
router.get('/music', async (req, res) => {
  try {
    const response = await fetch('https://www.eventbriteapi.com/v3/events/search/?categories=103&sort_by=date', {
      headers: {
        'Authorization': `Bearer ${process.env.EVENTBRITE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    
    // Transform the data into a consistent format
    const formattedData = data.events.map(event => ({
      title: event.name.text,
      description: event.description.text,
      date: event.start.utc,
      venue: event.venue,
      type: 'music',
      ticketUrl: event.url
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Eventbrite API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
