function getDateGroup(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 && date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (diffDays <= 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return 'This Week';
    } else {
      return 'Older';
    }
  }
  
  function renderHighlights(searchQuery = '') {
    const container = document.getElementById('highlights-container');
    const emptyMessage = document.getElementById('empty-message');
    
    chrome.storage.local.get(['highlights'], (result) => {
      let highlights = result.highlights || [];
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        highlights = highlights.filter(h => 
          h.text.toLowerCase().includes(query) ||
          h.pageTitle.toLowerCase().includes(query) ||
          (h.aiResponse && h.aiResponse.response.toLowerCase().includes(query))
        );
      }
      
      if (highlights.length === 0) {
        emptyMessage.style.display = 'block';
        emptyMessage.textContent = searchQuery ? 'No highlights match your search.' : 'No highlights yet. Select text on any page and click Save.';
        container.innerHTML = '';
        return;
      }
      
      emptyMessage.style.display = 'none';
      
      // Sort newest first
      const sorted = highlights.slice().reverse();
      
      // Group by date
      const groups = {};
      sorted.forEach(h => {
        const group = getDateGroup(h.timestamp);
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(h);
      });
      
      // Render groups
      const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older'];
      let html = '';
      
      groupOrder.forEach(groupName => {
        if (groups[groupName] && groups[groupName].length > 0) {
          html += `<div class="date-group">
            <h2 class="group-title">${groupName}</h2>
            ${groups[groupName].map(h => renderHighlightCard(h)).join('')}
          </div>`;
        }
      });
      
      container.innerHTML = html;
      
      // Add event listeners
      document.querySelectorAll('.highlight-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (!e.target.classList.contains('delete-btn')) {
            card.classList.toggle('expanded');
          }
        });
      });
      
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(e.target.dataset.id);
          deleteHighlight(id);
        });
      });
    });
  }
  
  function renderHighlightCard(h) {
    const truncatedText = h.text.length > 80 ? h.text.substring(0, 80) + '...' : h.text;
    
    return `
      <div class="highlight-card" data-id="${h.id}">
        <div class="card-preview">
          <p class="highlight-text-preview">${truncatedText}</p>
          <span class="expand-icon"></span>
        </div>
        <div class="card-full">
          <p class="highlight-text-full">${h.text}</p>
          ${h.aiResponse ? `
            <div class="ai-response">
              <span class="ai-label">${h.aiResponse.action}:</span>
              <p class="ai-text">${h.aiResponse.response}</p>
            </div>
          ` : ''}
          <div class="card-meta">
            <span class="highlight-source">${h.pageTitle}</span>
            <span class="highlight-date">${new Date(h.timestamp).toLocaleDateString()}</span>
          </div>
          <button class="delete-btn" data-id="${h.id}">Delete</button>
        </div>
      </div>
    `;
  }
  
  function deleteHighlight(id) {
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      const updated = highlights.filter(h => h.id !== id);
      chrome.storage.local.set({ highlights: updated }, () => {
        const searchInput = document.getElementById('search-input');
        renderHighlights(searchInput.value);
      });
    });
  }
  
  // Search functionality
  document.getElementById('search-input').addEventListener('input', (e) => {
    renderHighlights(e.target.value);
  });
  
  // Initial render
  renderHighlights();
  
  // View All button
document.getElementById('view-all-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('highlights.html') });
  });