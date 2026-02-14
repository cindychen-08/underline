function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function renderHighlights() {
    const container = document.getElementById('highlights-list');
    const emptyMessage = document.getElementById('empty-message');
    const stats = document.getElementById('stats');
    
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      
      if (highlights.length === 0) {
        emptyMessage.style.display = 'block';
        container.innerHTML = '';
        stats.textContent = '';
        return;
      }
      
      emptyMessage.style.display = 'none';
      
      // Stats
      const sources = new Set(highlights.map(h => h.pageTitle)).size;
      stats.textContent = `${highlights.length} highlights from ${sources} sources`;
      
      // Sort by date, newest first
      const sorted = highlights.slice().reverse();
      
      // Group by source
      const bySource = {};
      sorted.forEach(h => {
        if (!bySource[h.pageTitle]) {
          bySource[h.pageTitle] = {
            url: h.url,
            highlights: []
          };
        }
        bySource[h.pageTitle].highlights.push(h);
      });
      
      // Render
      let html = '';
      Object.keys(bySource).forEach(source => {
        const group = bySource[source];
        html += `
          <section class="source-group">
            <h2 class="source-title">
              <a href="${group.url}" target="_blank">${source}</a>
            </h2>
            ${group.highlights.map(h => `
              <article class="highlight-item">
                <blockquote class="highlight-text">${h.text}</blockquote>
                ${h.aiResponse ? `
                  <div class="ai-annotation">
                    <span class="ai-type">${h.aiResponse.action}</span>
                    <p>${h.aiResponse.response}</p>
                  </div>
                ` : ''}
                <time class="highlight-date">${formatDate(h.timestamp)}</time>
              </article>
            `).join('')}
          </section>
        `;
      });
      
      container.innerHTML = html;
    });
  }
  
  function exportAsMarkdown() {
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      
      if (highlights.length === 0) {
        alert('No highlights to export');
        return;
      }
      
      let markdown = `# My Highlight Reel\n\n`;
      markdown += `*${highlights.length} highlights*\n\n---\n\n`;
      
      // Group by source
      const bySource = {};
      highlights.forEach(h => {
        if (!bySource[h.pageTitle]) {
          bySource[h.pageTitle] = { url: h.url, highlights: [] };
        }
        bySource[h.pageTitle].highlights.push(h);
      });
      
      Object.keys(bySource).forEach(source => {
        const group = bySource[source];
        markdown += `## ${source}\n`;
        markdown += `[Source](${group.url})\n\n`;
        
        group.highlights.forEach(h => {
          markdown += `> ${h.text}\n\n`;
          if (h.aiResponse) {
            markdown += `**${h.aiResponse.action}:** ${h.aiResponse.response}\n\n`;
          }
          markdown += `*${formatDate(h.timestamp)}*\n\n`;
        });
        
        markdown += `---\n\n`;
      });
      
      // Download
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-highlights.md';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  
  function copyAsHTML() {
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      
      if (highlights.length === 0) {
        alert('No highlights to copy');
        return;
      }
      
      let html = `<h1>My Highlight Reel</h1>\n`;
      
      // Group by source
      const bySource = {};
      highlights.forEach(h => {
        if (!bySource[h.pageTitle]) {
          bySource[h.pageTitle] = { url: h.url, highlights: [] };
        }
        bySource[h.pageTitle].highlights.push(h);
      });
      
      Object.keys(bySource).forEach(source => {
        const group = bySource[source];
        html += `<h2><a href="${group.url}">${source}</a></h2>\n`;
        
        group.highlights.forEach(h => {
          html += `<blockquote>${h.text}</blockquote>\n`;
          if (h.aiResponse) {
            html += `<p><strong>${h.aiResponse.action}:</strong> ${h.aiResponse.response}</p>\n`;
          }
        });
      });
      
      navigator.clipboard.writeText(html).then(() => {
        alert('HTML copied to clipboard!');
      });
    });
  }
  
  // Event listeners
  function exportToGoogleDocs() {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError || !token) {
        alert('Failed to sign in to Google: ' + (chrome.runtime.lastError?.message || 'No token'));
        return;
      }
      
      chrome.storage.local.get(['highlights'], async (result) => {
        const highlights = result.highlights || [];
        
        if (highlights.length === 0) {
          alert('No highlights to export');
          return;
        }
        
        // Group by source
        const bySource = {};
        highlights.forEach(h => {
          if (!bySource[h.pageTitle]) {
            bySource[h.pageTitle] = { url: h.url, highlights: [] };
          }
          bySource[h.pageTitle].highlights.push(h);
        });
        
        // Build document content
        let requests = [];
        let index = 1;
        
        // Title
        requests.push({
          insertText: {
            location: { index },
            text: 'My Highlight Reel\n\n'
          }
        });
        index += 'My Highlight Reel\n\n'.length;
        
        // Add highlights by source
        Object.keys(bySource).forEach(source => {
          const group = bySource[source];
          
          // Source title
          requests.push({
            insertText: {
              location: { index },
              text: source + '\n'
            }
          });
          index += source.length + 1;
          
          // Source URL
          requests.push({
            insertText: {
              location: { index },
              text: group.url + '\n\n'
            }
          });
          index += group.url.length + 2;
          
          // Each highlight
          group.highlights.forEach(h => {
            const highlightText = '"' + h.text + '"\n\n';
            requests.push({
              insertText: {
                location: { index },
                text: highlightText
              }
            });
            index += highlightText.length;
            
            if (h.aiResponse) {
              const aiText = h.aiResponse.action + ': ' + h.aiResponse.response + '\n\n';
              requests.push({
                insertText: {
                  location: { index },
                  text: aiText
                }
              });
              index += aiText.length;
            }
          });
          
          // Separator
          requests.push({
            insertText: {
              location: { index },
              text: '---\n\n'
            }
          });
          index += 5;
        });
        
        try {
          // Create new document
          const createResponse = await fetch('https://docs.googleapis.com/v1/documents', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: 'My Highlight Reel - ' + new Date().toLocaleDateString()
            })
          });
          
          const doc = await createResponse.json();
          
          if (!doc.documentId) {
            alert('Failed to create document');
            console.error(doc);
            return;
          }
          
          // Add content
          await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests })
          });
          
          // Open the document
          window.open(`https://docs.google.com/document/d/${doc.documentId}/edit`, '_blank');
          
        } catch (error) {
          console.error('Google Docs error:', error);
          alert('Failed to export: ' + error.message);
        }
      });
    });
  }

  document.getElementById('export-gdocs').addEventListener('click', exportToGoogleDocs);
  document.getElementById('export-md').addEventListener('click', exportAsMarkdown);
  document.getElementById('copy-html').addEventListener('click', copyAsHTML);
  
  // Initial render
  renderHighlights();