# Optmeowt Research Browser Extension
  
 This browser extension is entirely for research purposes, allowing us to better understand the inner-workings of users' decisions concerning privacy choices.

## How does it work?

This browser extension presents users with a dialog that obtains their preferences on whether a website may track them or not. Depending on each respective user's decision, all websites may be _denied_ tracking rights, all websites may be _allowed_ tracking rights, or the user also may personally customize which websites they allow to track them.

**Customizing which Sites Receive Do Not Sell Signals**
For every website you visit OptMeowt will automatically add its domain to the `domain list` meaning that it will receive a Do Not Sell signal. However, you can exclude domains that should not receive a Do Not Sell signal. This functionality is available on OptMeowt's settings page that you can access from OptMeowt's icon in the 'Extensions' tab.

## Installing and Running OptMeowt from Source on Chromium-based Browsers

1. Clone this repo or download a zipped copy and unzip it.
2. Follow [these steps](https://www.npmjs.com/get-npm) to install npm.
3. Install the Grunt command line tool and run in your terminal\
   `npm install -g grunt-cli`
4. Then, run:\
   `cd optmeowt-browser-extension`\
   `npm i grunt`
5. In your browser, navigate to the extensions page at `chrome://extensions/`.
6. Enable `Developer mode` with the slider on the top right corner of the extension page.
7. Click the `Load unpacked` button in the top left of the page.
8. Navigate to where you unzipped the OptMeowt folder and open up the `src` folder.\
   **Note:** You do not need to click on the `manifest.json` file in Chrome, though other browsers may require this.
9. Click to finalize the install.

## Files and Directories in this Repo

- `src/`: Contains the main contents of the OptMeowt browser extension.
- `src/libs-css`: Contains all of the CSS libraries used in the browser extension.
- `src/libs-js`: Contains all of the JS libraries used in the browser extension.
- `src/options`: Contains the UI elements and scripts for the supplemental options page.
- `src/popup`: Contains the UI elements and scripts for the popup inside the extensions bar.
- `src/json`: Contains the JSON configuration files for OptMeowt's Do Not Sell cookies and headers.
- `src/json/headers.json`: Contains the opt out HTTP header specs used by OptMeowt.
- `src/background.html`: OptMeowt's background page. Launches all critical extension scripts and libraries.
- `src/background.js`: This is the main script running OptMeowt. It controls all of the major backend, regarding whether the extension is on/off, sending the Do Not Sell signal, etc.
- `src/contentScript.js`: This is the main supplemental script that passes data to `background.js` and runs on every webpage loaded.
- `src/dom.js`: This is a JS file that implements the functionality of setting a DOM GPC signal to an outgoing request
- `src/domainlist.js`: This is the main JS file that allows the extension to communicate with the `domain list` stored in the browser's local storage.
- `src/manifest.json`: This provides the browser with metadata about the extension, regarding its name, permissions, etc.

## Third Party Libraries

OptMeowt uses the following third party libraries. We thank the developers.

- [animate.css](https://github.com/animate-css/animate.css)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js)
- [mustache.js](https://github.com/janl/mustache.js)
- [psl (Public Suffix List)](https://github.com/lupomontero/psl)
- [Switch Animation by Aaron Iker](https://codepen.io/aaroniker/pen/oaQdQZ)
- [uikit](https://github.com/uikit/uikit)
