// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://event-horizon-live.onrender.com/api';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1jXh_46i9cMhrYE2gTeC_2ixmZd-laCc",
  authDomain: "event-horizon-live.firebaseapp.com",
  projectId: "event-horizon-live",
  storageBucket: "event-horizon-live.firebasestorage.app",
  messagingSenderId: "879020003861",
  appId: "1:879020003861:web:f0de1898789e9a37f5341c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Show login modal
function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Update UI based on auth state
function updateUIForAuth(user) {
  const profileContainer = document.querySelector('.profile-container');
  const loginButton = document.getElementById('loginButton');
  const profileImg = document.querySelector('.profile-img');

  if (user) {
    profileContainer.style.display = 'block';
    loginButton.style.display = 'none';
    profileImg.src = user.photoURL || 'default-avatar.png';
    updateSubscriptionDetails(user.uid);
  } else {
    profileContainer.style.display = 'none';
    loginButton.style.display = 'block';
  }
}

// Update subscription details
async function updateSubscriptionDetails(userId) {
  try {
    const userDoc = await firebase.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    
    document.getElementById('planType').textContent = userData.planType || 'Free';
    document.getElementById('subscriptionStatus').textContent = 
      userData.subscriptionStatus === 'active' ? 'Active' : 'Inactive';
    document.getElementById('subscriptionExpiry').textContent = 
      userData.subscriptionEndDate ? new Date(userData.subscriptionEndDate.toDate()).toLocaleDateString() : 'N/A';
  } catch (error) {
    console.error('Error updating subscription details:', error);
  }
}

// Toggle dropdown
function toggleDropdown(event) {
  const dropdown = document.querySelector('.profile-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Toggle subscription details
function toggleSubscriptionDetails(event) {
  event.stopPropagation(); // Prevent dropdown from closing
  const details = event.currentTarget.querySelector('.subscription-details');
  if (details) {
    const isVisible = details.style.display === 'block';
    details.style.display = isVisible ? 'none' : 'block';
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.matches('.profile-img') && !event.target.closest('.subscription-details')) {
    const dropdowns = document.getElementsByClassName('profile-dropdown');
    for (let dropdown of dropdowns) {
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      }
    }
  }
});

// Sign out
async function signOut() {
  try {
    await firebase.auth().signOut();
    showToast('Successfully logged out');
  } catch (error) {
    console.error('Error signing out:', error);
    showToast('Error signing out');
  }
}

// Auth state change listener
firebase.auth().onAuthStateChanged((user) => {
  updateUIForAuth(user);
});

// Show news details
function showNewsDetails(category, title) {
  const newsData = mockData[category].news.find(item => item.title === title);
  if (!newsData) return;

  // Create news page if it doesn't exist
  let newsPage = document.getElementById('news-page');
  if (!newsPage) {
    newsPage = document.createElement('div');
    newsPage.id = 'news-page';
    document.body.appendChild(newsPage);
  }

  // Hide main container
  document.querySelector('.container').style.display = 'none';

  newsPage.innerHTML = `
    <div class="news-page-container">
      <div class="news-header">
        <button onclick="goBack()" class="back-button">
          <i class="bi bi-arrow-left"></i> Back
        </button>
        <h1>${newsData.title}</h1>
        <div class="news-meta">
          <span class="date">${newsData.date || new Date().toLocaleDateString()}</span>
          <span class="category">${category}</span>
        </div>
      </div>
      <div class="news-content">
        <div class="news-image">
          <img src="${newsData.image || '/placeholder.jpg'}" 
               alt="${newsData.title}"
               onerror="this.onerror=null; this.src='/placeholder.jpg';">
        </div>
        <div class="news-text">
          ${newsData.content || newsData.description}
        </div>
      </div>
    </div>
  `;

  newsPage.style.display = 'block';
  window.scrollTo(0, 0);
}

// Go back from news details
function goBack() {
  const newsPage = document.getElementById('news-page');
  if (newsPage) {
    newsPage.style.display = 'none';
    document.querySelector('.container').style.display = 'block';
    window.scrollTo(0, 0);
  }
}

