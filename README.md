<p align="center">
  <a href="https://github.com/privacy-tech-lab/gpc-privacy-choice/releases"><img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/privacy-tech-lab/gpc-privacy-choice"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-privacy-choice/releases"><img alt="GitHub Release Date" src="https://img.shields.io/github/release-date/privacy-tech-lab/gpc-privacy-choice"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-privacy-choice/commits/main"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/privacy-tech-lab/gpc-privacy-choice"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-privacy-choice/issues"><img alt="GitHub issues" src="https://img.shields.io/github/issues-raw/privacy-tech-lab/gpc-privacy-choice"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-privacy-choice/issues?q=is%3Aissue+is%3Aclosed"><img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed-raw/privacy-tech-lab/gpc-privacy-choice"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-privacy-choice/blob/main/LICENSE.md"><img alt="GitHub" src="https://img.shields.io/github/license/privacy-tech-lab/gpc-privacy-choice"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-privacy-choice/watchers"><img alt="GitHub watchers" src="https://img.shields.io/github/watchers/privacy-tech-lab/gpc-privacy-choice?style=social"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-privacy-choice/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/privacy-tech-lab/gpc-privacy-choice?style=social"></a>
  <a href="https://github.com/privacy-tech-lab/gpc-privacy-choice/network/members"><img alt="GitHub forks" src="https://img.shields.io/github/forks/privacy-tech-lab/gpc-privacy-choice?style=social"></a>
</p>

# GPC Privacy Choice
  
 This browser extension is entirely for research purposes, allowing us to better understand the inner-workings of users' decisions concerning privacy choices.

## Installation of GPC Privacy Choice
  
  Follow the instructions below in order to download this browser extension.

1. Clone the library by entering `git clone https://github.com/privacy-tech-lab/gpc-privacy-choice.git` into your terminal.
2. The GPC Privacy Choice Browser Extension should now be downloaded locally onto your device. Next, open a tab on Google Chrome.
3. In the top right corner of the browser, there's an icon of a puzzle piece. Click on the icon, and then subsequently click `Manage Extensions`.
4. You should be brought to a page that contains all of the different extensions you have downloaded to Chrome. In the top left corner, click on the button that says `Load unpacked`.
5. Select the folder `gpc-privacy-choice/src` from your files.
6. The extension should now be downloaded on your browser. Enjoy!
  
## Files and Directories in this Repo

- `src/`: Contains the main contents of the GPC Privacy Choice browser extension.
- `src/libs-css`: Contains all of the CSS libraries used in the browser extension.
- `src/libs-js`: Contains all of the JS libraries used in the browser extension.
- `src/options`: Contains the UI elements and scripts for the supplemental options page.
- `src/popup`: Contains the UI elements and scripts for the popup inside the extensions bar.
- `src/json`: Contains the JSON configuration files for the extensions Do Not Sell headers.
- `src/json/headers.json`: Contains the opt out HTTP header specs.
- `src/json/firebase.json`: The Firebase (Firestore) configuration file.
- `src/json/firestore.json.index`: Contains the indexes used by the extension to sort and filter the Firestore database.
- `src/background.html`: The extension's background page. Launches all critical extension scripts and libraries.
- `src/background.js`: This is the main script running the extension. It controls all of the major backend, regarding whether the extension is on/off, sending the Do Not Sell signal, etc.
- `src/BrowserHistory.js`: This is a content script that runs at the start of a document and sends a message to the background that a new page is being loaded.
- `src/contentScript.js`: This is the main supplemental script that passes data to `background.js` and runs on every webpage loaded.
- `src/dom.js`: This is a JS file that implements the functionality of setting a DOM GPC signal to an outgoing request
- `src/domainlist.js`: This is the main JS file that allows the extension to communicate with the `domain list` stored in the browser's local storage.
- `src/firebase.js`: This is a background script that holds the functions used to add data to the Firestore database.
- `src/firestore.rules`: This file contains the rules for reading and writing to the Firestore database.
- `src/manifest.json`: This provides the browser with metadata about the extension, regarding its name, permissions, etc.

## Third Party Libraries

The GPC Privacy Choice extension uses the following third party libraries. We thank the developers.

