/**
 * StatStack — Share System
 * Handles clipboard copy and native Web Share API.
 */

const ShareSystem = (() => {
  function share(text) {
    // Try native share first (mobile)
    if (navigator.share) {
      navigator.share({
        title: 'StatStack',
        text: text,
      }).catch(() => {
        // User cancelled or share failed — fall back to clipboard
        copyToClipboard(text);
      });
      return;
    }

    // Desktop fallback: clipboard
    copyToClipboard(text);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Copied to clipboard!');
    } catch {
      showToast('Could not copy — long press to select text');
    }
    document.body.removeChild(ta);
  }

  function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  return { share, copyToClipboard };
})();
