chrome.runtime.sendMessage({greeting:"NEW PAGE", site: window.location.href, referrer: document.referrer})