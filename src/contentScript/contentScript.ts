function injectScript(filePath) {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL(filePath)
  script.type = 'module'
  script.onload = function () {
    script.remove()
  }
  ;(document.head || document.documentElement).appendChild(script)
}

injectScript('inject.js')
