/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/

This file contains functions which are used to create the HTML for building the domain pages
*/

// Create HTML for buttons to manage entire domainlist at once
export function createDomainlistManagerButtons() {
	let toggle_domainlist_on = ` <button
          id="toggle_all_on"
          class="uk-badge button blue-buttons"
          type="button"
          uk-tooltip="applies only to domains below">
         Enable GPC for All
        </button>
      `;
	let toggle_domainlist_off = ` <button
          id="toggle_all_off"
          class="uk-badge blue-buttons button"
          uk-tooltip="applies only to domains below"
          type="button">
          Disable GPC for All
        </button>
      `;
	let manager_btns = `
      ${toggle_domainlist_on}
      ${toggle_domainlist_off}
      <hr>
    `;

	document.getElementById("domainlist-manager-btns").innerHTML = manager_btns;
	chrome.storage.local.get(["UI_SCHEME"], function (result) {
		if (
			result.UI_SCHEME == 3 ||
			result.UI_SCHEME == 4 ||
			result.UI_SCHEME == 5 ||
      result.UI_SCHEME == 6
		)
			document
				.getElementById("domainlist-manager-btns")
				.classList.add("hide");
		if (result.UI_SCHEME == 0) {
			document.getElementById("toggle_all_on").classList.add("hide");
			document.getElementById("toggle_all_off").classList.add("hide");
			document.getElementById("apply_to_all_label").classList.add("hide");
		}
	});
}

