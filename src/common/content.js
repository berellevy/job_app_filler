

function injectScript(filePath) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL(filePath);
  script.type = "module"
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}
  
injectScript("scripts/autodiscoverInputs.js")
injectScript('scripts/inject.js');