// Play stream in modal
function playStream(streamId, title) {
  const modalHTML = `
    <div id="videoModal" class="modal">
      <div class="video-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${title}</h2>
            <button onclick="closeVideoModal()" class="close-modal-btn">&times;</button>
          </div>
          <div class="video-container">
            <video id="videoPlayer" controls>
              <source src="/api/streams/${streamId}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('videoModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add new modal
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Show modal
  const videoModal = document.getElementById('videoModal');
  videoModal.style.display = 'flex';
}

// Close video modal
function closeVideoModal() {
  const videoModal = document.getElementById('videoModal');
  if (videoModal) {
    const video = videoModal.querySelector('video');
    if (video) {
      video.pause();
      video.src = '';
      video.load();
    }
    videoModal.remove();
  }
}

// Sign in with Google
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    
    // Create/update user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      premium: false
    }, { merge: true });
    
    closeModal('loginModal');
  } catch (error) {
    console.error('Google sign in error:', error);
    alert('Failed to sign in with Google. Please try again.');
  }
}

// Handle subscription button click
async function handleSubscribe(plan) {
  const user = firebase.auth().currentUser;
  if (!user) {
    openModal('loginModal');
    return;
  }

  try {
    const options = {
      key: 'rzp_test_nunwa0lp8sXOvm',
      amount: plan === 'yearly' ? 299900 : 29900,
      currency: 'INR',
      name: 'Event Horizon Live',
      description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
      prefill: {
        name: user.displayName || '',
        email: user.email || '',
        contact: user.phoneNumber || ''
      },
      theme: {
        color: '#ff3e3e'
      },
      handler: function(response) {
        // Update subscription status
        const db = firebase.firestore();
        const userRef = db.collection('users').doc(user.uid);
        
        userRef.get().then((doc) => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + (plan === 'yearly' ? 365 : 30));
          
          const updateData = {
            subscriptionStatus: 'active',
            planType: plan,
            subscriptionEndDate: firebase.firestore.Timestamp.fromDate(endDate),
            paymentId: response.razorpay_payment_id,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
          };

          userRef.set(updateData, { merge: true })
            .then(() => {
              showToast('Subscription successful!');
              closeModal('subscriptionModal');
              
              // Update UI to reflect changes
              const profileSection = document.querySelector('.profile-section');
              if (profileSection) {
                const planText = profileSection.querySelector('#planType');
                const statusText = profileSection.querySelector('#subscriptionStatus');
                if (planText) planText.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
                if (statusText) statusText.textContent = 'Active';
              }
            })
            .catch((error) => {
              console.error('Error updating subscription:', error);
              showToast('Error updating subscription status');
            });
        });
      }
    };

    const razorpay = new Razorpay(options);
    razorpay.on('payment.failed', function(response) {
      showToast('Payment failed: ' + response.error.description);
    });
    razorpay.open();
  } catch (error) {
    console.error('Subscription error:', error);
    showToast('Error processing subscription');
  }
}

// Update subscription details in UI
function updateSubscriptionDetails() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const userRef = firebase.firestore().collection('users').doc(user.uid);
  userRef.get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      const planType = document.getElementById('planType');
      const status = document.getElementById('subscriptionStatus');
      const expiry = document.getElementById('subscriptionExpiry');

      if (planType) planType.textContent = data.planType ? data.planType.charAt(0).toUpperCase() + data.planType.slice(1) : 'Free';
      if (status) status.textContent = data.subscriptionStatus || 'Inactive';
      if (expiry && data.subscriptionEndDate) {
        const date = data.subscriptionEndDate.toDate();
        expiry.textContent = date.toLocaleDateString();
      }
    }
  }).catch((error) => {
    console.error('Error fetching subscription details:', error);
  });
}

// Show subscription status
async function showSubscriptionStatus() {
  const user = firebase.auth().currentUser;
  if (!user) {
    showToast('Please log in to view subscription status');
    return;
  }

  try {
    const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const isSubscribed = userData && userData.subscriptionStatus === 'active';
    const planType = userData?.planType || 'Free';
    const expiryDate = userData?.subscriptionEndDate ? new Date(userData.subscriptionEndDate.toDate()).toLocaleDateString() : 'N/A';

    // Create or update subscription modal
    if (!document.getElementById('subscriptionStatusModal')) {
      const modalHTML = `
        <div id="subscriptionStatusModal" class="modal">
          <div class="modal-content subscription-status-modal">
            <button onclick="closeModal('subscriptionStatusModal')" class="close-modal-btn">&times;</button>
            <h2>Your Subscription</h2>
            <div class="subscription-details">
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value ${isSubscribed ? 'active' : 'inactive'}">${isSubscribed ? 'Active' : 'Inactive'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Plan:</span>
                <span class="value">${planType}</span>
              </div>
              <div class="detail-row">
                <span class="label">Expires:</span>
                <span class="value">${expiryDate}</span>
              </div>
            </div>
            ${!isSubscribed ? `
              <button onclick="openModal('subscriptionModal')" class="upgrade-btn">
                <i class="bi bi-star-fill"></i>
                Upgrade to Premium
              </button>
            ` : ''}
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    openModal('subscriptionStatusModal');
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    showToast('Error fetching subscription status');
  }
}

