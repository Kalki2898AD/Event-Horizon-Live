// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://event-horizon-live.onrender.com/api'; // Replace with your Render URL

// Set document title
document.title = 'Event Horizon Live - Sports, Movies & Music';

// Fetch content for each category
async function fetchContent() {
  showLoadingState();
  try {
    await Promise.all([
      fetchCategoryData('sports'),
      fetchCategoryData('movies'),
      fetchCategoryData('music')
    ]);
    hideLoadingState();
  } catch (error) {
    console.error('Error fetching content:', error);
    showErrorState();
  }
}

// Show loading state
function showLoadingState() {
  const containers = ['sports-streams', 'movies-streams', 'music-streams', 
                     'sports-news', 'movies-news', 'music-news'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '<div class="loading">Loading...</div>';
    }
  });
}

// Hide loading state
function hideLoadingState() {
  const loadingElements = document.querySelectorAll('.loading');
  loadingElements.forEach(el => el.remove());
}

// Show error state
function showErrorState() {
  const containers = ['sports-streams', 'movies-streams', 'music-streams', 
                     'sports-news', 'movies-news', 'music-news'];
  containers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = '<div class="error">Failed to load content. Please try again later.</div>';
    }
  });
}

// Fetch category data
async function fetchCategoryData(category) {
  try {
    console.log(`Fetching ${category} data...`);
    const response = await fetch(`${API_BASE_URL}/news/${category}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(`${category} data:`, data);
    displayNews(category, data);
    
    // Fetch available streams
    const streamsResponse = await fetch(`${API_BASE_URL}/streams?category=${category}`);
    if (!streamsResponse.ok) {
      throw new Error(`HTTP error! status: ${streamsResponse.status}`);
    }
    const streams = await streamsResponse.json();
    console.log(`${category} streams:`, streams);
    displayStreams(category, streams);
  } catch (error) {
    console.error(`Error fetching ${category} data:`, error);
    showCategoryError(category);
  }
}

// Show category error
function showCategoryError(category) {
  const newsContainer = document.getElementById(`${category}-news`);
  const streamsContainer = document.getElementById(`${category}-streams`);
  
  const errorMessage = '<div class="error-message">Failed to load content. Please try again later.</div>';
  
  if (newsContainer) newsContainer.innerHTML = errorMessage;
  if (streamsContainer) streamsContainer.innerHTML = errorMessage;
}

// Display news articles
function displayNews(category, articles) {
  const newsContainer = document.getElementById(`${category}-news`);
  if (!newsContainer) return;
  
  newsContainer.innerHTML = '';
  
  if (!articles.length) {
    newsContainer.innerHTML = '<div class="no-content">No news available at the moment.</div>';
    return;
  }
  
  articles.forEach(article => {
    const articleElement = document.createElement('div');
    articleElement.classList.add('article');
    articleElement.innerHTML = `
      <h3>${article.title}</h3>
      <p>${article.description}</p>
      ${article.poster ? `<img src="${article.poster}" alt="${article.title}">` : ''}
      <div class="article-footer">
        <span class="date">${new Date(article.date).toLocaleDateString()}</span>
        ${article.url ? `<a href="${article.url}" target="_blank" class="read-more">Read More</a>` : ''}
      </div>
    `;
    newsContainer.appendChild(articleElement);
  });
}

// Display streams
function displayStreams(category, streams) {
  const streamContainer = document.getElementById(`${category}-streams`);
  if (!streamContainer) return;
  
  streamContainer.innerHTML = '';
  
  if (!streams.length) {
    streamContainer.innerHTML = '<div class="no-content">No live streams available at the moment.</div>';
    return;
  }
  
  streams.forEach(stream => {
    const streamElement = document.createElement('div');
    streamElement.classList.add('stream');
    streamElement.innerHTML = `
      <h3>${stream.title}</h3>
      <p>${stream.description}</p>
      ${stream.thumbnail ? `<img src="${stream.thumbnail}" alt="${stream.title}">` : ''}
      <button onclick="watchStream('${stream.id}')" class="stream-button">
        Watch Stream
      </button>
    `;
    streamContainer.appendChild(streamElement);
  });
}

// Watch stream
function watchStream(streamId) {
  alert('Stream functionality coming soon!');
}

// Tab functionality
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Start with loading state
  showLoadingState();
  // Fetch content
  fetchContent();
});