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

GPC Privacy Choice is developed and maintained by **Chunyue Ma (@chunyuema)**, **Isabella Tassone (@bella-tassone)**, **Eliza Kuller (@ekuller)**, and **Sebastian Zimmeck (@SebastianZimmeck)** of the [privacy-tech-lab](https://www.privacytechlab.org/). **Kuba Alicki**, **Daniel Knopf**, **Abdallah Salia** contributed earlier.

## Developer's Guide On Using GPC Privacy Choice

Follow the instructions below in order to download and use this browser extension.

1. Clone the repository: `git clone https://github.com/privacy-tech-lab/gpc-privacy-choice.git`.
2. Create a firebase cloud firestore project, Follow this link [here](https://firebase.google.com/docs/firestore/quickstart) to get detailed instructions on how to set up a Firebase server for data collection.
3. In the `src` folder, create `config.js` file, and add in the following code, be sure to update the fields accordingly based on the project you have set up. The password can be randomly initialized, and it will be the password required later while using the extension.

```
  export const PASSWORD = "*******";

  export const firebaseConfig = {
      apiKey: "********",
      authDomain: "******",
      projectId: "******",
      storageBucket: "******",
      messagingSenderId: "******",
      appId: "******",
  };
```

4. To test the browser extension from local repository, open the browser (Chrome, Brave, etc) and find the manage extentsion options from settings. In Google Chrome, this can be done by clicking on the puzzle icon on the top right corner, and then clicking `Manage Extensions`.
5. Turn on the developer mode, and then click the `Load unpacked`. Select the folder `gpc-privacy-choice/src` from your files.
6. The extension should now be loaded and you should see the registration page popping up on the browser. In order to access the extension and start writing to your database, supply a valid prolific ID and password (mentioned above) to go through the registration process.

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
- `src/contentScript.js`: This is the main supplemental script that passes data to `background.js` and runs on every webpage loaded.
- `src/dom.js`: This is a JS file that implements the functionality of setting a DOM GPC signal to an outgoing request
- `src/domainlist.js`: This is the main JS file that allows the extension to communicate with the `domain list` stored in the browser's local storage.
- `src/firebase.js`: This is a background script that holds the functions used to add data to the Firestore database.
- `src/firestore.rules`: This file contains the rules for reading and writing to the Firestore database.
- `src/manifest.json`: This provides the browser with metadata about the extension, regarding its name, permissions, etc.
- `src/profile.js`: This file sets up the user-registration page for schemes 3 and 6.
- `src/questionnaire.js`: This file sets up the user-registration page for scheme 4.
- `src/registration.js`: This file is a generic user-registration page for the remaining schemes.
- `thirdPartyCookies.js`: TBD
- `src/oneQuestion.html`: Works with `src/profile.js` to set up the user-registration page for scheme 6.

## Third Party Libraries

The GPC Privacy Choice extension uses the following third party libraries. We thank the developers.

- [animate.css](https://github.com/animate-css/animate.css)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js)
- [mustache.js](https://github.com/janl/mustache.js)
- [psl (Public Suffix List)](https://github.com/lupomontero/psl)
- [uikit](https://github.com/uikit/uikit)
- [disconnect-tracking-protection](https://github.com/disconnectme/disconnect-tracking-protection)

## Comprehensive Scheme List

The GPC Privacy Choice extension is made up of 7 different schemes, each having different defining features. Upon downloading, a user could end up with any one of the different schemes. The purpose behind having so many variations is to provide researchers with valuable information on how users make privacy choices when given varying levels of usability. Listed below are the main components of each scheme.

### Scheme 0

Users are presented the **GPC Privacy Choice Banner** on each new site they visit with no **apply-all** option. There is instead a **snooze** button that, upon being selected, will prevent the banner from popping up on new sites for 6 hours. The domain list is present on the Options Page.

<img width="298" alt="Scheme 0" src="https://user-images.githubusercontent.com/54873610/135547002-d0a533e9-2025-42f3-ae78-1abd0c12daa8.png">

### Scheme 1

This was our first scheme, the original. The **GPC Privacy Choice Banner** is presented on every new site _with_ an **apply-all** option, but no **snooze** button. All **universal toggles** are present on the Options Page, as well as the domain list.

<img width="297" alt="Scheme 1" src="https://user-images.githubusercontent.com/54873610/135547017-1f78b987-3936-4188-af14-98d2dc4db1f9.png">

### Scheme 2

This is somewhat a combination of **Scheme 0** and **Scheme 1**. The **GPC Privacy Choice Banner** contains both the **apply-all** option as well as the **snooze** button. All **universal toggles**, as well as the domain list may be accessed from the Options Page.

<img width="298" alt="Scheme 2" src="https://user-images.githubusercontent.com/54873610/135547019-c4d59658-ede0-47bd-9e95-f95546e130a2.png">

### Scheme 3

This is our **Privacy Profile** scheme. Upon running the extension, users will be prompted to choose the privacy profile that they find most similar to themselves. Their privacy choices will then be personalized based on the selected profile. They may further personalize their privacy choices by accessing the domain list on the Options Page.

<img width="1281" alt="Scheme 3" src="https://user-images.githubusercontent.com/54873610/135544395-e648e4ea-00e6-49c0-9629-3248c87ffba9.png">

### Scheme 4

This is our **Categories Questionnaire** scheme. Users are initially prompted to select the categories of tracking that they would like to "opt out" from. This personalizes their privacy choices, which again they may further alter by accessing the Options Page.

<img width="1251" alt="Scheme 4" src="https://user-images.githubusercontent.com/54873610/135544412-dc40313b-051a-4de5-8686-5e0363ee94f1.png">

### Scheme 5

A combination of **Scheme 1** and **Scheme 3**, this is our **Machine-Learning** scheme. The user is randomly presented 10 banners in total on websites they visit. Their choices are recorded by the extension, which it then uses to make an educated selection on which **Privacy Profile** would suit them most. No banners are shown beyond the initial 10, and after the learning period is over users may change their privacy profile by accessing the Options Page.

<img width="599" alt="Scheme 5" src="https://user-images.githubusercontent.com/54873610/135544427-c3dc79c5-c9db-4e09-9854-35f81d5a0ba2.png">

### Scheme 6

This scheme is the most simple of all. Users are initially prompted as to whether they'd like to send **GPC Signals** to all websites they visit or not. They may change this preference from the Options Page, but no domain list is present, so they cannot personalize their choices.

<img width="1252" alt="Scheme 6" src="https://user-images.githubusercontent.com/54873610/135544436-6da19bd5-780a-4174-b39a-624d864d389e.png">

## Data Collection

The GPC Privacy Choice browser extension records how users interact with different sites and make privacy choices. In the database, each user is represented by a unique ID, and all of their interactions are recorded under that ID. Below are some different categories of data that might be recorded. **DISCLAIMER: The GPC Privacy Choice browser extension records all of the different sites visited by users, as there could be possible relationships between the types of sites visited and the corresponding privacy choice made.**

### Browser History

This category records the information of each site the user is on while using the browser extension.

### Privacy Configuration Interaction History

This category records the privacy decisions users might make on schemes 3, 4, 5 and 6. That is, more general privacy decisions based on groups or categorizations of tracking.

### Domain Interaction History

This category records the privacy decisions users might make on schemes 0, 1 or 2. These schemes use a banner to provide in-depth personalization, where privacy choices can be as specific as varying by the site a user is on.

### Mute Interaction History

This category would be relevant for schemes where the mute button is present, that is, schemes 0 and 2. It simply records when users choose to utilize the mute button.

<p align="center"><img width="920" alt="Screen Shot 2021-10-11 at 7 51 45 PM" src="https://user-images.githubusercontent.com/54873610/136868329-b5d33dee-ce47-4110-9ae4-a4de774ca72c.png">
  
_Above is an example of a user's data profile, and some of the information that would be recorded._

<a href="https://www.privacytechlab.org/"><img src="https://github.com/privacy-tech-lab/privacy-choice-browser-extension/blob/main/plt_logo.png" width="200px" height="200px" alt="privacy-tech-lab logo"></a>

</p>

## Future Directions

The team is currently working on the upgrade from [Manifest V2 to Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/). However, this process is restricted due to the face that service workers in [MV3 currently do not support Firebase Cloud Firestore](https://github.com/privacy-tech-lab/gpc-privacy-choice/issues/144). Moving into the future, we tentatively decide to switch into another database if the support for Cloud Firestore is still missing.
