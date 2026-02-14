chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'save-highlight',
      title: 'Save to Underline',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'summarize',
      title: 'Summarize this',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'explain',
      title: 'Explain this',
      contexts: ['selection']
    });
    
    chrome.contextMenus.create({
      id: 'counter',
      title: 'Counter-argument',
      contexts: ['selection']
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selectedText = info.selectionText;
    
    if (info.menuItemId === 'save-highlight') {
      saveHighlight(selectedText, tab.title, tab.url, null);
    } else if (['summarize', 'explain', 'counter'].includes(info.menuItemId)) {
      processWithAI(selectedText, info.menuItemId, tab.title, tab.url);
    }
  });
  
  function saveHighlight(text, pageTitle, url, aiResponse) {
    const highlight = {
      id: Date.now(),
      text: text,
      url: url,
      pageTitle: pageTitle,
      timestamp: new Date().toISOString(),
      aiResponse: aiResponse
    };
    
    chrome.storage.local.get(['highlights'], (result) => {
      const highlights = result.highlights || [];
      highlights.push(highlight);
      chrome.storage.local.set({ highlights });
    });
  }
  
  async function processWithAI(text, action, pageTitle, url) {
    const API_KEY = 'Ht7zJk88wcYz4V2JkSGewOUUnCkfy0ywEOpSHf0o';  // Replace with your actual Cohere API key
    
    const prompts = {
      summarize: `Summarize this text concisely in 2-3 sentences:\n\n${text}`,
      explain: `Explain this text in simple terms that anyone could understand:\n\n${text}`,
      counter: `Provide a thoughtful counter-argument or alternative perspective to this text:\n\n${text}`
    };
    
    try {
      const response = await fetch('https://api.cohere.ai/v2/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'command-a-03-2025',
          messages: [{
            role: 'user',
            content: prompts[action]
          }]
        })
      });
      
      const data = await response.json();
      console.log('Full API response:', data);
      
      if (data.message && typeof data.message === 'string') {
        console.error('API Error:', data.message);
        return;
      }
      
      const aiText = data.message.content[0].text;
      
      saveHighlight(text, pageTitle, url, {
        action: action,
        response: aiText
      });
      
      console.log('AI Response:', aiText);
      
    } catch (error) {
      console.error('Cohere API error:', error);
    }
  }