// Initialize carousel
function initializeCarousel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const content = container.querySelector('.carousel-content');
  const prevBtn = container.querySelector('.carousel-button.prev');
  const nextBtn = container.querySelector('.carousel-button.next');
  
  if (!content || !prevBtn || !nextBtn) return;
  
  // Show/hide buttons based on scroll position and content width
  function updateButtons() {
    const hasOverflow = content.scrollWidth > content.clientWidth;
    const scrollLeft = content.scrollLeft;
    const maxScroll = content.scrollWidth - content.clientWidth;
    
    // Only show buttons if there's overflow
    prevBtn.style.display = hasOverflow && scrollLeft > 0 ? 'flex' : 'none';
    nextBtn.style.display = hasOverflow && scrollLeft < maxScroll - 5 ? 'flex' : 'none';
  }
  
  // Initial button state
  updateButtons();
  
  // Update buttons on scroll
  content.addEventListener('scroll', updateButtons);
  
  // Update buttons on window resize
  window.addEventListener('resize', updateButtons);
  
  // Update buttons when images load
  const images = content.querySelectorAll('img');
  images.forEach(img => {
    if (img.complete) {
      updateButtons();
    } else {
      img.addEventListener('load', updateButtons);
    }
    img.addEventListener('error', updateButtons);
  });
}

// Move carousel
function moveCarousel(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const content = container.querySelector('.carousel-content');
  if (!content) return;
  
  const card = content.querySelector('.stream-card, .news-card');
  if (!card) return;
  
  const cardWidth = card.offsetWidth + parseInt(getComputedStyle(card).marginRight);
  const visibleWidth = content.clientWidth;
  const scrollAmount = direction === 'next' ? visibleWidth : -visibleWidth;
  
  content.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
}

// Initialize images
function initializeImages() {
  const images = document.querySelectorAll('.image-container img');
  images.forEach(img => {
    const container = img.closest('.image-container');
    if (container && !container.querySelector('.loading-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'loading-placeholder';
      container.insertBefore(placeholder, img);
    }
    handleImageLoad(img);
  });
}

// Handle image loading
function handleImageLoad(img) {
  if (!img) return;
  
  const container = img.closest('.image-container');
  if (!container) return;
  
  const placeholder = container.querySelector('.loading-placeholder');
  
  function showImage() {
    img.style.opacity = '0';
    requestAnimationFrame(() => {
      img.classList.add('loaded');
      img.style.opacity = '1';
      if (placeholder) {
        placeholder.style.opacity = '0';
        setTimeout(() => placeholder.remove(), 300);
      }
    });
  }
  
  if (img.complete) {
    showImage();
  } else {
    img.onload = showImage;
    img.onerror = () => {
      img.src = '/images/placeholder.jpg';
      showImage();
    };
  }
}

// Load mock data
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
      }
    ],
    news: [
      {
        title: 'New Batman Movie Announced',
        summary: 'Warner Bros reveals plans for next Batman film',
        content: 'The studio has announced an exciting new direction...',
        image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
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
      }
    ],
    news: [
      {
        title: 'Taylor Swift Announces New Tour Dates',
        summary: 'Global phenomenon adds more cities to record-breaking tour',
        content: 'Due to unprecedented demand...',
        image: 'https://i.scdn.co/image/ab6761610000e5eb6a224073987b930f99adc706'
      }
    ]
  }
};

// Initialize tabs
document.addEventListener('DOMContentLoaded', function() {
  // Add click handlers to tab buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    const category = button.getAttribute('data-tab');
    button.addEventListener('click', () => switchTab(category));
  });
  
  // Load initial content
  const activeTab = document.querySelector('.tab-button.active');
  if (activeTab) {
    const category = activeTab.getAttribute('data-tab');
    loadContent(category);
  }
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add click handlers to tab buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    const category = button.getAttribute('data-tab');
    button.addEventListener('click', () => switchTab(category));
  });
  
  // Switch to the active tab (persisted or default)
  switchTab(activeTab);
});

