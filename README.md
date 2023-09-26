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
  <a href="https://github.com/sponsors/privacy-tech-lab"><img alt="GitHub sponsors" src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86"></a>
</p>

<p align="center">
  <br><a href="hhttps://github.com/privacy-tech-lab/gpc-privacy-choice/"><img src="https://github.com/privacy-tech-lab/gpc-privacy-choice/blob/main/assets/icon_180_180.png" width="120px" height="120px" alt="Dolphin logo"></a>
</p>

# GPC Privacy Choice

GPC Privacy Choice is a Chromium browser extension for researching the usability of privacy choices, especially, opting out from web tracking with [Global Privacy Control (GPC)](https://globalprivacycontrol.org/). Our goal is to strike a balance between giving people sufficient options to make their privacy choices on one side and not overburdening them with too many or too complicated choices on the other. Enabling opting out by default for all websites proved to be a major roadblock for the adoption of [Do Not Track (DNT)](https://www.w3.org/TR/tracking-dnt/). We take the learnings from DNT to improve GPC.

Once installed, our GPC Privacy Choice Extension injects a privacy choice scheme, for example, a banner asking whether a user wants to enable GPC on the current website they visit. Data about the user's choices as well as details about the visited websites are then transmitted to a backend for analysis. The focus of this extension is on researching user interface design. However, the extension is fully functional and is sending header-based GPC signals. Thus, it serves as a working prototype for all privacy choice schemes we implement.

GPC Privacy Choice is developed and maintained by **Eliza Kuller (@ekuller)**, **Chunyue Ma (@chunyuema)**, **Isabella Tassone (@bella-tassone)**, **Joe Champeau (@JoeChampeau)**, and **Sebastian Zimmeck (@SebastianZimmeck)** of the [privacy-tech-lab](https://privacytechlab.org/). Kuba Alicki (@kalicki1), Daniel Knopf (@dknopf), and Abdallah Salia (@asalia-1) contributed earlier.

[1. Research Publications](#1-research-publications)  
[2. Privacy Choice Schemes](#2-privacy-choice-schemes)  
[3. Data Collection](#3-data-collection)  
[4. Developer's Guide to Implement GPC Privacy Choice](#4-developers-guide-to-implement-gpc-privacy-choice)  
[5. GPC Privacy Choice Architectural Overview](#5-gpc-privacy-choice-architectural-overview)  
[6. Files and Directories in this Repo](#6-files-and-directories-in-this-repo)  
[7. Third Party Libraries](#7-third-party-libraries)  
[8. Known Issues](#8-known-issues)  
[9. Thank You!](#9-thank-you)

## 1. Research Publications

- Sebastian Zimmeck, Oliver Wang, Kuba Alicki, Jocelyn Wang and Sophie Eng, [Usability and Enforceability of Global Privacy Control](https://sebastianzimmeck.de/zimmeckEtAlGPC2023.pdf), 23rd Privacy Enhancing Technologies Symposium (PETS)
  Lausanne, Switzerland and Online Event, July 2023
- Eliza Kuller, [Privacy Choice Mechanisms and Online Advertising: Can Generalizable Active Privacy Choices and Online Advertising Coexist?](https://doi.org/10.14418/wes01.1.2797), Undergraduate Honors Thesis, Wesleyan University, April 2023
- Isabella Tassone, Chunyue Ma, Eliza Kuller, Joe Champeau, Sebastian Zimmeck, [Enhancing Online Privacy: The Development of Practical Privacy Choice Mechanisms](https://github.com/privacy-tech-lab/gpc-privacy-choice/blob/main/research/tassoneEtAlEnhancingOnlinePrivacy2022Poster.pdf), Summer Research 2022 Poster Session, Wesleyan University, July 2022
- Sebastian Zimmeck, [Improving Internet Privacy with Global Privacy Control (GPC)](https://sebastianzimmeck.de/SaTC_PI_Meeting_2022_Poster_GPC_Zimmeck.pdf), 5th NSF Secure and Trustworthy Cyberspace Principal Investigator Meeting (2022 SaTC PI Meeting), Arlington, Virginia, USA, June 2022
- Eliza Kuller, Chunyue Ma, Isabella Tassone, Sebastian Zimmeck, [Making Online Privacy Choice Mechanisms Effective and Usable](http://summer21.research.wesleyan.edu/2021/07/22/balancing-usability-and-active-choice-while-developing-privacy-permission-schemes/), Summer Research 2021 Poster Session, Wesleyan University, Online, July 2021

## 2. Quick DEV Guide

In order to set up the environment for our artifact, you should have Git installed.

1. Clone this repo: `git clone https://github.com/privacy-tech-lab/gpc-privacy-choice.git`.

2. In the `src` folder, create a `config.js` file. If you not wish to set up a Firebase backend and only want to observe the frontend UI, you can copy the following information into the required config file and use the provided Prolific ID (5f473753tbf20b123d695213) and password (12345).

```javascript
export const PASSWORD = "12345";

export const firebaseConfig = {
  apiKey: "AIzaSyC08Bt3IUPn_6Sn469x-M1VwIb4KTXHYNo",
  authDomain: "gpc-example.firebaseapp.com",
  projectId: "gpc-example",
  storageBucket: "gpc-example.appspot.com",
  messagingSenderId: "403632222995",
  appId: "1:403632222995:web:6f72eb626ff4214ba060e6",
};
```

Alternatively, if you wish to set up your own Firebase backend, I recommend looking at our [Full Developer's Guide to Implement GPC Privacy Choice](https://github.com/privacy-tech-lab/gpc-privacy-choice#5-developers-guide-to-implement-gpc-privacy-choice) for more in-depth instructions.

3. To test the extension from a local repo, open the browser (Chrome, Brave, etc) and find the manage extension options from settings.
4. Turn on developer mode, and then click the `Load unpacked` button. Select the folder `gpc-privacy-choice/src` from your files.
5. The extension should now be loaded and you should see the registration page pop up on the browser. In order to access the extension, supply a string formatted as a valid Prolific ID (you may use 5f473753tbf20b123d695213 for testing purposes). You also need to supply the password you created above. The registration process should start.
6. You may switch between schemes by manually setting it in line 741 of the `background.js` file of the repository, where there is a list of what number corresponds to which scheme. See [Privacy Choice Schemes](https://github.com/privacy-tech-lab/gpc-privacy-choice#3-privacy-choice-schemes) for full descriptions of each scheme.

## 3. Privacy Choice Schemes

The GPC Privacy Choice extension includes nine schemes for enabling GPC signals on websites. Which scheme a user is assigned upon installation of the extension is intentionally set within the extension (see `background.js`).

Here are the main features of each scheme:

### SB-Base: GPC Privacy Choice Banner

SB-Base is the base scheme. Users are presented a **GPC Privacy Choice Banner** on each new site they visit. Users can select to which domains they want to send GPC signals via a domain list on the Options Page.

<p align="center">
  <img width="250" alt="Screen Shot 2022-12-19 at 11 57 06 AM" src="https://user-images.githubusercontent.com/54873610/208479232-0b2752b2-0bf2-4b3e-8ff1-319b4dd9ab65.png">
</p>

### S0-Snooze: GPC Privacy Choice Banner with Snooze Option

Users are presented a **GPC Privacy Choice Banner** on each new site they visit. There is a **Snooze** button that, upon being selected, will prevent the banner from popping up on new sites for a few hours. Users can select to which domains they want to send GPC signals via a domain list on the Options Page.

<p align="center">
  <img width="250" alt="Scheme 0 screenshot." src="https://user-images.githubusercontent.com/54873610/148790325-ef5ae195-e024-4177-9119-9f21865108df.png">
</p>

### S1-Apply-All: GPC Privacy Choice Banner with Apply-all Option

In S1-Apply-All the **GPC Privacy Choice Banner** is presented on every new site, however, with an **Apply-all** option but no **Snooze** button. Users can select to which domains they want to send GPC signals via a domain list on the Options Page.

<p align="center">
  <img width="250" alt="Scheme 1 screenshot." src="https://user-images.githubusercontent.com/54873610/148790364-f41b418d-a6ec-41f4-bc79-78647f2e4096.png">
</p>

### S2-Snooze+Apply-All: GPC Privacy Choice Banner with Snooze and Apply-all Option

S2-Snooze+Apply-All is a combination of schemes 0 and 1. The **GPC Privacy Choice Banner** contains both the **Apply-all** option as well as the **Snooze** button. Users can select to which domains they want to send GPC signals via a domain list on the Options Page.

<p align="center">
  <img width="250" alt="Scheme 2 screenshot." src="https://user-images.githubusercontent.com/54873610/148790378-31a501e2-3e63-4096-b74a-695b02405468.png">
</p>

### S3-Profile: Privacy Profiles

S3-Profile makes use of **Privacy Profiles**. Upon running the extension for the first time, users are prompted to choose a privacy profile. Their choice will then determine which sites will receive GPC signals. We use the [disconnect-tracking-protection list](https://github.com/disconnectme/disconnect-tracking-protection) to identify sites that should receive signals under a certain Privacy Profile. Users can select to which domains they want to send GPC signals via a domain list on the Options Page. The GPC values for domains on the domain list depend on in which category, if any, the domain is included in the disconnect-tracking-protection list as well as the choices a user makes on the domain list.

<p align="center">
  <img width="800" alt="Scheme 3 screenshot." src="https://user-images.githubusercontent.com/54873610/148790400-24901af2-596c-439d-bcac-34318a3a685f.png">
</p>

### S4-Website: Website Categories

S4-Website makes use of **Website Categories**. Upon running the extension for the first time, users are prompted to select the categories that they would like to opt out from. We use the disconnect-tracking-protection list to identify sites that should receive signals under a certain Website Category. Users can select to which domains they want to send GPC signals via a domain list on the Options Page. The GPC values for domains on the domain list depend on in which category, if any, the domain is included in the disconnect-tracking-protection list as well as the choices a user makes on the domain list.

<p align="center">
  <img width="800" alt="Scheme 4 screenshot." src="https://user-images.githubusercontent.com/54873610/162093136-451a4898-a8f2-4c3e-8d37-a444a71b96f3.png">
</p>

### S5-Learn: Learning Privacy Profiles

S5-Learn is a combination of schemes 1 and 3 and makes use of a simple technique to **Learn Privacy Profiles**. The user is presented with **GPC Privacy Choice Banners** on the first 10 websites they visit. Their choices are recorded and then used to select a **Privacy Profile** that suits the user best. No **GPC Privacy Choice Banners** are shown beyond the initial 10. Users that choose to enable GPC signals on 8 or more of the first 10 websites will be assigned a **High-Sensitivity Privacy Profile**. 4-7 enables (inclusive) will yield a **Medium-Sensitivity Privacy Profile** and 3 or fewer will give users a **Low-Sensitivity Privacy Profile**. Users can select to which domains they want to send GPC signals via a domain list on the Options Page. After the learning period is over a user may change their privacy profile on the Options Page.

<p align="center">
  <img width="400" alt="Scheme 5 screenshot." src="https://user-images.githubusercontent.com/54873610/148790447-63aa0939-309c-413d-af31-4599326a53a5.png">
</p>

### S6-Universal: Enabling/Disabling GPC for All Sites

S6-Universal is the simplest of all schemes. Upon running the extension for the first time, users are prompted as to whether they would like to send GPC signals to all websites they visit or not. They may change this preference on the Options Page. Users can select to which domains they want to send GPC signals via a domain list on the Options Page.

<p align="center">
  <img width="800" alt="Scheme 6 screenshot." src="https://user-images.githubusercontent.com/54873610/148790468-28c41e3e-b9db-408e-a927-65a0c4955131.png">
</p>

### S7-Data: Data Categories

S7-Data makes use of **Data Categories**. Upon running the extension for the first time, users are prompted to select the types of data that they would **not** like to be shared with or sold to advertisers. Users should not rely on being opted out with S7-Data, as our extension is not a full implementation of the described functionality. Users can adjust their categories on the Options Page. In S7-Data users are **not** able to select individual domains to which they want to send GPC signals.

<p align="center">
  <img width="800" alt="Screen Shot 2022-07-06 at 11 32 54 AM" src="https://user-images.githubusercontent.com/54873610/177589363-70910692-d1ac-49dc-b76f-f4b2abdb2450.png">
</p>

### How To Create Additional Schemes

Although – to some extent – it depends on what you want, there are certain generalities when it comes to developing schemes. These are listed below.

- You'll need a registration page. You can either make use `registration.js` and `registration.html`, which are used for the banner schemes, or you'll have to create your own files, which are necessary for category schemes. See `questionnaire.js` and `questionnaire.html` for examples.
- You'll have to create a corresponding **Options Page**. For this, you would be working in `domainlist-ui.js`.
- In order to set the browser extension to your scheme, you'll need to link it to a scheme **number** in `background.js`.
- You will also need to create a collection for your scheme in firebase. You can do this by working in `background.js` to change the collection name, and then developing your firebase security rules to accept that collection name.

## 4. Data Collection

**NOTE: Please make sure that you have your users' consent to collect their data. If you are at a university, you may need IRB approval or a determination that your research is exempt.**

The GPC Privacy Choice browser extension records how users interact with the sites they visit and which privacy choices they make in a Firestore database. In the database each user is represented by a unique ID (e.g., `uDMVrtzy7lxf1sQqsmd8`) and all their interactions are recorded under that ID. In addition, each user is requested to enter their unique [Prolific](https://www.prolific.co/) ID upon installing the extension. The Prolific ID allows us to correlate the collected data with data from surveys about the use of our extension, which we administer via Prolific.

The browser extension collects the following data types from users, but data is never disclosed to any third-party. We never disclose any identifiable information.

Below is the list of data types that the browser extension generally collects from users of the GPC Privacy Choice Extension:

#### General:

- Prolific ID
- Browser (e.g. Google Chrome)
- Whether you have HTTP cookies enabled (true or false)
- Whether you have Do Not Track enabled (true or false)
- Whether you have JavaScript enabled (true of false)
- Operating system language (e.g. en-US)
- Geographic location (e.g., your latitude/longitude coordinates)
- Whether you have Local Storage enabled in your browser (true or false)
- Operating system (e.g. Mac/iOS)
- Browser plugins (e.g. Chrome PDF Plugin)
- Browser's rendering engine (e.g., WebKit)
- Whether you have Session Storage enabled (true or false)
- Time zone
- UI scheme of your browser
- User agent of your browser

#### Browser history and Interaction with our extensions:

- The website URLs you visit (e.g. https://www.cnbc.com/finance/)
- A timestamp when you visited a website
- The GPC status you selected for the current website you are on (true or false)
- Whether you have GPC globally enabled for all websites you visit
- Referer (i.e., the previous website you visited before coming to the current site)
- The TabIDs of the different tabs in your browser
- Whether you click on an ad on a website
- The website URL that your browser goes to when you click on an ad
- The website URLs of the ad networks integrated in the sites you visit

Here is how we categorize the data that the extension collects:

### Browser History

Browser History covers site-specific information that is collected for every site while a user is using the extension.

<p align="center">
  <img width="600" alt="Browser History screenshot." src="https://user-images.githubusercontent.com/54873610/169369971-d1a1a062-afc6-4822-9a73-dfeb8a27aeff.png">
</p>

### Ad Interactions

Ad Interactions cover a users interaction with an ad, specifically, the timing of the interaction, the source of the ad, and the domain that was initially navigated to after the Ad Interaction. Characteristics that cause an event to be flagged as an Ad Interaction are the following: if the event causes a new tab to open and if either the click that initialized the event occurred in a subframe or if the navigation involved the domain of a network identified in the disconnect-tracking-protection list, which we use to identify different types of websites. As it cannot be determined with certainty that such interaction is, in fact, an Ad Interaction, the reason that the interaction is recorded is noted.

<p align="center">
  <img width="600" alt="Ad Interactions screenshot." src="https://user-images.githubusercontent.com/77850710/170414471-bc3ba86c-7260-4a22-a77a-c68d0260e0f4.png">

</p>

### Third Party Requests

Data on third party requests are stored in two collections: Third Party Requests (first 50) and Third Party Requests Summary. Instances of both collections are found under the Browser History documents that correspond to the website on which the documented requests occur.

Third Party Requests (first 50) documents hold specific data for the first 50 third party requests that occur upon visiting a site. This data includes the url that the request is sent from, the url's domain and network, any categories that the domain is listed under in the Disconnect List, the timestamp of the request, the request type, and the site to which the request is sent.

<p align="center">
<img width="600" alt="Screen Shot 2022-06-06 at 8 20 00 AM" src="https://user-images.githubusercontent.com/77850710/172389623-1e2d5876-7679-4881-9c73-8e91c794e076.png">
</p>

Third Party Requests Summary documents record how many requests are sent by each third party domain that sends requests during a visit to a certain site. This data is recorded in firebase once a user navigates away from a site or closes the tab on which the site was visited.

<p align="center">
<img width="600" alt="Screen Shot 2022-06-06 at 8 19 49 AM" src="https://user-images.githubusercontent.com/77850710/172389643-c890144f-63e6-478f-adb0-214dab59a3bf.png">
</p>

### Privacy Configuration Interaction History

The Privacy Configuration Interaction History covers the privacy choices users make for schemes 3, 4, 5, 6 and 7. It covers the initial choice upon registration as well as later modifications, e.g., the initial **Privacy Profile** choice and its later modification for scheme 3.

<p align="center">
  <img width="600" alt="Privacy Configuration Interaction History screenshot." src="https://user-images.githubusercontent.com/54873610/169371284-e4c6064c-c829-43bb-89cb-b171a3cb2f12.png">
</p>

### Domain Interaction History

Domain Interaction History covers any privacy choices made via the **GPC Privacy Choice Banner** on schemes 0, 1 or 2. It also covers changes made on the Options Page for all schemes that include it.

<p align="center">
  <img width="600" alt="Domain Interaction History screenshot." src="https://user-images.githubusercontent.com/54873610/169371517-21bac9bb-1566-4259-b119-ea738e25c900.png">
</p>

### Mute Interaction History

The Mute Interaction History covers schemes where the **Snooze** button is present, that is, schemes 0 and 2. It records when users choose to use the **Snooze** button.

<p align="center">
  <img width="600" alt="Mute Interaction History screenshot." src="https://user-images.githubusercontent.com/54873610/169371757-e957143b-e7a2-4973-9bf4-e11c87e825d7.png">
</p>

## 5. Full Developer's Guide to Implement GPC Privacy Choice

**NOTE: In order to create a Firebase project, you need 'Cloud Resource Manager project creation' to be enabled. This may be disabled if you are using an institutional account.**

Follow the instructions to implement the GPC Privacy Choice browser extension for your own projects.

1. Clone this repo: `git clone https://github.com/privacy-tech-lab/gpc-privacy-choice.git`.
2. Create a Firebase Cloud Firestore project. [Here](https://firebase.google.com/docs/firestore/quickstart) are detailed instructions on how to set up a Firebase server for data collection. Before proceeding, make sure that you have created a Firebase account, a Cloud Firestore database and a web app within the database, and selected **Test Mode** as the starting mode for your Cloud Firestore Security Rules. Do not worry about installing the SDK; we have already added the required dependencies, client libraries, and initialized an instance of Cloud Firestore.
3. In the `src` folder, create a `config.js` file and add in the following code. Be sure to update the fields based on the Firebase Cloud Firestore project you have set up. The information should be in **Project Settings**, under the **General** tab. Make sure you have your web app selected, then switch the **SDK setup and configuration** from `npm` to `config` to see all the necessary information. You can pick any password you like. Upon installing the extension users will be asked for the password. If users do not enter a password or enter a wrong password, no data will be collected on Firebase. If you are running a study with multiple schemes one after another, it is recommended to change the password between schemes. Otherwise, data from study participants running a previous scheme may continue to be collected inadvertently.

   ```javascript
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

4. To test the extension from a local repo, open the browser (Chrome, Brave, etc) and find the manage extension options from settings. In Google Chrome, this can be done by clicking on the puzzle icon on the top right corner and then clicking `Manage Extensions`.
5. Turn on developer mode, and then click the `Load unpacked` button. Select the folder `gpc-privacy-choice/src` from your files.
6. The extension should now be loaded and you should see the registration page popping up on the browser. In order to access the extension and start writing to your database, supply a string formatted as a valid Prolific ID (you may use 5f473753tbf20b123d695213 for testing purposes). You also need to supply the password you created above. The registration process should start.
7. Reviewer may switch between schemes by manually setting it in line 741 of the `background.js` file of the repository, where there is a list of what number corresponds to which scheme.
8. The best way to deploy GPC Privacy Choice, for example, to participants in a research study, is via the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions).

## 6. GPC Privacy Choice Architectural Overview

The extension makes use of [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/).

<p align="center">
  <img src="./src/img/gpc-choice-architecture.png" width="800" alt="GPC Privacy Choice Architecture"></a>
<p>

## 7. Files and Directories in this Repo

Here are the most important files and directories:

- `assets`: Image assets that can be used on the Chrome Web Store listing for the extension.
- `scripts/writerules.py`: This script is used to render the rulesets for appropriately attaching the GPC signal by privacy sensitivity (scheme 3) and third party category (scheme 4). It generates the files in `src/rulesets` and is not run in the browser or on the backend.
- `src/firebase`: Contains all the Firebase related configurations/scripts
  - `src/firebase/firebase.json`: The Firebase (Firestore) configuration file.
  - `src/firebase/firestore.json.indexes`: Contains the indexes used by the extension to sort and filter the Firestore database.
  - Background scripts for connecting to the Firestore database and adding data to it.
    - `src/firebase/firebase-app.js`
    - `src/firebase/firebase-auth.js`
    - `src/firebase/firebase-firestore.js`
  - `src/firebase/firestore.rules`: This file contains the rules for reading and writing to the Firestore database.
- `src/img`: Contains all image resources.
- `src/json`:
  - `src/json/headers.json`: Contains the JSON configuration files for the extensions Do Not Sell and Do Not Track headers.
  - `src/json/services.json`: Contains the third party services and their categories used in some of the schemes.
- `src/libs-css`: Contains all CSS libraries used in the browser extension.
- `src/libs-js`: Contains all JS libraries used in the browser extension.
- `src/options`: Contains the UI elements and scripts for the supplemental Options Page.
- `src/registration`: Contains all user registration scripts relevant for performing the research.
  - HTML files for different user schemes:
    - `src/registration/oneQuestion.html`
    - `src/registration/profile.html`
    - `src/registration/questionnaire.html`
    - `src/registration/registration.html`
  - JavaScript files for registering users:
    - `src/registration/profile.js`
    - `src/registration/questionnaire.js`
    - `src/registration/registration.js`
- `src/rulesets`: This file contains the rule sets for different categories of sites (e.g., advertising or analytics).
- `src/background.js`: This is the main service worker running the extension. It controls all of the major backend regarding whether the extension is on/off, sending Do Not Sell signals, etc.
- `src/contentScript.js`: This is the main supplemental script that passes data to `background.js` and runs on every webpage loaded.
- `src/editRules.js`: Takes care of any changes to the rule sets that are responsible for adding GPC to domain requests.
- `src/manifest.json`: Provides the browser with metadata about the extension regarding its name, permissions, etc.
- `src/updateSignal.js`: Updates the status of whether a GPC signal is sent or not on any given site.
- `src/util.js`: Provides utility functions for `background.js`.

## 8. Third Party Libraries

The GPC Privacy Choice extension uses the following third party libraries. We thank the developers.

- [animate.css](https://github.com/animate-css/animate.css)
- [mustache.js](https://github.com/janl/mustache.js)
- [uikit](https://github.com/uikit/uikit)
- [disconnect-tracking-protection](https://github.com/disconnectme/disconnect-tracking-protection)
- [Google Firebase](https://firebase.google.com/docs/web/setup)

The Dolphin logo is used under the CC-BY 4.0 license copyright Twitter, Inc.

## 9. Known Issues

- **Only header-based GPC signals**: Our extension is sending [header-based GPC signals](https://globalprivacycontrol.github.io/gpc-spec/#the-sec-gpc-header-field-for-http-requests). However, we [did not implement DOM-based GPC signals](https://globalprivacycontrol.github.io/gpc-spec/#javascript-property-to-detect-preference).
- **The GPC choice banner UI may not display well on certain sites**: Due to lack of control on the styling of injected HTML, the banner UI may vary on certain sites. We have tried our best to ensure UI consistency. Based on our testing during the development phase, the UI consistency is only not well maintained on a small set of sites, and the functionalities of the banner are not affected.
- **In rare instances the extension may unexpectedly stop working**: During our study we had rare incidents where users reported to us that the extension stopped working and we were no longer receiving data at the Firebase backend. We investigated this issue, however, could not replicate the behavior. It [may be related to service workers in Manifest V3](https://github.com/privacy-tech-lab/gpc-privacy-choice/issues/205#issuecomment-1131723290) or that a browser update or other software interaction causes the breakage.
- **Incorrect recording or missing of a user clicking on an ad**: Because of the ambiguity of Ad Interactions, our method of recording them is not fool-proof. While a vast majority of Ad Interaction data is correct, the extension may in individual cases incorrectly record or miss a user clicking on an ad. Ad Interaction is also based on a heuristic, especially, a click event occurring in a subframe, that may not always correctly identify an ad.
- **Random assignment of schemes seems to perform poorly**: The library for randomly assigning each user a scheme seems to perform poorly. To get a uniform distribution of schemes among users, it may be necessary to hardcode the scheme number and sign up the desired number of users for that scheme. This process can then be repeated for each scheme. In that case the Firebase password in the `config.js` should be changed for each new scheme. Otherwise, users from a previous scheme may keep writing to Firebase as the Google Chrome Web Store pushes the updated extension with the new scheme to all current users.
- **GPC Current Site Status**, i.e., whether GPC is enabled on a site or not does show a result on Firebase when the site is visited the first time. It shows "N/A." The reason is that at the moment the site is visited the first time, the user has not yet made a GPC choice. The GPC Current Site Status corresponds to the GPC status in the domain list.
- **The domain list on Firebase updates on leaving a site**: So, when a user visits site A and then site B, site A will show up in the domain list at the time the user opens site B.
- **In rare instances browser updates may require re-registration**: For already registered users, upon browser updates, the extension may display the user registration page again. No data may be collected on Firebase until the user re-registers. If the user re-registers, a second Firebase ID will be created and data will be collected from that moment on under that Firebase ID. Data for the same user under different Firebase IDs can be combined in the post-processing stages.
- **Scheme 7 does not send GPC Signals.** It is a front-end implementation only.

## 10. Thank You!

<p align="center"><strong>We would like to thank our financial supporters!</strong></p><br>

<p align="center">Major financial support provided by the Alfred P. Sloan Foundation.</p>

<p align="center">
  <a href="https://sloan.org/grant-detail/9631">
    <img class="img-fluid" src="./src/img/sloan_logo.jpg" height="100px" alt="Sloan Foundation Logo">
  </a>
</p>

<p align="center">Additional financial support provided by the National Science Foundation, Wesleyan University, and the Anil Fernando Endowment.</p>

<p align="center">
  <a href="https://nsf.gov/awardsearch/showAward?AWD_ID=2055196">
    <img class="img-fluid" src="./src/img/nsf.png" height="70px" alt="National Science Foundation Logo">
  </a>
  <a href="https://www.wesleyan.edu/mathcs/cs/index.html">
    <img class="img-fluid" src="./src/img/wesleyan_shield.png" height="70px" alt="Wesleyan University Logo">
  </a>
</p>

<p align="center">Conclusions reached or positions taken are our own and not necessarily those of our financial supporters, its trustees, officers, or staff.</p>

##

<p align="center">
  <a href="https://privacytechlab.org/"><img src="./src/img/plt_logo.png" width="200px" height="200px" alt="privacy-tech-lab logo"></a>
</p>
