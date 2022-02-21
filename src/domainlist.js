// Sets DOMAINS[domainKey] to true
export async function turnOnGPC(domainKey) {
  console.log("turning gpc on for: " + domainKey);
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    new_domains[domainKey] = true;
    chrome.storage.local.set({ DOMAINS: new_domains });
  });
}

// Sets DOMAINS[domainKey] to false
export async function turnOffGPC(domainKey) {
  console.log("turning gpc off for: " + domainKey);
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    new_domains[domainKey].bool = false;
    chrome.storage.local.set({ DOMAINS: new_domains });
  });
}

// Removes DOMAINS[domainKey] from DOMAINS
export async function deleteDomain(domainKey) {
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    delete new_domains[domainKey];
    chrome.storage.local.set({ DOMAINS: new_domains });
    chrome.runtime.sendMessage({
      greeting: "UPDATE CACHE",
      newEnabled: "dontSet",
      newDomains: new_domains,
      newDomainlistEnabled: "dontSet",
      newApplyAll: "dontSet",
    });
  });
}

// Returns true if all domains are toggled on, false otherwise
export function allOn(domains) {
  for (let d in domains) {
    if (domains[d].bool === false) return false;
  }
  return true;
}

// Returns true if all domains are toggled off, false otherwise
export function allOff(domains) {
  for (let d in domains) {
    if (domains[d].bool === true) return false;
  }
  return true;
}

// Generates the HTML that will build the domainlist switch for a given domain in the domainlist
export function buildToggle(domain, bool) {
  let toggle;
  if (bool) toggle = `<input type="checkbox" id="${domain}" checked />`;
  else toggle = `<input type="checkbox" id="${domain}" />`;
  return toggle;
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
              <div id="others-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
              uk-tooltip="title:First party sites are sites that you visit intentionally. This category also includes sites that do not fall under any of the other categories.; pos: top-right">
                  <a class="uk-position-cover first" href="#" id="Others"></a>
                  <h3 class="uk-card-title uk-margin">First Party Sites</h3>
              </div>
          </div>  
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
      </div>
      <div class="uk-child-width-1-3@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
          <div class="choice" style="cursor: pointer;">
              <div id="social-card" class="uk-card uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
              uk-tooltip="title:Many sites integrate content delivery networks to serve images, videos, and other content files. They may also show you content from social networks and sell your data to those or share it with them.; pos: top-right">
                  <a class="uk-position-cover first" href="#" id="Content & Social"></a>
                  <h3 class="uk-card-title uk-margin">Content & Social</h3>
              </div>
          </div>  
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
          You will see 5 GPC banners popping up randomized on sites you visit. 
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
      }
      document.getElementById("current-apply-all-setting").innerHTML =
        defaultSettingInfo;
      cardInteractionSettings(result.UI_SCHEME, result.USER_CHOICES);
    }
  );
}

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
  let delete_all = ` <button
        id="delete_all_domainlist"
        style="
            margin-right: 17px;
            margin-left: 5px;
            margin-top: auto;
            margin-bottom: auto;
            padding-right: 5px;
            padding-left: 5px;
            background-color: white;
            border: 1px solid #e06d62;
            color: #e06d62;
            float: right;"
        class="uk-badge button"
        type="button">
        Delete All
      </button>
    `;
  let manager_btns = `
    ${toggle_domainlist_on}
    ${toggle_domainlist_off}
    ${delete_all}
    <hr>
  `;

  document.getElementById("domainlist-manager-btns").innerHTML = manager_btns;
  chrome.storage.local.get(["UI_SCHEME"], function (result) {
    if (result.UI_SCHEME == 3 || result.UI_SCHEME == 4 || result.UI_SCHEME == 5)
      document.getElementById("domainlist-manager-btns").classList.add("hide");
    if (result.UI_SCHEME == 0) {
      document.getElementById("toggle_all_on").classList.add("hide");
      document.getElementById("toggle_all_off").classList.add("hide");
      document.getElementById("apply_to_all_label").classList.add("hide");
    }
  });
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

            <button
              id="delete ${domain}"
              class="uk-badge button"
              type="button"
              style="
                margin-right: 5px;
                margin-left: 5px;
                margin-top: auto;
                margin-bottom: auto;
                padding-right: 5px;
                padding-left: 5px;
                background-color: white;
                border: 1px solid #e06d62;
                color: #e06d62;
              "
            >
              Delete
            </button>

        </div>
      </li>
            `;
    }
    document.getElementById("domainlist-main").innerHTML = items;

    for (let domain of Object.values(Object.keys(result.DOMAINS))) {
      if (result.UI_SCHEME == 4 || result.UI_SCHEME == 3) {
        document.getElementById(`delete ${domain}`).classList.add("hide");
      }
    }
  });
}


