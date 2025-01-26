# Event Horizon Live

A modern entertainment platform providing live streaming and news for sports, movies, and music.

## Features

- Live streaming for sports events, movies, and music concerts
- Latest news and updates from the entertainment world
- Premium subscription model
- Modern, responsive UI
- Real-time data from multiple APIs

## Tech Stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- APIs:
  - SportRadar API for sports data
  - TMDB API for movie information
  - Eventbrite API for music events

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Kalki2898AD/Event-Horizon-Live.git
cd Event-Horizon-Live
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory and add your API keys:
```env
SPORTRADAR_API_KEY=your_key
TMDB_API_KEY=your_key
EVENTBRITE_TOKEN=your_token
```

4. Start the server:
```bash
npm start
```

5. Open `index.html` in your browser or deploy to your web hosting service.

## API Endpoints

- `/api/news/sports` - Get latest sports news
- `/api/news/movies` - Get movie updates
- `/api/news/music` - Get music events
- `/api/streams` - Get available live streams

## Contributing

Feel free to submit issues and enhancement requests!
