console.log("Smart Highlight Reel loaded");

if (document.body) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}

function init() {
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.id = 'smart-highlight-save-btn';
  saveButton.style.cssText = `
    position: absolute;
    display: none;
    z-index: 10000;
    padding: 10px 18px;
    background: #1a1a1a;
    color: #ffffff;
    border: none;
     border-radius: 100px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    letter-spacing: 0.3px;
`;

  document.body.appendChild(saveButton);

  function getSelectionPosition() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      return null;
    }
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX + (rect.width / 2) - 30
    };
  }

  function showSaveButton() {
    const position = getSelectionPosition();
    if (position) {
      saveButton.style.display = 'block';
      saveButton.style.top = `${position.top}px`;
      saveButton.style.left = `${position.left}px`;
    } else {
      hideSaveButton();
    }
  }

  function hideSaveButton() {
    saveButton.style.display = 'none';
  }

  document.addEventListener('mouseup', (e) => {
    if (e.target === saveButton) return;
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (selectedText.length > 0) {
        showSaveButton();
      } else {
        hideSaveButton();
      }
    }, 10);
  });

  document.addEventListener('mousedown', (e) => {
    if (e.target !== saveButton) {
      const selection = window.getSelection();
      if (selection.toString().trim().length === 0) {
        hideSaveButton();
      }
    }
  });

  saveButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      const highlight = {
        id: Date.now(),
        text: selectedText,
        url: window.location.href,
        pageTitle: document.title,
        timestamp: new Date().toISOString()
      };

      selection.removeAllRanges();

      chrome.storage.local.get(['highlights'], (result) => {
        const highlights = result.highlights || [];
        highlights.push(highlight);
        chrome.storage.local.set({ highlights }, () => {
          saveButton.style.display = 'block';
          saveButton.textContent = 'Saved!';
          setTimeout(() => {
            saveButton.textContent = 'Save';
            hideSaveButton();
          }, 1000);
        });
      });
    } else {
      selection.removeAllRanges();
      hideSaveButton();
    }
  });
}