- [animate.css](https://github.com/animate-css/animate.css)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js)
- [mustache.js](https://github.com/janl/mustache.js)
- [psl (Public Suffix List)](https://github.com/lupomontero/psl)
- [uikit](https://github.com/uikit/uikit)
- [disconnect-tracking-protection](https://github.com/disconnectme/disconnect-tracking-protection)

## Installation of Firebase Server

## Data Collection

First and foremost, this browser extension functions as a research project. The purpose of this browser extension is for the observation and study of how users make choices concerning their privacy and the selling of their data to advertisers. As such, we will be collecting data on how users interact with the GPC Privacy Choice extension using Firebase. Different aspects of the data we will be collecting are shown below.

<img width="1260" alt="Screen Shot 2021-07-19 at 4 34 52 PM" src="https://user-images.githubusercontent.com/54873610/126223709-038c28e1-0cbd-4cf2-b9d9-04058f184d3a.png">

Each user is anonymously recorded as well as assigned a User ID. We then record general pieces of information, such as what browser they use, their time zone, and what UI Scheme they've been randomly assigned. More specifically, there are two collections that will continuously be updated as users continue to use their browser and the GPC Privacy Choice extension.

### Browser History

The browser history of a user is composed of a list of documents that represent all the sites a user has visited. Various info is then given about the site, such as the `GPC Current Site Status` and `GPC Global Status`, as shown above.

<img width="1266" alt="Screen Shot 2021-07-19 at 4 14 30 PM" src="https://user-images.githubusercontent.com/54873610/126221409-be61d292-bfe5-4794-9890-9e73bd4b29f6.png">

<img width="1263" alt="Screen Shot 2021-07-19 at 4 14 52 PM" src="https://user-images.githubusercontent.com/54873610/126221424-0689dfc7-1ba9-4a10-93b4-f445b106a9ef.png">

### Setting Interaction History

The setting interaction history records all the ways a user interacts with the browser extension. This could include responding to a banner, or manually going to the options page and making changes themselves.

<img width="1265" alt="Screen Shot 2021-07-19 at 4 21 15 PM" src="https://user-images.githubusercontent.com/54873610/126222954-02afec37-a945-4926-89c3-1c6aa783cba7.png">

Below are some basic actions a user could take relating to the GPC Privacy Choice extension, and the corresponding entries that will be recorded in the setting interaction history.

#### Responding to the banner without applying to all

<img width="331" alt="Screen Shot 2021-07-19 at 4 36 38 PM" src="https://user-images.githubusercontent.com/54873610/126225796-d5d487e3-baea-40b7-94ef-c8b27019fe94.png">

As seen above, the setting change was applied to the specific domain `netflix.com`, done through a banner, and the setting was changed from `unset` to `Don't Allow Tracking`. Additionally, the universal setting is `off`, which means that this setting change will not be applied to future domains as well.

#### Responding to the banner with applying all

<img width="344" alt="Screen Shot 2021-07-19 at 4 46 14 PM" src="https://user-images.githubusercontent.com/54873610/126225837-85fe5c53-ff1a-4eff-b651-457e6f996455.png">

The setting change has been applied to `All existing and future domains` and was done through a banner decision. The setting was changed from `unset` to `Don't allow tracking` and, as hinted at by the previous fields, the universal setting is now `On` since the user decided to apply to all domains.

#### Individually toggling a domain on/off

<img width="310" alt="Screen Shot 2021-07-20 at 9 13 31 AM" src="https://user-images.githubusercontent.com/54873610/126330284-8b87aa49-37e3-400d-b10a-6648dab575ab.png">

The setting change is only applied to the individual domain shown, and was done through the options page. This is indicated by the `Origin Site` field being a URL, which means the user went from that site _to_ the options page. The setting was changed from `Allow tracking` to `Don't allow tracking` and the universal setting is false since the user does not have a generalized decision about future domains.

#### Applying to all

<img width="559" alt="Screen Shot 2021-07-20 at 9 20 16 AM" src="https://user-images.githubusercontent.com/54873610/126331222-efa99859-64a5-4a9e-8bcc-72790a81a5c8.png">

The setting was applied to `All existing and future domains`. It was done through the options page, which the user opened directly after visiting the shown URL. The change altered the user's preferences from a `personalized domain list` (AKA they individually chose who to allow and not to allow) to the more general `Don't allow tracking`. The universal setting is set to `true`, which means that there is currently a setting in place that will be applied to all future domains. As this specific change was applied to future domains, we know that this setting is `Don't allow tracking`.

#### Turning off universal setting

<img width="552" alt="Screen Shot 2021-07-20 at 9 41 06 AM" src="https://user-images.githubusercontent.com/54873610/126334507-5bc80f3d-d2d9-4e93-b876-5ae4af0af787.png">

The setting has been applied to `All future domains`, and the user came to the options page from the shown URL. The setting change was concerning the universal setting, which was previously `On` but is now `Off`. As it is now `Off`, the `Universal Setting` field now reads false.

#### Deleting a single domain

<img width="556" alt="Screen Shot 2021-07-20 at 10 04 11 AM" src="https://user-images.githubusercontent.com/54873610/126337882-45fc0e55-73cb-4cf8-a4d4-0def18e64f3e.png">

The setting is applied to an individual domain, and the user came to the options page from the given URL. The setting changed was a deletion, so simply, the given domain was deleted off of the domain list. There is no `universal setting` in place.

#### Deleting all domains

<img width="562" alt="Screen Shot 2021-07-20 at 10 06 56 AM" src="https://user-images.githubusercontent.com/54873610/126338299-53ababec-4ce2-4a69-ad0a-b0c343d50644.png">

Setting is applied to `All existing domains`, and as usual, the user came to the options page from the given URL. As the setting changed is `Delete domain`, this means that all existing domains (AKA the current domain list) have been deleted. There is no current `universal setting` in place.

<p align="center">
  <a href="https://www.privacytechlab.org/"><img src="https://github.com/privacy-tech-lab/privacy-choice-browser-extension/blob/main/plt_logo.png" width="200px" height="200px" alt="privacy-tech-lab logo"></a>
</p>