// Mock API response for testing
async function mockApiResponse(category) {
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
        }
      ],
      news: [
        {
          title: 'New Batman Movie Announced',
          summary: 'Warner Bros reveals plans for next Batman film',
          content: 'The studio has announced an exciting new direction...',
          image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
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
        }
      ],
      news: [
        {
          title: 'Taylor Swift Announces New Tour Dates',
          summary: 'Global phenomenon adds more cities to record-breaking tour',
          content: 'Due to unprecedented demand...',
          image: 'https://i.scdn.co/image/ab6761610000e5eb6a224073987b930f99adc706'
        }
      ]
    }
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockData[category] || { streams: [], news: [] };
}

// Show subscription modal
function showSubscriptionModal() {
  const modal = document.getElementById('subscriptionModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Show loading state
function showLoadingState(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div class="loading">Loading...</div>';
  }
}

// Hide loading state
function hideLoadingState(containerId) {
  const loadingElement = document.querySelector(`#${containerId} .loading`);
  if (loadingElement) {
    loadingElement.remove();
  }
}

// Show error state
function showErrorState(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <p>Failed to load content. Please try again later.</p>
        <button onclick="loadContent('${containerId.split('-')[0]}')">Retry</button>
      </div>
    `;
  }
}

// Handle tab switching
function switchTab(category) {
  // Remove active class from all tabs and panes
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  
  // Add active class to selected tab and pane
  const selectedTab = document.querySelector(`[data-tab="${category}"]`);
  const selectedPane = document.getElementById(category);
  
  if (selectedTab && selectedPane) {
    selectedTab.classList.add('active');
    selectedPane.classList.add('active');
    loadContent(category);
  }
}

// Store active tab to persist across refreshes
let activeTab = localStorage.getItem('activeTab') || 'sports';

// Load all content at once
function loadAllContent() {
  const categories = ['sports', 'movies', 'music'];
  categories.forEach(category => loadContent(category));
}

// Load content for a category
async function loadContent(category) {
  const data = mockData[category];
  if (!data) return;

  // Load streams
  const streamsContainer = document.getElementById(`${category}-streams`);
  if (streamsContainer) {
    streamsContainer.innerHTML = data.streams.map(stream => createStreamCard(stream)).join('');
  }

  // Load news
  const newsContainer = document.getElementById(`${category}-news`);
  if (newsContainer) {
    newsContainer.innerHTML = data.news.map(news => createNewsCard(news, category)).join('');
  }
}

// Create stream card
function createStreamCard(stream) {
  return `
    <div class="card">
      <div class="card-image">
        <img src="${stream.thumbnail || '/placeholder.jpg'}" alt="${stream.title}" 
          onerror="this.onerror=null; this.src='/placeholder.jpg';">
        ${stream.isPremium ? '<span class="premium-badge">Premium</span>' : ''}
      </div>
      <div class="card-content">
        <h3 class="card-title">${stream.title}</h3>
        <p class="card-description">${stream.description || 'No description available'}</p>
        <button onclick="handleStreamClick('${stream.id}', ${stream.isPremium}, '${stream.title}')" 
          class="watch-now-btn">
          <i class="bi bi-play-circle-fill"></i>
          Watch Now
        </button>
      </div>
    </div>
  `;
}

// Create news card
function createNewsCard(news, category) {
  return `
    <div class="card" onclick="showNewsDetails('${category}', '${news.title}')">
      <div class="card-image">
        <img src="${news.image || '/placeholder.jpg'}" alt="${news.title}" 
          onerror="this.onerror=null; this.src='/placeholder.jpg';">
      </div>
      <div class="card-content">
        <h3 class="card-title">${news.title}</h3>
        <p class="card-description">${news.description || 'No description available'}</p>
        <button class="read-more-btn">
          <i class="bi bi-book"></i>
          Read More
        </button>
      </div>
    </div>
  `;
}

// Handle stream click
async function handleStreamClick(streamId, isPremium, title) {
  if (isPremium) {
    const user = firebase.auth().currentUser;
    if (!user) {
      openModal('loginModal');
      return;
    }
    
    try {
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      const isSubscribed = userData && userData.subscriptionStatus === 'active';
      
      if (!isSubscribed) {
        openModal('subscriptionModal');
        return;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      showToast('Error checking subscription status');
      return;
    }
  }
  
  playStream(streamId, title);
}

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Show toast message
function showToast(message) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Add show class for animation
  setTimeout(() => toast.classList.add('show'), 100);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Email click handler
function openGmailCompose() {
  const email = 'budgetbuddy567@gmail.com';
  const subject = 'Support Request';
  window.open(`https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}`, '_blank');
}