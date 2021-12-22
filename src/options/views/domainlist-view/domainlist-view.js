// GPC Privacy Choice is licensed under the MIT License
// Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
// privacy-tech-lab, https://privacytechlab.org/

import { renderParse, fetchParse } from '../../components/util.js'
import { buildToggle, addDomainToggleListener, deleteDomain, allOn, allOff} from "../../../domainlist.js";

const domainListHeadings = {title: 'Global Privacy Control (GPC) Settings', subtitle: "Review or Modify Your GPC Settings"}

// "Do not allow tracking for all" button is clicked
function handleToggleAllOn() {
  // "Apply all" box is checked
  if (document.getElementById("apply_to_all").checked) {
    let toggleOn_prompt = `Are you sure you would like to toggle on the GPC setting for all sites on the website list? NOTE: Your current preferences will be overwritten.`
    if (confirm(toggleOn_prompt)) {
      chrome.storage.local.set({DOMAINLIST_ENABLED: false});
        chrome.storage.local.set({APPLY_ALL: true});
        chrome.storage.local.get(["DOMAINS"], function (result) {
            if (allOff(result.DOMAINS) === false && allOn(result.DOMAINS) === false) {
              chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC signal", prevSetting: "Personalized domain list" , newSetting: "Send signal", universalSetting: "Send signal to all", location: "Options page", subcollection: "Domain"})
            }
            else if (allOff(result.DOMAINS) === true) {
              chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC signal", prevSetting: "Don't send signal" , newSetting: "Send signal", universalSetting: "Send signal to all", location: "Options page", subcollection: "Domain"})
            }
            else {
              chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Send signal", newSetting: "No change", universalSetting: "Send signal to all", location: "Options page", subcollection: "Domain"})
            }
            let new_domains = result.DOMAINS;
            for (let d in new_domains){
                new_domains[d] = true;
            }
            chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled:true , newDomains: new_domains , newDomainlistEnabled: false })
            chrome.storage.local.set({ DOMAINS: new_domains });
            chrome.storage.local.set({UV_SETTING: "Send signal to all"});
            chrome.storage.local.set({ ENABLED: true });
            createList();
            createDefaultSettingInfo();
            document.getElementById("apply_to_all").checked=false
            addToggleListeners();
      })
    }
    else document.getElementById("apply_to_all").checked=false
  }
  // "Apply all" box isn't checked
  else {
    let toggleOn_prompt = `Are you sure you would like to toggle on the GPC setting for all sites on the website list? NOTE: Your current preferences will be overwritten.`
    if (confirm(toggleOn_prompt)) {
      chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result) {
        if (allOff(result.DOMAINS) === false && allOn(result.DOMAINS) !== true) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC signal", prevSetting: "Personalized domain list" , newSetting: "Send signal", universalSetting: result.UV_SETTING, location: "Options page", subcollection: "Domain"})
        }
        else if (allOff(result.DOMAINS) === true) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC signal", prevSetting: "Don't send signal" , newSetting: "Send signal", universalSetting: result.UV_SETTING, location: "Options page", subcollection: "Domain"})
        }
        else {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC Signal", prevSetting: "Send signal", newSetting: "No change", universalSetting: result.UV_SETTING, location: "Options page", subcollection: "Domain"})
        }
        let new_domains = result.DOMAINS;
        for (let d in new_domains){
            new_domains[d] = true;
        }
        chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled: 'dontSet', newDomains: new_domains , newDomainlistEnabled: 'dontSet' })
        chrome.storage.local.set({ DOMAINS: new_domains });
        createList();
        addToggleListeners();
      })
    }
  }
}

