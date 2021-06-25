# Privacy Choice Browser Extension
  
 This browser extension is entirely for research purposes, allowing us to better understand the inner-workings of users' decisions concerning privacy choices.

 <p align="center">
  <a href="https://chrome.google.com/webstore/"><img src="https://github.com/privacy-tech-lab/optmeowt-browser-extension/blob/main/chrome-web-store-badge.png" width="200px" alt="Chrome Web Store badge"></a>
<p>

## Files and Directories in this Repo

- `src/`: Contains the main contents of the privacy choice browser extension.
- `src/libs-css`: Contains all of the CSS libraries used in the browser extension.
- `src/libs-js`: Contains all of the JS libraries used in the browser extension.
- `src/options`: Contains the UI elements and scripts for the supplemental options page.
- `src/popup`: Contains the UI elements and scripts for the popup inside the extensions bar.
- `src/json`: Contains the JSON configuration files for the extensions Do Not Sell headers.
- `src/json/headers.json`: Contains the opt out HTTP header specs.
- `src/background.html`: The extension's background page. Launches all critical extension scripts and libraries.
- `src/background.js`: This is the main script running the extension. It controls all of the major backend, regarding whether the extension is on/off, sending the Do Not Sell signal, etc.
- `src/contentScript.js`: This is the main supplemental script that passes data to `background.js` and runs on every webpage loaded.
- `src/dom.js`: This is a JS file that implements the functionality of setting a DOM GPC signal to an outgoing request
- `src/domainlist.js`: This is the main JS file that allows the extension to communicate with the `domain list` stored in the browser's local storage.
- `src/manifest.json`: This provides the browser with metadata about the extension, regarding its name, permissions, etc.

## Third Party Libraries

The privacy choice extensions uses the following third party libraries. We thank the developers.

- [animate.css](https://github.com/animate-css/animate.css)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js)
- [mustache.js](https://github.com/janl/mustache.js)
- [psl (Public Suffix List)](https://github.com/lupomontero/psl)
- [Switch Animation by Aaron Iker](https://codepen.io/aaroniker/pen/oaQdQZ)
- [uikit](https://github.com/uikit/uikit)

<p align="center">
  <img src="https://github.com/privacy-tech-lab/privacy-choice-browser-extension/blob/main/plt_logo.png" width="200px" height="200px" alt="privacy-tech-lab logo">
<p>