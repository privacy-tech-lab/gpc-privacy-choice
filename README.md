# Privacy Choice Browser Extension
  
 This browser extension is entirely for research purposes, allowing us to better understand the inner-workings of users' decisions concerning privacy choices.

## Installation
  
  Follow the instructions below in order to download this browser extension.
1. Clone the library by entering `git clone https://github.com/privacy-tech-lab/privacy-choice-browser-extension.git` into your terminal.
2. The Privacy Choice Browser Extension should now be downloaded locally onto your device. Next, open a tab on Google Chrome.
3. In the top right corner of the browser, there's an icon of a puzzle piece. Click on the icon, and then subsequently click `Manage Extensions`.
4. You should be brought to a page that contains all of the different extensions you have downloaded to Chrome. In the top left corner, click on the button that says `Load unpacked`.
5. Select the folder `privacy-choice-browser-extension/src` from your files.
6. The extension should now be downloaded on your browser. Enjoy!
  
## Files and Directories in this Repo

- `src/`: Contains the main contents of the privacy choice browser extension.
- `src/libs-css`: Contains all of the CSS libraries used in the browser extension.
- `src/libs-js`: Contains all of the JS libraries used in the browser extension.
- `src/options`: Contains the UI elements and scripts for the supplemental options page.
- `src/popup`: Contains the UI elements and scripts for the popup inside the extensions bar.
- `src/json`: Contains the JSON configuration files for the extensions Do Not Sell headers.
- `src/json/headers.json`: Contains the opt out HTTP header specs.
- `src/json/firebase.json`:
- `src/json/firestore.json.index`: Contains the opt out HTTP header specs.
- `src/background.html`: The extension's background page. Launches all critical extension scripts and libraries.
- `src/background.js`: This is the main script running the extension. It controls all of the major backend, regarding whether the extension is on/off, sending the Do Not Sell signal, etc.
- `src/BrowserHistory.js`:
- `src/contentScript.js`: This is the main supplemental script that passes data to `background.js` and runs on every webpage loaded.
- `src/dom.js`: This is a JS file that implements the functionality of setting a DOM GPC signal to an outgoing request
- `src/domainlist.js`: This is the main JS file that allows the extension to communicate with the `domain list` stored in the browser's local storage.
- `src/firebase.js`:
- `src/firestore.rules`:
- `src/manifest.json`: This provides the browser with metadata about the extension, regarding its name, permissions, etc.

## Third Party Libraries

The privacy choice extensions uses the following third party libraries. We thank the developers.

- [animate.css](https://github.com/animate-css/animate.css)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js)
- [mustache.js](https://github.com/janl/mustache.js)
- [psl (Public Suffix List)](https://github.com/lupomontero/psl)
- [uikit](https://github.com/uikit/uikit)

## Data Collection

The purpose of this browser extension is for the observation and study of how users make choices concerning their privacy and the selling of their data to advertisers. As such, we will be collecting data on how users interact with the Privacy Choice Browser Extension using Firebase. Different aspects of the data we will be collecting are shown below.

<img width="1260" alt="Screen Shot 2021-07-19 at 4 34 52 PM" src="https://user-images.githubusercontent.com/54873610/126223709-038c28e1-0cbd-4cf2-b9d9-04058f184d3a.png">


Each user is anonymously recorded as well as assigned a User ID. We then record general pieces of information, such as what browser they use, their time zone, and what UI Scheme they've been randomly assigned. More specifically, there are two collections that will continuously be updated as users continue to use their browser and the Privacy Choice Browser Extension.

### Browser History

The browser history of a user is composed of a list of documents that represent all the sites a user has visited. Various info is then given about the site, such as the `GPC Current Site Status` and `GPC Global Status`, as shown above.

<img width="1266" alt="Screen Shot 2021-07-19 at 4 14 30 PM" src="https://user-images.githubusercontent.com/54873610/126221409-be61d292-bfe5-4794-9890-9e73bd4b29f6.png">

<img width="1263" alt="Screen Shot 2021-07-19 at 4 14 52 PM" src="https://user-images.githubusercontent.com/54873610/126221424-0689dfc7-1ba9-4a10-93b4-f445b106a9ef.png">

### Setting Interaction History

The setting interaction history records all the ways a user interacts with the browser extension. This could include responding to a banner, or manually going to the options page and making changes themselves.

<img width="1265" alt="Screen Shot 2021-07-19 at 4 21 15 PM" src="https://user-images.githubusercontent.com/54873610/126222954-02afec37-a945-4926-89c3-1c6aa783cba7.png">

Below are some basic actions a user could take relating to the Privacy Choice Browser Extension, and the corresponding entries that will be recorded in the setting interaction history.

#### Responding to the banner without applying to all

<img width="331" alt="Screen Shot 2021-07-19 at 4 36 38 PM" src="https://user-images.githubusercontent.com/54873610/126225796-d5d487e3-baea-40b7-94ef-c8b27019fe94.png">

As seen above, the setting change was applied to the specific domain `netflix.com`, done through a banner, and the setting was changed from `unset` to `Don't Allow Tracking`. Additionally, the universal setting is `off`, which means that this setting change will not be applied to future domains as well.

#### Responding to the banner with applying all

<img width="344" alt="Screen Shot 2021-07-19 at 4 46 14 PM" src="https://user-images.githubusercontent.com/54873610/126225837-85fe5c53-ff1a-4eff-b651-457e6f996455.png">

The setting change has been applied to `All existing and future domains` and was done through a banner decision. The setting was changed from `unset` to `Don't Allow Tracking` and, as hinted at by the previous fields, the universal setting is now `On` since the user decided to apply to all domains.

#### Individually toggling a domain on/off

#### Applying to all

#### Turning off universal setting

#### Deleting a single domain

#### Deleting all domains

<p align="center">
  <img src="https://github.com/privacy-tech-lab/privacy-choice-browser-extension/blob/main/plt_logo.png" width="200px" height="200px" alt="privacy-tech-lab logo">
<p>