// "Allow tracking for all" button is clicked
function handleToggleAllOff() {
  // "Apply all" box is checked
  if (document.getElementById("apply_to_all").checked) {
    let toggleOff_prompt = `Are you sure you would like to toggle off the GPC setting for all sites on the website list? NOTE: Your current preferences will be overwritten.`
      if (confirm(toggleOff_prompt)) {
        chrome.storage.local.get(["DOMAINS", "ENABLED"], function (result) {
            if (allOn(result.DOMAINS) === false && allOff(result.DOMAINS) === false) {
              chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Personalized domain list" , newSetting: "Don't send signal", universalSetting: "Don't send signal to all", location: "Options page", subcollection: "Domain"})
            }
            else if (allOn(result.DOMAINS) === true) {
              chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Send signal" , newSetting: "Don't send signal", universalSetting: "Don't send signal to all", location: "Options page", subcollection: "Domain"})
            }
            else {
              chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Don't send signal" , newSetting: "No change", universalSetting: "Don't send signal to all", location: "Options page", subcollection: "Domain"})
            }
            let new_domains = result.DOMAINS;
            for (let d in new_domains){
                new_domains[d] = false;
            }
            chrome.storage.local.set({DOMAINLIST_ENABLED: false});
            chrome.storage.local.set({UV_SETTING: "Don't send signal to all"});
            chrome.storage.local.set({APPLY_ALL: true});
            chrome.storage.local.set({ DOMAINS: new_domains });
            chrome.storage.local.set({ ENABLED: false });
            chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled:false , newDomains: new_domains , newDomainlistEnabled: false })
              createList();
            createDefaultSettingInfo();
            document.getElementById("apply_to_all").checked=false
            addToggleListeners();
          })
        }
    else document.getElementById("apply_to_all").checked=false
  }
  // "Apply all" box isn't checked
  else {
    let toggleOff_prompt = `Are you sure you would like to toggle off the GPC setting for all sites on the website list? NOTE: Your current preferences will be overwritten.`
    if (confirm(toggleOff_prompt)) {
      chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result) {
        if (allOn(result.DOMAINS) === false && allOff(result.DOMAINS) === false) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC Signal", prevSetting: "Personalized domain list" , newSetting: "Don't send signal", universalSetting: result.UV_SETTING, location: "Options page", subcollection: "Domain"})
        }
        else if (allOn(result.DOMAINS) === true) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC Signal", prevSetting: "Send signal" , newSetting: "Don't send signal", universalSetting: result.UV_SETTING, location: "Options page", subcollection: "Domain"})
        }
        else {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC Signal", prevSetting: "Don't send signal" , newSetting: "No change", universalSetting: result.UV_SETTING, location: "Options page", subcollection: "Domain"})
        }
        let new_domains = result.DOMAINS;
        for (let d in new_domains){
            new_domains[d] = false;
        }
        chrome.storage.local.set({ DOMAINS: new_domains });
        chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled: 'dontSet', newDomains: new_domains , newDomainlistEnabled: 'dontSet' })
        createList();
        addToggleListeners();
      })
    }
  }
}

// "Apply all" switch is hit
function handleApplyAllSwitch() {
  chrome.storage.local.get(["UV_SETTING", "APPLY_ALL"], function (result) {
    if(result.APPLY_ALL){
      chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Universal Setting", prevSetting: result.UV_SETTING , newSetting: "Off", universalSetting: "Off", location: "Options page", subcollection: "Domain"})
      chrome.storage.local.set({DOMAINLIST_ENABLED: true});
      chrome.storage.local.set({UV_SETTING: "Off"});
      chrome.storage.local.set({APPLY_ALL: false});
      chrome.storage.local.set({ ENABLED: true });
      createDefaultSettingInfo();
      chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled:true , newDomains: 'dontSet' , newDomainlistEnabled: true })
    }
    else{
      createDefaultSettingInfo();
      UIkit.modal("#future_setting_prompt").show()
      createDefaultSettingInfo();
    }
  })
}

// User interacts with future setting prompt, shown when users attempt to turn on the "Apply all" switch
function handleFutureSettingPromptEvent(event) {
  // User hits "Allow tracking for all"
  if (event.target.id=='allow-future-btn') {
    chrome.storage.local.set({APPLY_ALL: true});
    chrome.storage.local.set({UV_SETTING: "Don't send signal to all"});
    chrome.storage.local.set({ ENABLED: false });
    createDefaultSettingInfo();
    chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Universal Setting", prevSetting: "Off" , newSetting: "Don't send signal to all", universalSetting: "Don't send signal to all", location: "Options page", subcollection: "Domain"})
  }
  // User hits "Don't allow tracking" for all
  else if (event.target.id=='dont-allow-future-btn') {
    chrome.storage.local.set({APPLY_ALL: true});
    chrome.storage.local.set({UV_SETTING: "Send signal to all"});
    chrome.storage.local.set({ ENABLED: true });
    createDefaultSettingInfo();
    chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Universal Setting", prevSetting: "Off" , newSetting: "Send signal to all", universalSetting: "Send signal to all", location: "Options page", subcollection: "Domain"})
  }
  // Otherwise, they hit cancel and nothing changes
}

