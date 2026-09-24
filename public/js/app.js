document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const feedbackForm = document.getElementById('feedback-form');
  const studentNameInput = document.getElementById('studentName');
  const rollNumberInput = document.getElementById('rollNumber');
  const emailInput = document.getElementById('email');
  const courseSelect = document.getElementById('course');
  const categorySelect = document.getElementById('category');
  const ratingInput = document.getElementById('rating');
  const feedbackInput = document.getElementById('feedback');
  const starPicker = document.getElementById('star-picker');
  const ratingLabel = document.getElementById('rating-label');
  const btnSubmit = document.getElementById('btn-submit');
  const btnText = btnSubmit.querySelector('.btn-text');
  const btnLoader = btnSubmit.querySelector('.btn-loader');

  const formAlertBox = document.getElementById('form-alert-box');
  const alertTitle = document.getElementById('alert-title');
  const alertMessage = document.getElementById('alert-message');
  const alertDismissBtn = document.getElementById('alert-dismiss-btn');

  if (alertDismissBtn) {
    alertDismissBtn.addEventListener('click', () => {
      formAlertBox.classList.add('hidden');
    });
  }

  const feedbackFeed = document.getElementById('feedback-feed');
  const feedCount = document.getElementById('feed-count');
  const searchInput = document.getElementById('search-input');
  const filterCourseSelect = document.getElementById('filter-course');

  const statTotal = document.getElementById('stat-total');
  const statRating = document.getElementById('stat-rating');
  const statCourses = document.getElementById('stat-courses');

  // Rating mapping labels
  const ratingTexts = {
    1: '1.0 - Poor Needs Improvement',
    2: '2.0 - Below Average',
    3: '3.0 - Satisfactory / Average',
    4: '4.0 - Very Good',
    5: '5.0 - Outstanding'
  };

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // State
  let currentRating = 5;

  // Star Rating Interaction
  starPicker.addEventListener('click', (e) => {
    if (e.target.classList.contains('star')) {
      const selectedRating = parseInt(e.target.dataset.rating, 10);
      setRating(selectedRating);
    }
  });

  starPicker.addEventListener('mouseover', (e) => {
    if (e.target.classList.contains('star')) {
      const hoveredRating = parseInt(e.target.dataset.rating, 10);
      updateStarsUI(hoveredRating);
    }
  });

  starPicker.addEventListener('mouseleave', () => {
    updateStarsUI(currentRating);
  });

  function setRating(val) {
    currentRating = val;
    ratingInput.value = val;
    ratingLabel.textContent = ratingTexts[val] || `${val}.0`;
    updateStarsUI(val);
  }

  function updateStarsUI(val) {
    const stars = starPicker.querySelectorAll('.star');
    stars.forEach(s => {
      const r = parseInt(s.dataset.rating, 10);
      if (r <= val) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
  }

  // Fetch Stats
  async function fetchStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        statTotal.textContent = data.data.total;
        statRating.textContent = data.data.avgRating;
        statCourses.textContent = data.data.courseCount;
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  // Fetch Feedbacks
  async function fetchFeedbacks() {
    try {
      const course = filterCourseSelect.value;
      const search = searchInput.value.trim();

      const params = new URLSearchParams();
      if (course) params.append('course', course);
      if (search) params.append('search', search);

      const url = `/api/feedback?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        renderFeedbacks(data.data);
      }
    } catch (err) {
      feedbackFeed.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: #F43F5E;"></i>
          <p style="margin-top: 0.5rem;">Failed to load feedback feed. Is the backend server running?</p>
        </div>
      `;
    }
  }

  // Render Feedback List
  function renderFeedbacks(feedbacks) {
    feedCount.textContent = feedbacks.length;

    if (feedbacks.length === 0) {
      feedbackFeed.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-comment-xmark" style="font-size: 2.5rem; opacity: 0.5;"></i>
          <p style="margin-top: 0.75rem;">No feedback found matching your search criteria.</p>
        </div>
      `;
      return;
    }

    feedbackFeed.innerHTML = feedbacks.map(item => {
      const initials = getInitials(item.studentName);
      const starsHtml = getStarsHtml(item.rating);
      const timeAgo = formatTimeAgo(item.createdAt);

      return `
        <article class="feedback-card">
          <div class="card-top">
            <div class="author-info">
              <div class="avatar">${initials}</div>
              <div>
                <div class="author-name">${escapeHtml(item.studentName)} <span class="category-badge" style="margin-left:6px;"><i class="fa-solid fa-id-badge"></i> ${escapeHtml(item.rollNumber || 'N/A')}</span></div>
                <div class="author-course"><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(item.course)} | <i class="fa-regular fa-envelope"></i> ${escapeHtml(item.email || 'N/A')}</div>
              </div>
            </div>
            <div class="card-stars">
              ${starsHtml}
            </div>
          </div>
          <div class="card-body">
            "${escapeHtml(item.feedback)}"
          </div>
          <div class="card-footer">
            <span class="category-badge"><i class="fa-solid fa-tag"></i> ${escapeHtml(item.category || 'General')}</span>
            <span><i class="fa-regular fa-clock"></i> ${timeAgo}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  // Submit Feedback Handler
  feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset error messages
    document.getElementById('name-error').textContent = '';
    document.getElementById('roll-error').textContent = '';
    document.getElementById('email-error').textContent = '';
    document.getElementById('course-error').textContent = '';
    document.getElementById('feedback-error').textContent = '';
    formAlertBox.classList.add('hidden');

    const studentName = studentNameInput.value.trim();
    const rollNumber = rollNumberInput.value.trim();
    const email = emailInput.value.trim();
    const course = courseSelect.value;
    const category = categorySelect.value;
    const rating = ratingInput.value;
    const feedback = feedbackInput.value.trim();

    // Client-side Validation
    let isValid = true;
    if (studentName.length < 2) {
      document.getElementById('name-error').textContent = 'Please enter at least 2 characters.';
      isValid = false;
    }
    if (rollNumber.length < 3) {
      document.getElementById('roll-error').textContent = 'Please enter a valid official Roll Number.';
      isValid = false;
    }
    if (!email.toLowerCase().endsWith('.niet.co.in') && !email.toLowerCase().endsWith('@niet.co.in')) {
      document.getElementById('email-error').textContent = 'Only official @niet.co.in emails are allowed.';
      isValid = false;
    }
    if (!course) {
      document.getElementById('course-error').textContent = 'Please select a course.';
      isValid = false;
    }
    if (feedback.length < 5) {
      document.getElementById('feedback-error').textContent = 'Please enter at least 5 characters of feedback.';
      isValid = false;
    }

    if (!isValid) return;

    // Loading State
    btnSubmit.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, rollNumber, email, course, category, rating, feedback })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Feedback submitted successfully!');
        feedbackForm.reset();
        setRating(5);
        fetchStats();
        fetchFeedbacks();
      } else {
        if (res.status === 409 || data.message.toLowerCase().includes('already submitted') || data.message.toLowerCase().includes('duplicate')) {
          alertTitle.textContent = 'Duplicate Submission Error';
          alertMessage.textContent = data.message || 'Student has already submitted feedback for this course.';
          formAlertBox.classList.remove('hidden');
        } else {
          showToast(data.message || 'Error submitting feedback', 'error');
        }
      }
    } catch (err) {
      showToast('Network error while submitting feedback', 'error');
    } finally {
      btnSubmit.disabled = false;
      btnText.classList.remove('hidden');
      btnLoader.classList.add('hidden');
    }
  });

  // Filter & Search Listener with Debounce
  filterCourseSelect.addEventListener('change', fetchFeedbacks);
  
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchFeedbacks, 300);
  });

  // Helpers
  function getInitials(name) {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  function getStarsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        html += '<i class="fa-solid fa-star"></i>';
      } else {
        html += '<i class="fa-regular fa-star" style="opacity: 0.3;"></i>';
      }
    }
    return html;
  }

  function formatTimeAgo(isoString) {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }

  function showToast(msg, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') {
      toast.style.borderLeftColor = '#F43F5E';
      toast.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: #F43F5E;"></i> ${msg}`;
    } else {
      toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #10B981;"></i> ${msg}`;
    }

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4500);
  }

  // Initial Load
  fetchStats();
  fetchFeedbacks();
});
