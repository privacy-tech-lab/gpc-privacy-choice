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
2. Create a Firebase Cloud Firestore project, Follow this link [here](https://firebase.google.com/docs/firestore/quickstart) to get detailed instructions on how to set up a Firebase server for data collection.
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

4. To test the browser extension from local repository, open the browser (Chrome, Brave, etc) and find the manage extension options from settings. In Google Chrome, this can be done by clicking on the puzzle icon on the top right corner, and then clicking `Manage Extensions`.
5. Turn on the developer mode, and then click the `Load unpacked`. Select the folder `gpc-privacy-choice/src` from your files.
6. The extension should now be loaded and you should see the registration page popping up on the browser. In order to access the extension and start writing to your database, supply a valid prolific ID and password (mentioned above) to go through the registration process.

## Files and Directories in this Repo
- `src/_metadata/generated_indexed_rulesets`:
- `src/firebase`: Contains all the Firebase related configurations/scripts
  - `src/firebase/firebase.json`: The Firebase (Firestore) configuration file.
  - `src/firebase/firestore.json.index`: Contains the indexes used by the extension to sort and filter the Firestore database.
  - `src/firebase/firebase.js`: This is a background script that holds the functions used to add data to the Firestore database.
  - locally hosted firestore script for connecting with the data base
    - `src/firebase/firebase-app.js`
    - `src/firebase/firebase-auth.js`
    - `src/firebase/firebase-firestore.js`
  - `src/firebase/firestore.rules`: This file contains the rules for reading and writing to the Firestore database.
- `src/img`: Contains all image resources
- `src/json`: Contains the JSON configuration files for the extensions Do Not Sell headers.
  - `src/json/headers.json`: Contains the opt out HTTP header specs.
  - `src/json/services.json`: 
- `src/libs-css`: Contains all of the CSS libraries used in the browser extension.
- `src/libs-js`: Contains all of the JS libraries used in the browser extension.
- `src/options`: Contains the UI elements and scripts for the supplemental options page.
- `src/registration`: Contains all user registration scripts relevant for performing the research
  - html files for different user schemes
    - `src/registration/oneQuestion.html`
    - `src/registration/profile.html`
    - `src/registration/questionnaire.html`
    - `src/registration/registration.html`
  - javascript files for registering users
    - `src/registration/profile.js`
    - `src/registration/questionnaire.js`
    - `src/registration/registration.js`
- `src/rulesets`:
- `src/background.js`: This is the main service worker running the extension. It controls all of the major backend, regarding whether the extension is on/off, sending the Do Not Sell signal, etc.
- `src/contentScript.js`: This is the main supplemental script that passes data to `background.js` and runs on every webpage loaded.
- `src/dom.js`: This is a JS file that implements the functionality of setting a DOM GPC signal to an outgoing request
- `src/editRules.js`:
- `src/manifest.json`: This provides the browser with metadata about the extension, regarding its name, permissions, etc.
- `src/thirdPartyData.js`:
- `src/updateSignal.js`:
- `src/util.js`: This provided utility functions for `background.js`


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

<img width="298" alt="0" src="https://user-images.githubusercontent.com/54873610/148790325-ef5ae195-e024-4177-9119-9f21865108df.png">

### Scheme 1

This was our first scheme, the original. The **GPC Privacy Choice Banner** is presented on every new site _with_ an **apply-all** option, but no **snooze** button. All **universal toggles** are present on the Options Page, as well as the domain list.

<img width="297" alt="1" src="https://user-images.githubusercontent.com/54873610/148790364-f41b418d-a6ec-41f4-bc79-78647f2e4096.png">

### Scheme 2

This is somewhat a combination of **Scheme 0** and **Scheme 1**. The **GPC Privacy Choice Banner** contains both the **apply-all** option as well as the **snooze** button. All **universal toggles**, as well as the domain list may be accessed from the Options Page.

<img width="298" alt="2" src="https://user-images.githubusercontent.com/54873610/148790378-31a501e2-3e63-4096-b74a-695b02405468.png">

### Scheme 3

This is our **Privacy Profile** scheme. Upon running the extension, users will be prompted to choose the privacy profile that they find most similar to themselves. Their privacy choices will then be personalized based on the selected profile. They may further personalize their privacy choices by accessing the domain list on the Options Page.

<img width="1261" alt="3" src="https://user-images.githubusercontent.com/54873610/148790400-24901af2-596c-439d-bcac-34318a3a685f.png">

### Scheme 4

This is our **Categories Questionnaire** scheme. Users are initially prompted to select the categories of tracking that they would like to "opt out" from. This personalizes their privacy choices, which again they may further alter by accessing the Options Page.

<img width="1135" alt="Screen Shot 2022-04-06 at 7 30 14 PM" src="https://user-images.githubusercontent.com/54873610/162093136-451a4898-a8f2-4c3e-8d37-a444a71b96f3.png">

### Scheme 5

A combination of **Scheme 1** and **Scheme 3**, this is our **Machine-Learning** scheme. The user is randomly presented 10 banners in total on websites they visit. Their choices are recorded by the extension, which it then uses to make an educated selection on which **Privacy Profile** would suit them most. No banners are shown beyond the initial 10, and after the learning period is over users may change their privacy profile by accessing the Options Page.

<img width="602" alt="Screen Shot 2022-01-10 at 10 17 03 AM" src="https://user-images.githubusercontent.com/54873610/148790447-63aa0939-309c-413d-af31-4599326a53a5.png">

### Scheme 6

This scheme is the most simple of all. Users are initially prompted as to whether they'd like to send **GPC Signals** to all websites they visit or not. They may change this preference from the Options Page, but no domain list is present, so they cannot personalize their choices.

<img width="1258" alt="Screen Shot 2022-01-10 at 10 17 39 AM" src="https://user-images.githubusercontent.com/54873610/148790468-28c41e3e-b9db-408e-a927-65a0c4955131.png">

## Data Collection

The GPC Privacy Choice browser extension records how users interact with different sites and make privacy choices. In the database, each user is represented by a unique ID, and all of their interactions are recorded under that ID. Below are some different categories of data that might be recorded. **DISCLAIMER: The GPC Privacy Choice browser extension records all of the different sites visited by users, as there could be possible relationships between the types of sites visited and the corresponding privacy choice made.**

### Browser History

This category records the information of each site the user is on while using the browser extension.

<img width="919" alt="Screen Shot 2021-10-26 at 10 44 25 AM" src="https://user-images.githubusercontent.com/54873610/138903258-935eec9d-7845-487f-ab0f-0e53410623c2.png">

#### Ad Interaction Detection

Certain behaviors will cause an event to be flagged as an ad interaction with varying degrees of confidence. The reason the event is being flagged and the corresponding confidence level will be recorded under "Evidence of Ad Interaction" in the document that contains the data on the interaction. This data includes the timing of the interaction, the source of the ad, and the domain that was initially navigated to after the ad interaction. Characteristics that cause an event to be flagged as an ad interaction are the following: if the event causes a new tab to open and if either the click that initialized the event occurred in a subframe or if the navigation involved the domain of a network identified in the disconnect list.

<img width="757" alt="Screen Shot 2022-01-10 at 10 20 23 AM" src="https://user-images.githubusercontent.com/77850710/148790993-f8db77c0-aa2e-40b6-9fca-50f0aa0aed76.png">

### Privacy Configuration Interaction History

This category records the privacy decisions users might make on schemes 3, 4, 5 and 6 from the user registration page. That is, more general privacy decisions based on groups or categorizations of tracking

<img width="920" alt="Screen Shot 2021-10-26 at 10 20 03 AM" src="https://user-images.githubusercontent.com/54873610/138898583-863899bf-367a-4312-812a-e5b56b561ec4.png">

### Domain Interaction History

This category records any privacy decisions made from the banner (schemes 0, 1 or 2), as well as changes made from the Options Page for any scheme. More specific privacy decisions are handled in this category, personalized choices for individual domains.

<img width="920" alt="Screen Shot 2021-10-26 at 10 17 39 AM" src="https://user-images.githubusercontent.com/54873610/138897990-302be371-ec1b-469c-a5f0-962955b4d035.png">

### Mute Interaction History

This category would be relevant for schemes where the mute button is present, that is, schemes 0 and 2. It simply records when users choose to utilize the mute button.

<img width="919" alt="Screen Shot 2021-10-26 at 10 44 25 AM" src="https://user-images.githubusercontent.com/54873610/138905999-26886431-c397-44e8-9250-c7038ca52920.png">

## Existing Issues For The Extension

Due to lack of control on the styling of injected HTML, the banner UI may vary on certain sites. The team has tried its best to ensure the UI consistency. Based on our testing during the development phase, the UI consistency is only not well maintained on a small set of sites, and the functionalies of the banner are not affected.

Because of the ambiguity of ad interactions, our method of recording them is not fool-proof. While a vast majority of ad interaction data is correct, the extension may incorrectly record or miss a user clicking on an ad.

## Future Directions

The team is currently working on the upgrade from [Manifest V2 to Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/). However, this process is restricted due to the face that service workers in [MV3 currently do not support Firebase Cloud Firestore](https://github.com/privacy-tech-lab/gpc-privacy-choice/issues/144). Moving into the future, we tentatively decide to switch into another database if the support for Cloud Firestore is still missing.

<p align="center">
  <a href="https://www.privacytechlab.org/"><img src="https://github.com/privacy-tech-lab/gpc-privacy-choice/src/img/plt_logo.png" width="200px" height="200px" alt="privacy-tech-lab logo"></a>
</p>