// Entire domain list is deleted
function handleDeleteDomainListEvent() {
  let delete_prompt = `Are you sure you would like to permanently delete all domains from the Domain List? NOTE: Domains will be automatically added back to the list when the domain is requested again.`
  if (confirm(delete_prompt)) {
    chrome.storage.local.get(["UV_SETTING"], function (result) {
      chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "Delete domain", prevSetting: null, newSetting: null, universalSetting: result.UV_SETTING, location: "Options page", subcollection: "Domain"})
    })
    chrome.storage.local.set({ DOMAINS: {} });
    chrome.runtime.sendMessage
          ({greeting:"UPDATE CACHE", newEnabled: 'dontSet', newDomains: {} , newDomainlistEnabled: 'dontSet' })
  }
  createList();
  addToggleListeners();
}

// User changes GPC signal send status on scheme 6
function addGPCEventListener() {
  document.addEventListener('click', event => {
    if(event.target.id == 'privacy-on') {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "Enable GPC") {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "Enable GPC", location: "Options page", subcollection: "Privacy Choice"})
        }
      })
      chrome.storage.local.set({USER_CHOICES: "Enable GPC"});
      createDefaultSettingInfo();
    } else if (event.target.id == 'privacy-off') {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "Disable GPC") {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "Disable GPC", location: "Options page", subcollection: "Privacy Choice"})
        }
      })
      chrome.storage.local.set({USER_CHOICES: "Disable GPC"}); 
      createDefaultSettingInfo()
    }
  })
}

// User changes their privacy profile on scheme 3
function addPrivacyProfileEventListener() {
  document.addEventListener('click', function(event){
    if(event.target.id == 'high-privacy-sensitivity') {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "High Privacy-Sensitivity") {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "High Privacy-Sensitivity", location: "Options page", subcollection: "Privacy Choice"})
        }
      })
      chrome.storage.local.set({USER_CHOICES: "High Privacy-Sensitivity"});
      createDefaultSettingInfo()
      updatePrefScheme3()
    } else if (event.target.id == 'medium-privacy-sensitivity') {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "Medium Privacy-Sensitivity") {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "Medium Privacy-Sensitivity", location: "Options page", subcollection: "Privacy Choice"})
        }
      })
      chrome.storage.local.set({USER_CHOICES: "Medium Privacy-Sensitivity"}); 
      createDefaultSettingInfo()
      updatePrefScheme3()
    } else if (event.target.id == 'low-privacy-sensitivity') {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "Low Privacy-Sensitivity") {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "Not Privacy Sensitive", location: "Options page", subcollection: "Privacy Choice"})
        }
      })
      chrome.storage.local.set({USER_CHOICES: "Low Privacy-Sensitivity"});  
      createDefaultSettingInfo()
      updatePrefScheme3()
    }
  })
}

// User alters their category choice on scheme 4
function addCategoriesEventListener() {
  document.addEventListener('click', function(event){
    chrome.storage.local.get(["USER_CHOICES"], function (result) {  
      chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});
      let userChoices=result.USER_CHOICES
      if(event.target.id == 'Advertising') {
        userChoices["Advertising"]=!userChoices["Advertising"]
        chrome.storage.local.set({USER_CHOICES: userChoices});
        chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
        })   
        chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});
        createDefaultSettingInfo()
        updatePrefScheme4()
      }
      else if(event.target.id == 'Analytics') {
        userChoices["Analytics"]=!userChoices["Analytics"]
        chrome.storage.local.set({USER_CHOICES: userChoices});
        chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
        }) 
        chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});
        createDefaultSettingInfo()
        updatePrefScheme4()
      }
      else if(event.target.id == 'Fingerprinting') {
        userChoices["Fingerprinting"]=!userChoices["Fingerprinting"]
        chrome.storage.local.set({USER_CHOICES: userChoices});
        chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
        }) 
        chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES}); 
        createDefaultSettingInfo()
        updatePrefScheme4()         
      }
      else if(event.target.id == 'Content & Social') {
        userChoices["Content & Social"]=!userChoices["Content & Social"]
        chrome.storage.local.set({USER_CHOICES: userChoices});
        chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
        })
        chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});   
        createDefaultSettingInfo()
        updatePrefScheme4()       
      }
      else if (event.target.id == 'Cryptomining') {
        userChoices["Cryptomining"]=!userChoices["Cryptomining"]
        chrome.storage.local.set({USER_CHOICES: userChoices});
        chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
        })
        chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});  
        createDefaultSettingInfo()
        updatePrefScheme4()        
      }
      else if (event.target.id == 'Others') {
        userChoices["Others"]=!userChoices["Others"]
        chrome.storage.local.set({USER_CHOICES: userChoices});
        chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
        })
        chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});  
        createDefaultSettingInfo()
        updatePrefScheme4()
      }        
    })
  })
}