// Handles the initialization of card selections/changing of card selections
export function cardInteractionSettings(scheme, userChoice) {
	if (scheme == 3) {
		if (userChoice == "High Privacy-Sensitivity") {
			document
				.getElementById("high-privacy-sensitivity-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("high-privacy-sensitivity-card")
				.classList.remove("uk-card-primary");
		if (userChoice == "Medium Privacy-Sensitivity") {
			document
				.getElementById("medium-privacy-sensitivity-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("medium-privacy-sensitivity-card")
				.classList.remove("uk-card-primary");
		if (userChoice == "Low Privacy-Sensitivity") {
			document
				.getElementById("low-privacy-sensitivity-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("low-privacy-sensitivity-card")
				.classList.remove("uk-card-primary");
	} else if (scheme == 4) {
		if (userChoice["Advertising"]) {
			document
				.getElementById("advertising-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("advertising-card")
				.classList.remove("uk-card-primary");
		if (userChoice["Analytics"]) {
			document
				.getElementById("analytics-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("analytics-card")
				.classList.remove("uk-card-primary");
		if (userChoice["Fingerprinting"]) {
			document
				.getElementById("fingerprinting-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("fingerprinting-card")
				.classList.remove("uk-card-primary");
		if (userChoice["Content & Social"]) {
			document
				.getElementById("social-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("social-card")
				.classList.remove("uk-card-primary");
		if (userChoice["Cryptomining"]) {
			document
				.getElementById("cryptomining-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("cryptomining-card")
				.classList.remove("uk-card-primary");
		if (userChoice["All Sites"]) {
			document
				.getElementById("others-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("others-card")
				.classList.remove("uk-card-primary");
	} else if (scheme == 6) {
		if (userChoice == "Enable GPC") {
			document
				.getElementById("privacy-on-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("privacy-on-card")
				.classList.remove("uk-card-primary");
		if (userChoice == "Disable GPC") {
			document
				.getElementById("privacy-off-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("privacy-off-card")
				.classList.remove("uk-card-primary");
	} else if (scheme == 7) {
		if (userChoice["Phone Number"]) {
			document
				.getElementById("phone-number-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("phone-number-card")
				.classList.remove("uk-card-primary");
		if (userChoice["Email Address"]) {
			document
				.getElementById("email-address-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("email-address-card")
				.classList.remove("uk-card-primary");
		if (userChoice["GPS Location"]) {
			document
				.getElementById("gps-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("gps-card")
				.classList.remove("uk-card-primary");
		if (userChoice["Zip Code"]) {
			document
				.getElementById("zip-code-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("zip-code-card")
				.classList.remove("uk-card-primary");
		if (userChoice["Browsing History"]) {
			document
				.getElementById("browsing-history-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("browsing-history-card")
				.classList.remove("uk-card-primary");
		if (userChoice["Age"]) {
			document
				.getElementById("age-card")
				.classList.add("uk-card-primary");
		} else
			document
				.getElementById("age-card")
				.classList.remove("uk-card-primary");
    if (userChoice["Ethnicity/Race"]) {
      document
        .getElementById("ethnicity-card")
        .classList.add("uk-card-primary");
    } else
      document
        .getElementById("ethnicity-card")
        .classList.remove("uk-card-primary");
    if (userChoice["Income"]) {
      document
        .getElementById("income-card")
        .classList.add("uk-card-primary");
    } else
      document
        .getElementById("income-card")
        .classList.remove("uk-card-primary");
    if (userChoice["Gender"]) {
      document
        .getElementById("gender-card")
        .classList.add("uk-card-primary");
    } else
      document
        .getElementById("gender-card")
        .classList.remove("uk-card-primary");
  }
}

// Create HTML for the buttons and information on default/apply-all setting
export function createDefaultSettingInfo() {
	chrome.storage.local.get(
		["APPLY_ALL", "ENABLED", "UI_SCHEME", "USER_CHOICES"],
		function (result) {
			let apply_all_bool = result.APPLY_ALL;
			let apply_all_switch =
				` <div uk-grid class="uk-grid-small uk-width-1-1" style="font-size: medium;">
          <div>
            <label class="switch">
              ` +
				buildToggle("apply-all-switch", !apply_all_bool) +
				`
              <span></span>
            </label>
          </div>
          <div class="domain uk-width-expand">
            Show the GPC Banner for Future Websites You Visit
          </div>
        </div>
        <br>
              `;
			let defaultSettingInfo;
			if (result.UI_SCHEME == 1 || result.UI_SCHEME == 2) {
				if (apply_all_bool) {
					if (result.ENABLED) {
						defaultSettingInfo = `
            ${apply_all_switch}
            <div class="important-text">
            You have enabled GPC.
            </div>
            Below you can change your GPC setting for an individual site. 
            `;
					} else {
						defaultSettingInfo = `
            ${apply_all_switch}
            <div class="important-text"> You have disabled GPC.
            </div>
            Below you can change your GPC setting for an individual site. 
            `;
					}
				} else {
					defaultSettingInfo = `
          ${apply_all_switch}
          <div class="important-text"> Below you can change your GPC setting for an individual site.
          </div>
          `;
				}
			} else if (result.UI_SCHEME == 4) {
				defaultSettingInfo = `
        <p class="uk-h5 uk-text-bold uk-text-italic">
        The law gives you a privacy right:
        </p>
        <p class="uk-h5 uk-text">
            Select one or more categories to specify which websites should be prohibited from selling/sharing your data. Hover over the cards to learn more.
        </p>
        <div class="uk-child-width-1-3@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
            <div class="choice" style="cursor: pointer;">
                <div id="advertising-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
                uk-tooltip="title:Many sites integrate third party ad networks that sell/share your data for advertising purposes.; pos: top-right">
                    <a class="uk-position-cover first" href="#" id="Advertising"></a>
                    <h3 class="uk-card-title uk-margin">Advertising</h3>
                </div>
            </div>
            <div class="choice" style="cursor: pointer;">
                <div id="analytics-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
                uk-tooltip="title:Many sites integrate third party services that will keep track of site metrics, for example, your geographical location or IP address.; pos: top-right">
                    <a class="uk-position-cover first" href="#" id="Analytics"></a>
                    <h3 class="uk-card-title uk-margin">Analytics</h3>
                </div>
            </div>
            <div class="choice" style="cursor: pointer;">
              <div id="social-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
              uk-tooltip="title:Many sites integrate content delivery networks to serve images, videos, and other content files. They may also show you content from social networks and sell your data to those or share it with them.; pos: top-right">
                  <a class="uk-position-cover first" href="#" id="Content & Social"></a>
                  <h3 class="uk-card-title uk-margin">Content & Social</h3>
              </div>
            </div>  
        </div>
        <div class="uk-child-width-1-3@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
            <div class="choice" style="cursor: pointer;">
                <div id="cryptomining-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
                uk-tooltip="title:Some sites integrate malicious services that will use your computer to mine for cryptocurrencies.; pos: top-right">
                    <a class="uk-position-cover first" href="#" id="Cryptomining"></a>
                    <h3 class="uk-card-title uk-margin">Cryptomining</h3>
                </div>
            </div>
            <div class="choice" style="cursor: pointer;">
                <div id="fingerprinting-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
                uk-tooltip="title:Some sites integrate browser fingerprinting, which is a technique that is usually used for advertising and that identifies you based on the characteristics of your browser, e.g., your browser version or the plugins you use.; pos: top-right">
                    <a class="uk-position-cover first" href="#" id="Fingerprinting"></a>
                    <h3 class="uk-card-title uk-margin">Browser Fingerprinting</h3>
                </div>
            </div>
            <div class="choice" style="cursor: pointer;">
                <div id="others-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
                uk-tooltip="title:By selecting this card, GPC signals will be sent to all sites you visit, disregarding any of the other cards you may have or have not selected.; pos: top-right">
                    <a class="uk-position-cover first" href="#" id="All Sites"></a>
                    <h3 class="uk-card-title uk-margin">All Sites</h3>
                </div>
            </div>   
        </div>
        `;
			} else if (result.UI_SCHEME == 3) {
				defaultSettingInfo = `
        <div class="uk-container main">
          <p class="uk-h5 uk-text-bold uk-text-italic">
          The law gives you a privacy right: 
          </p>
          <p class="uk-h5 uk-text">
            Select a profile to specify which websites should be prohibited from selling/sharing your data. 
            Hover over the cards to learn more.
          </p>
          <div class="uk-child-width-1-3@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
              <div class="choice" style="cursor: pointer;">
                  <div id='high-privacy-sensitivity-card' class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary" 
                  uk-tooltip="title: GPC will be enabled for all sites you visit.; pos: top-right">
                      <a class="uk-position-cover first" href="#" id="high-privacy-sensitivity" ></a>
                      <h3 class="uk-card-title uk-margin">High Privacy-Sensitivity</h3>
                      <p><b>Prohibit all sites</b> from selling/sharing your data</p>
                  </div>
              </div>
              <div class="choice" style="cursor: pointer;">
                  <div id='medium-privacy-sensitivity-card' class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
                  uk-tooltip="title: GPC will be enabled on many sites you visit, i.e., those with browser fingerprinting, cryptomining, advertising, and analytics.; pos: top-right">
                      <a class="uk-position-cover second" href="#" id="medium-privacy-sensitivity" ></a>
                      <h3 class="uk-card-title uk-margin">Medium Privacy-Sensitivity</h3>
                      <p><b>Prohibit ad sites and malicious sites</b> from selling/sharing your data
                      </p>
                  </div>
              </div>
              <div class="choice" style="cursor: pointer;">
                  <div id="low-privacy-sensitivity-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
                  uk-tooltip="title: GPC will only be enabled on sites that support malicious practices, i.e., those with browser fingerprinting and cryptomining.; pos: top-right">
                      <a class="uk-position-cover third" href="#" id="low-privacy-sensitivity" ></a>
                      <h3 class="uk-card-title uk-margin">Low Privacy-Sensitivity</h3>
                      <p><b>Prohibit only malicious sites </b>from selling/sharing your data</p>
                  </div>
              </div>
          </div>
        </div>
        <hr>
        `;
			} else if (result.UI_SCHEME == 5) {
				defaultSettingInfo = `
        <div class="uk-container main">
          <div class="uk-alert-success" uk-alert>
            <a class="uk-alert-close" uk-close></a>
            <p>
            You will see GPC banners pop up on the first 10 sites you visit. 
            Based on your choices, the extension will learn your privacy preferences. 
            You will no longer need to make choices after the learning phase is completed. 
            The learning phase is currently in progress.
            </p>
          </div>
        </div>
        <hr>
        `;
			} else if (result.UI_SCHEME == 0) {
				defaultSettingInfo = `
        <div class="important-text"> Below you can change your GPC setting for an individual site.
        </div>
        `;
			} else if (result.UI_SCHEME == 6) {
				defaultSettingInfo = `
        <p class="uk-h5 uk-text-bold uk-text-italic">The law gives you a privacy right:</p>
        <p class="uk-h5 uk-text">Enable GPC to <b>prohibit</b> this website from selling/sharing your data.</p>
        <p class="uk-h5 uk-text">Disable GPC to <b>permit</b> this website to sell/share your data.</p>
        <div class="uk-child-width-1-2@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
          <div class="choice" style="cursor: pointer;">
              <div id='privacy-on-card' class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary" 
              uk-tooltip="title: GPC signals will be sent to all visited websites.; pos: top-right">
                  <a class="uk-position-cover first" href="#" id='privacy-on'></a>
                  <h3 class="uk-card-title uk-margin">Enable GPC</h3>
                  <p>Do not track me on any website.</p>
              </div>
          </div>
          <div class="choice" style="cursor: pointer;">
              <div id='privacy-off-card' class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
              uk-tooltip="title: GPC signals will be sent to most websites that participate in tracking. Different types of tracking covered include fingerprinting, cryptomining, analytics and advertising.; pos: top-right">
                  <a class="uk-position-cover second" href="#" id='privacy-off'></a>
                  <h3 class="uk-card-title uk-margin">Disable GPC</h3>
                  <p>Feel free to track me for ad purposes.</p>
              </div>
          </div>
        </div>
        <hr>
        `;
			} else if (result.UI_SCHEME == 7) {
				defaultSettingInfo = `
        <p class="uk-h5 uk-text-bold uk-text-italic">The law gives you a privacy right:</p>
				<p class="uk-h5 uk-text">
          Select one or more categories to specify what types of data sites should be prohibited from selling/sharing. If you are okay with all types of data being sold/shared, simply hit <strong>submit</strong>.
          <i>Please note that our extension is not a full implementation of the described functionality and should not be relied upon for opting out.</i></p>
				<div class="uk-child-width-1-3@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
					<div class="choice" style="cursor: pointer">
						<div id="phone-number-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary">
							<a class="uk-position-cover first" href="#" id="Phone Number"></a>
							<h3 class="uk-card-title uk-margin">Phone Number</h3>
						</div>
					</div>
					<div class="choice" style="cursor: pointer">
						<div id="email-address-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary">
							<a class="uk-position-cover first" href="#" id="Email Address"></a>
							<h3 class="uk-card-title uk-margin">Email Address</h3>
						</div>
					</div>
					<div class="choice" style="cursor: pointer">
						<div id="gps-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary">
							<a class="uk-position-cover first" href="#" id="GPS Location"></a>
							<h3 class="uk-card-title uk-margin">GPS Location</h3>
						</div>
					</div>
				</div>
				<div class="uk-child-width-1-3@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
					<div class="choice" style="cursor: pointer">
						<div id="zip-code-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary">
							<a class="uk-position-cover first" href="#" id="Zip Code"></a>
							<h3 class="uk-card-title uk-margin">Zip Code</h3>
						</div>
					</div>
					<div class="choice" style="cursor: pointer">
						<div id="browsing-history-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary">
							<a class="uk-position-cover first" href="#" id="Browsing History"></a>
							<h3 class="uk-card-title uk-margin">Browsing History</h3>
						</div>
					</div>
					<div class="choice" style="cursor: pointer">
						<div id="age-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary">
							<a class="uk-position-cover first" href="#" id="Age"></a>
							<h3 class="uk-card-title uk-margin">Age</h3>
						</div>
					</div>
				</div>
				<div class="uk-child-width-1-3@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
					<div class="choice" style="cursor: pointer">
						<div id="ethnicity-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary">
							<a class="uk-position-cover first" href="#" id="Ethnicity/Race"></a>
							<h3 class="uk-card-title uk-margin">Ethnicity/Race</h3>
						</div>
					</div>
					<div class="choice" style="cursor: pointer">
						<div id="income-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary">
							<a class="uk-position-cover first" href="#" id="Income"></a>
							<h3 class="uk-card-title uk-margin">Income</h3>
						</div>
					</div>
					<div class="choice" style="cursor: pointer">
						<div id="gender-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary">
							<a class="uk-position-cover first" href="#" id="Gender"></a>
							<h3 class="uk-card-title uk-margin">Gender</h3>
						</div>
					</div>
				</div>
        `;
			}
			document.getElementById("current-apply-all-setting").innerHTML =
				defaultSettingInfo;
			cardInteractionSettings(result.UI_SCHEME, result.USER_CHOICES);
		}
	);
}

// Generates the HTML that will build the domainlist switch for a given domain in the domainlist
export function buildToggle(domain, bool) {
	let toggle;
	if (bool) toggle = `<input type="checkbox" id="${domain}" checked />`;
	else toggle = `<input type="checkbox" id="${domain}" />`;
	return toggle;
}

// Create HTML for displaying the list of domains in the domainlist, and their respective options
export function createList() {
	let items = "";
	chrome.storage.local.get(["DOMAINS", "UI_SCHEME"], function (result) {
		console.log("domains: " + Object.values(Object.keys(result.DOMAINS)));
		for (let domain of Object.values(Object.keys(result.DOMAINS)).sort()) {
			items +=
				`
        <li id="li ${domain}">
          <div uk-grid class="uk-grid-small uk-width-1-1" style="font-size: medium;">
            <div>
              <label class="switch">
              ` +
				buildToggle(domain, result.DOMAINS[domain].bool) +
				//<input type="checkbox" id="select" class="check text-color dark-checkbox" />
				`
                <span></span>
              </label>
            </div>
            <div class="domain uk-width-expand">
              ${domain}
            </div>
            <div style="
              margin-right: 5px;
              margin-left: 5px;
              margin-top: auto;
              margin-bottom: auto;
              "
            >
              <label class="switch" >
              ` +
				// +
				// buildToggle(domain, result.DOMAINS[domain])
				// // `<input type="checkbox" id="toggle-domainlist" />`
				`
                <span></span>
              </label>
            </div>
          </div>
        </li>
              `;
		}
		document.getElementById("domainlist-main").innerHTML = items;
	});
}

// Filtered lists code heavily inspired by
export function filterList() {
	let input, list, li, count;
	input = document.getElementById("searchbar").value.toLowerCase();
	list = document.getElementById("domainlist-main");
	li = list.getElementsByTagName("li");
	count = li.length;

	for (let i = 0; i < count; i++) {
		let d = li[i].getElementsByClassName("domain")[0];
		let txtValue = d.innerText;
		if (txtValue.toLowerCase().indexOf(input) > -1) {
			li[i].style.display = "";
		} else {
			li[i].style.display = "none";
		}
	}
}