// Creates the event listeners for the `domainlist` page buttons and options
function addEventListeners() {
  // Add the serach functionality
  if (document.getElementById('searchbar') != null) document.getElementById('searchbar').addEventListener('keyup', filterList);
  // Add click event handler
  document.addEventListener('click', event => {
    if (event.target.id == 'toggle_all_off') { handleToggleAllOff();
    } else if (event.target.id == 'toggle_all_on') { handleToggleAllOn();
    } else if (event.target.id == 'apply-all-switch') { handleApplyAllSwitch();
    } else if (event.target.id == 'allow-future-btn' || event.target.id=='dont-allow-future-btn') {handleFutureSettingPromptEvent(event);
    } else if (event.target.id == 'delete_all_domainlist') { handleDeleteDomainListEvent();
    }
  })
  // Add event listener based on the user's scheme
  chrome.storage.local.get(["UI_SCHEME"], function (result) {
    if (result.UI_SCHEME != 6) addToggleListeners();
    if (result.UI_SCHEME == 3) addPrivacyProfileEventListener();
    if (result.UI_SCHEME == 4) addCategoriesEventListener();
    if (result.UI_SCHEME == 6) addGPCEventListener();
  })
}

// Creates the specific Domain List toggles as well as the perm delete
function addToggleListeners() {
  chrome.storage.local.get(["DOMAINS"], function (result) {
    for (let domain in result.DOMAINS) {
      addDomainToggleListener(domain, domain)
      addDeleteButtonListener(domain)
    }
  });
}

// Delete buttons for each domain
function addDeleteButtonListener (domain) {
  document.getElementById(`delete ${domain}`).addEventListener("click",()=>{
        deleteDomain(domain)
        document.getElementById(`li ${domain}`).remove();
        chrome.storage.local.get(["UV_SETTING"], function (result) {
          chrome.runtime.sendMessage({greeting:"INTERACTION", domain: domain, setting: "Delete domain", prevSetting: null, newSetting: null, universalSetting: result.UV_SETTING, location: "Options page", subcollection: "Domain"})
        })
  })
}

// Filtered lists code heavily inspired by
function filterList() {
  let input, list, li, count
  input = document.getElementById('searchbar').value.toLowerCase();
  list = document.getElementById('domainlist-main')
  li = list.getElementsByTagName('li')
  count = li.length

  for (let i = 0; i < count; i++) {
      let d = li[i].getElementsByClassName('domain')[0];
      let txtValue = d.innerText;
      if (txtValue.toLowerCase().indexOf(input) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  };
}

// Handles the initialization of card selections/changing of card selections
function cardInteractionSettings(scheme, userChoice) {
    if(scheme==3){
      if(userChoice=='High Privacy-Sensitivity'){
        document.getElementById('high-privacy-sensitivity-card').classList.add('uk-card-primary')
      }
      else document.getElementById('high-privacy-sensitivity-card').classList.remove("uk-card-primary");
      if(userChoice=='Medium Privacy-Sensitivity'){
        document.getElementById('medium-privacy-sensitivity-card').classList.add('uk-card-primary')
      }
      else document.getElementById('medium-privacy-sensitivity-card').classList.remove("uk-card-primary");
      if(userChoice=="Low Privacy-Sensitivity"){
        document.getElementById('low-privacy-sensitivity-card').classList.add('uk-card-primary')
      }
      else document.getElementById('low-privacy-sensitivity-card').classList.remove("uk-card-primary");
    } else if(scheme == 4){
      if(userChoice['Advertising']){
        document.getElementById('advertising-card').classList.add('uk-card-primary')
      }
      else document.getElementById('advertising-card').classList.remove("uk-card-primary");
      if(userChoice['Analytics']){
        document.getElementById('analytics-card').classList.add('uk-card-primary')
      }
      else document.getElementById('analytics-card').classList.remove("uk-card-primary");
      if(userChoice['Fingerprinting']){
        document.getElementById('fingerprinting-card').classList.add('uk-card-primary')
      }
      else document.getElementById('fingerprinting-card').classList.remove("uk-card-primary");
      if(userChoice["Content & Social"]){
        document.getElementById('social-card').classList.add('uk-card-primary')
      }
      else document.getElementById('social-card').classList.remove("uk-card-primary");
      if(userChoice['Cryptomining']){
        document.getElementById('cryptomining-card').classList.add('uk-card-primary')
      }
      else document.getElementById('cryptomining-card').classList.remove("uk-card-primary");
      if(userChoice['Others']){
        document.getElementById('others-card').classList.add('uk-card-primary')
      }
      else document.getElementById('others-card').classList.remove("uk-card-primary");
    } else if (scheme==6){
      if(userChoice=='Enable GPC'){
        document.getElementById('privacy-on-card').classList.add('uk-card-primary')
      } else document.getElementById('privacy-on-card').classList.remove("uk-card-primary");

      if(userChoice=="Disable GPC"){
        document.getElementById('privacy-off-card').classList.add('uk-card-primary')
      } else document.getElementById('privacy-off-card').classList.remove("uk-card-primary");
    }
}

// Create HTML for the buttons and information on default/apply-all setting
function createDefaultSettingInfo(){
  chrome.storage.local.get(["APPLY_ALL", "ENABLED", "UI_SCHEME", "USER_CHOICES"], function (result) {
    let apply_all_bool = result.APPLY_ALL;
    let apply_all_switch = ` <div uk-grid class="uk-grid-small uk-width-1-1" style="font-size: medium;">
        <div>
          <label class="switch">
            ` + buildToggle('apply-all-switch', !apply_all_bool) +
            `
            <span></span>
          </label>
        </div>
        <div class="domain uk-width-expand">
          Show the GPC Banner for Future Websites You Visit
        </div>
      </div>
      <br>
            `
    let defaultSettingInfo;
    if (result.UI_SCHEME==1||result.UI_SCHEME==2) {
      if (apply_all_bool) {
        if (result.ENABLED) {
          defaultSettingInfo =
          `
          ${apply_all_switch}
          <div class="important-text">
          You have enabled GPC.
          </div>
          Below you can change your GPC setting for an individual site. You can also apply a GPC setting to all current and future sites.
          `
        }
        else {

          defaultSettingInfo = `
          ${apply_all_switch}
          <div class="important-text"> You have disabled GPC.
          </div>
          Below you can change your GPC setting for an individual site. You can also apply a GPC setting to all current and future sites.
          `  
        }
      }
      else {
        defaultSettingInfo = `
        ${apply_all_switch}
        <div class="important-text"> Below you can change your GPC setting for an individual site.
        </div>
        You can change the privacy preference made for
        an individual domain by 
        toggling the domain's switch in the domain list below or you can choose a setting to apply to all
        current and future domains.
        `
      }
    } 
    else if (result.UI_SCHEME==4) {
      defaultSettingInfo =
      `
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
              uk-tooltip="title:(Many sites integrate third party ad networks that sell/share your data for advertising purposes.; pos: top-right">
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
      `
    } 
    else if (result.UI_SCHEME==3) {
      defaultSettingInfo =
      `
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
      `
    } 
    else if (result.UI_SCHEME==5){
      defaultSettingInfo = 
      `
      <div class="uk-container main">
        <div class="uk-alert-success" uk-alert>
          <a class="uk-alert-close" uk-close></a>
          <p>
          You will see 10 GPC banners popping up randomized on sites you visit. 
          Based on your choices, the extension will learn your privacy preferences. 
          You will no longer need to make choices after the learning phase is completed. 
          The learning phase is currently in progress.
          </p>
        </div>
      </div>
      <hr>
      `
    }
    else if (result.UI_SCHEME==0){
      defaultSettingInfo = 
      `
      <div class="important-text"> Below you can change your GPC setting for an individual site.
      </div>
      You can also apply a GPC setting to all current and future sites.
      `
    }
    else if (result.UI_SCHEME == 6){
      defaultSettingInfo = 
      `
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
      `
    }
    document.getElementById('current-apply-all-setting').innerHTML = defaultSettingInfo;
    cardInteractionSettings(result.UI_SCHEME, result.USER_CHOICES);
  })
}

// Create HTML for buttons to manage entire domainlist at once
function createDomainlistManagerButtons(){
  let toggle_domainlist_on =
    ` <button
        id="toggle_all_on"
        class="uk-badge button blue-buttons"
        type="button">
       Enable GPC on All Sites
      </button>
    `
  let toggle_domainlist_off =
    ` <button
        id="toggle_all_off"
        class="uk-badge blue-buttons button"
        type="button">
        Disable GPC on All Sites
      </button>
    `
  let delete_all =
    ` <button
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
    `
  let apply_to_all=
  `
    <label id="apply_to_all_label"><input id="apply_to_all" type="checkbox">Apply to Future Sites</label>
  `
  let manager_btns=
  `
    ${toggle_domainlist_on}
    ${toggle_domainlist_off}
    ${delete_all}
    ${apply_to_all}
    <hr>
  `

  
  document.getElementById('domainlist-manager-btns').innerHTML = manager_btns;
  chrome.storage.local.get(["UI_SCHEME"], function (result) {
    if(result.UI_SCHEME == 3 || result.UI_SCHEME == 4 || result.UI_SCHEME == 5)
      document.getElementById('domainlist-manager-btns').classList.add("hide")
    if (result.UI_SCHEME==0){
      document.getElementById('toggle_all_on').classList.add("hide")
      document.getElementById('toggle_all_off').classList.add("hide")
      document.getElementById('apply_to_all_label').classList.add("hide")
    } 
  })

}

// Create HTML for displaying the list of domains in the domainlist, and their respective options
export function createList() {
  let items = ""
  chrome.storage.local.get(["DOMAINS", "UI_SCHEME"], function (result) { 
    for (let domain of Object.values(Object.keys(result.DOMAINS)).sort()) {
      items +=
            `
      <li id="li ${domain}">
        <div uk-grid class="uk-grid-small uk-width-1-1" style="font-size: medium;">
          <div>
            <label class="switch">
            `
            +
              buildToggle(domain, result.DOMAINS[domain])
              //<input type="checkbox" id="select" class="check text-color dark-checkbox" />
            +
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
            `
            // +
            // buildToggle(domain, result.DOMAINS[domain])
            // // `<input type="checkbox" id="toggle-domainlist" />`
            +
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
            `

    }
    document.getElementById('domainlist-main').innerHTML = items;

    for (let domain of Object.values(Object.keys(result.DOMAINS))){
      if(result.UI_SCHEME==4 || result.UI_SCHEME==3){
        document.getElementById(`delete ${domain}`).classList.add("hide")
      }
    }
  });
}

// Update the check list based on the user's choice in scheme 3
function updatePrefScheme3() {
  chrome.storage.local.get(["DOMAINS", "CHECKLIST", "USER_CHOICES", "NPSLIST"], function (result){
    let domains = result.DOMAINS;
    for(let d in domains){
      // by default, do not send GPC signals
      let value = false;
      // if user chose extremely privacy sensitive: send GPC signals
      if (result.USER_CHOICES == "High Privacy-Sensitivity") value = true;
      // if user chose not privacy sensitive: do not send GPC signals
      else if (result.USER_CHOICES == "Low Privacy-Sensitivity")  {
          value = false;
          if (result.NPSLIST.includes(d)) value = true;
      }
      // if the user chose moderately gpc signals
      else if (result.USER_CHOICES == "Medium Privacy-Sensitivity"){
          // by default, the GPC signals are not sent unless the currentDomain is the the checkList
          value = false;
          if (result.CHECKLIST.includes(d)) value = true;
      }
      // add the currentDomain and store it in the local storage
      domains[d] = value;
    }
    chrome.storage.local.set({DOMAINS: domains});
    createList()
    addToggleListeners();
    // notify background to update the cache used for look up
    chrome.runtime.sendMessage({greeting: "UPDATE CACHE", newEnabled:'dontSet' , newDomains: domains , newDomainlistEnabled: "dontSet", newApplyAll: 'dontSet' })
  })
}

// Update the check list based on the user's choice in scheme 4
async function updatePrefScheme4() {
  chrome.storage.local.get(["DOMAINS", "CHECKLIST", "CHECKNOTLIST", "USER_CHOICES"], async function (result){
    let checkList = [];
    let checkNotList = [];
    let userChoices=result.USER_CHOICES
    // Parse the networks json file based on the user's response to JSON
    await fetch("../../json/services.json")
      .then((response) => response.text())
      .then((result) => {
        let networks = (JSON.parse(result))["categories"]
        for (let category of Object.keys(userChoices)){
            if (userChoices[category] == true){
                if (category != "Others"){
                    if (category === "Fingerprinting") {
                        for (let cat of ["FingerprintingGeneral", "FingerprintingInvasive"]) {
                            for (let n of networks[cat]) {
                                for (let c of Object.values(n)){
                                    for (let list of Object.values(c)){
                                    checkList = checkList.concat(list);
                                    }
                                }
                            }
                        }
                    }
                    else if (category === "Content & Social") {
                      for (let cat of ["Content", "Social", "Disconnect"]) {
                          for (let n of networks[cat]) {
                              for (let c of Object.values(n)){
                                  for (let list of Object.values(c)){
                                  checkList = checkList.concat(list);
                                  }
                              }
                          }
                      }
                    }
                    else {
                        for (let n of networks[category]){
                            for (let c of Object.values(n)){
                            for (let list of Object.values(c)){
                                checkList = checkList.concat(list);
                            }
                            }
                        }
                    }
                }
            } else {
                if (category != "Others"){
                    if (category === "Fingerprinting") {
                        for (let cat of ["FingerprintingGeneral", "FingerprintingInvasive"]) {
                            for (let n of networks[cat]){
                                for (let c of Object.values(n)){
                                    for (let list of Object.values(c)){
                                        checkNotList = checkNotList.concat(list);
                                    }
                                }
                            }
                        }
                    }
                    else if (category === "Content & Social") {
                      for (let cat of ["Content", "Social", "Disconnect"]) {
                          for (let n of networks[cat]) {
                              for (let c of Object.values(n)){
                                  for (let list of Object.values(c)){
                                  checkNotList = checkNotList.concat(list);
                                  }
                              }
                          }
                      }
                    }
                    else {
                        for (let n of networks[category]){
                            for (let c of Object.values(n)){
                                for (let list of Object.values(c)){
                                    checkNotList = checkNotList.concat(list);
                                }
                            }
                        }
                    }
                }   
            }
        }
      })
    chrome.storage.local.set({CHECKLIST: checkList, CHECKNOTLIST: checkNotList})

    let domains = result.DOMAINS;
    for (let currentDomain in domains) {
      // by default, do not send GPC signals
      let value = false;
      // send GPC signals if the currentDomain is in the checkList
      if (checkList.includes(currentDomain)) value = true;
      else {
          // send GPC is the currentDomain is not on the checkList, but the user has chosen Others and the currentDomain is not on the checknotlist
          if ((result.USER_CHOICES["Others"] == true)){
              if (!(checkNotList.includes(currentDomain))) value = true;
          }
      }
      // add the currentDomain and store it in the local storage
      domains[currentDomain] = value;
    }
    chrome.storage.local.set({DOMAINS: domains});
    createList()
    addToggleListeners();
    // notify background to update the cache used for look up
    chrome.runtime.sendMessage({greeting: "UPDATE CACHE", newEnabled:'dontSet' , newDomains: domains , newDomainlistEnabled: "dontSet", newApplyAll: 'dontSet'})
})
}

// Renders the `domain list` view in the options page
export async function domainlistView(scaffoldTemplate, buildList) {
  let body; 
  let content;

  if (buildList){
    body = renderParse(scaffoldTemplate, domainListHeadings, 'scaffold-component'); 
    content = await fetchParse('./views/domainlist-view/domainlist-view.html', 'domainlist-view');
  } else {
    body = renderParse(scaffoldTemplate, domainListHeadings, 'scaffold-component'); 
    content = await fetchParse('./views/domainlist-view/domainlist-view-plain.html', 'domainlist-view-plain')
  }
  
  document.getElementById('content').innerHTML = body.innerHTML
  document.getElementById('scaffold-component-body').innerHTML = content.innerHTML

  createDefaultSettingInfo();

  if (buildList){
    createDomainlistManagerButtons(); 
    createList();
  }
  addEventListeners();
  chrome.storage.local.get(["LEARNING"], function(result){
    if (result.LEARNING == "Just Finished"){
      chrome.storage.local.set({"LEARNING": "Completed"}, function(){
        let modal = UIkit.modal("#learning-finish-modal");
        modal.show();
        document.getElementById("learning-finish-modal-button").onclick = function () {modal.hide();}   
      });
    }
  })
}