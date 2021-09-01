// OptMeowt-Research is licensed under the MIT License
// Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
// privacy-tech-lab, https://privacytechlab.org/

import { renderParse, fetchParse } from '../../components/util.js'
import { buildToggle, addDomainToggleListener, deleteDomain, allOn, allOff} from "../../../domainlist.js";

const domainListHeadings = {title: 'Privacy Settings', subtitle: "Update Privacy Profile / Change Do Not Sell Signal Domains"}
const nonDomainListHeadings = {title: 'Privacy Settings', subtitle: "Update Privacy Status"}

// "Do not allow tracking for all" button is clicked
function addToggleAllOnEventListener() {
  // "Apply all" box is checked
  if (document.getElementById("apply_to_all").checked) {
    let toggleOn_prompt = `Are you sure you would like to toggle on the GPC setting for all sites in your domain list?
    NOTE: Your current preferences will be permanently lost.`
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
    let toggleOn_prompt = `Are you sure you would like to toggle on the GPC setting for all sites in your domain list?
    NOTE: Your current preferences will be permanently lost.`
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
function addToggleAllOffEventListener() {
  // "Apply all" box is checked
  if (document.getElementById("apply_to_all").checked) {
    let toggleOff_prompt = `Are you sure you would like to toggle off the GPC setting for all sites in your domain list?
      NOTE: Your current preferences will be permanently lost.`
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
    let toggleOff_prompt = `Are you sure you would like to toggle off the GPC setting for all sites in your domain list?
    NOTE: Your current preferences will be permanently lost.`
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
function addApplyAllSwitchEventListener() {
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
function addFutureSettingPromptEventListener(event) {
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
function addDeleteDomainListEventListener() {
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

// User changes GPC signal send status on scheme no domainlist
function addGPCEventListener(event) {
  if(event.target.id == 'sending') {
    chrome.storage.local.get(["USER_CHOICES"], function (result) {
      if (result.USER_CHOICES !== "Yes, Send Signal") {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "Yes, Send Signal", location: "Options page", subcollection: "Privacy Choice"})
      }
    })
    chrome.storage.local.set({USER_CHOICES: "Yes, Send Signal"});
    createDefaultSettingInfo();
  }
  else if (event.target.id == 'not-sending') {
    chrome.storage.local.get(["USER_CHOICES"], function (result) {
      if (result.USER_CHOICES !== "No, Don't Send Signal") {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "No, Don't Send Signal", location: "Options page", subcollection: "Privacy Choice"})
      }
    })
    chrome.storage.local.set({USER_CHOICES: "No, Don't Send Signal"}); 
    createDefaultSettingInfo()
  }
}

// User changes their privacy profile on scheme 3
function addPrivacyProfileEventListener(event) {
  if(event.target.id == 'extremely-privacy-sensitive') {
    chrome.storage.local.get(["USER_CHOICES"], function (result) {
      if (result.USER_CHOICES !== "Extremely Privacy-Sensitive") {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "Extremely Privacy-Sensitive", location: "Options page", subcollection: "Privacy Choice"})
      }
    })
    chrome.storage.local.set({USER_CHOICES: "Extremely Privacy-Sensitive"});
    createDefaultSettingInfo()
    updatePrefScheme3()
  }
  else if (event.target.id == 'moderately-privacy-sensitive') {
    chrome.storage.local.get(["USER_CHOICES"], function (result) {
      if (result.USER_CHOICES !== "Moderately Privacy-Sensitive") {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "Moderately Privacy-Sensitive", location: "Options page", subcollection: "Privacy Choice"})
      }
    })
    chrome.storage.local.set({USER_CHOICES: "Moderately Privacy-Sensitive"}); 
    createDefaultSettingInfo()
    updatePrefScheme3()
  }
  else if (event.target.id == 'not-privacy-sensitive') {
    chrome.storage.local.get(["USER_CHOICES"], function (result) {
      if (result.USER_CHOICES !== "Not Privacy-Sensitive") {
      chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: result.USER_CHOICES, newSetting: "Not Privacy Sensitive", location: "Options page", subcollection: "Privacy Choice"})
      }
    })
    chrome.storage.local.set({USER_CHOICES: "Not Privacy-Sensitive"});  
    createDefaultSettingInfo()
    updatePrefScheme3()
  }
}

// User alters their category choice on scheme 2
function addCategoriesEventListener(event) {
  chrome.storage.local.get(["USER_CHOICES"], function (result) {  
    chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});
    let userChoices=result.USER_CHOICES
    if(event.target.id == 'advertising') {
      userChoices["Advertising"]=!userChoices["Advertising"]
      chrome.storage.local.set({USER_CHOICES: userChoices});
      chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
      })   
      chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});
      createDefaultSettingInfo()
      updatePrefScheme2()
    }
    else if(event.target.id == 'analytics') {
      userChoices["Analytics"]=!userChoices["Analytics"]
      chrome.storage.local.set({USER_CHOICES: userChoices});
      chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
      }) 
      chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});
      createDefaultSettingInfo()
      updatePrefScheme2()
    }
    else if(event.target.id == 'fingerprinting') {
      userChoices["Fingerprinting"]=!userChoices["Fingerprinting"]
      chrome.storage.local.set({USER_CHOICES: userChoices});
      chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
      }) 
      chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES}); 
      createDefaultSettingInfo()
      updatePrefScheme2()         
    }
    else if(event.target.id == 'social') {
      userChoices["Content & Social"]=!userChoices["Content & Social"]
      chrome.storage.local.set({USER_CHOICES: userChoices});
      chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
      })
      chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});   
      createDefaultSettingInfo()
      updatePrefScheme2()       
    }
    else if (event.target.id == 'cryptomining') {
      userChoices["Cryptomining"]=!userChoices["Cryptomining"]
      chrome.storage.local.set({USER_CHOICES: userChoices});
      chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
      })
      chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});  
      createDefaultSettingInfo()
      updatePrefScheme2()        
    }
    else if (event.target.id == 'others') {
      userChoices["Others"]=!userChoices["Others"]
      chrome.storage.local.set({USER_CHOICES: userChoices});
      chrome.storage.local.get(["USER_CHOICES", "PREV_CHOICE"], function (result) {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All domains", setting: "Categories", prevSetting: result.PREV_CHOICE, newSetting: result.USER_CHOICES, location: "Options page", subcollection: "Privacy Choice"})
      })
      chrome.storage.local.set({PREV_CHOICE: result.USER_CHOICES});  
      createDefaultSettingInfo()
      updatePrefScheme2()
    }        
  })
}

// Creates the event listeners for the `domainlist` page buttons and options
function addEventListeners() {
  if (document.getElementById('searchbar') != null) document.getElementById('searchbar').addEventListener('keyup', filterList);

  chrome.storage.local.get(["UI_SCHEME"], function (result) {
    document.addEventListener('click', event => {
      if (event.target.id=='toggle_all_off'){
        addToggleAllOffEventListener();
        addToggleListeners();
      }
      else if (event.target.id=='toggle_all_on'){
        addToggleAllOnEventListener();
        addToggleListeners();
      }
      else if(event.target.id=='apply-all-switch'){
        addApplyAllSwitchEventListener();
        addToggleListeners();
      }
      else if(event.target.id=='allow-future-btn' || event.target.id=='dont-allow-future-btn'){
        addFutureSettingPromptEventListener(event);
        addToggleListeners();
      }
      else if(event.target.id=='delete_all_domainlist'){
        addDeleteDomainListEventListener();
        addToggleListeners();
      }
      else if (result.UI_SCHEME==3){
        addPrivacyProfileEventListener(event);
        addToggleListeners();
      }
      else if(result.UI_SCHEME==2){
        addCategoriesEventListener(event);
        addToggleListeners();
      } 
      else if (result.UI_SCHEME == 6){
        addGPCEventListener(event);
      }
    })
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
      if(userChoice=='Extremely Privacy-Sensitive'){
        document.getElementById('extremely-privacy-sensitive-card').classList.add('uk-card-primary')
      }
      else document.getElementById('extremely-privacy-sensitive-card').classList.remove("uk-card-primary");
      if(userChoice=='Moderately Privacy-Sensitive'){
        document.getElementById('moderately-privacy-sensitive-card').classList.add('uk-card-primary')
      }
      else document.getElementById('moderately-privacy-sensitive-card').classList.remove("uk-card-primary");
      if(userChoice=="Not Privacy-Sensitive"){
        document.getElementById('not-privacy-sensitive-card').classList.add('uk-card-primary')
      }
      else document.getElementById('not-privacy-sensitive-card').classList.remove("uk-card-primary");
    } else if(scheme==2){
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
      console.log(userChoice);
      if(userChoice=='Yes, Send Signal'){
        document.getElementById('sending').classList.add('uk-card-primary')
      } else document.getElementById('not-sending').classList.remove("uk-card-primary");

      if(userChoice=="No, Don't Send Signal"){
        document.getElementById('not-sending').classList.add('uk-card-primary')
      } else document.getElementById('not-sending').classList.remove("uk-card-primary");
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
          Show the Choice Banner Every Time I Visit a New Site
        </div>
      </div>
      <br>
            `
    let defaultSettingInfo;
    if (result.UI_SCHEME==1) {
      if (apply_all_bool) {
        if (result.ENABLED) {
          defaultSettingInfo =
          `
          ${apply_all_switch}
          <div class="important-text">
          You have opted to send do not sell signals to all domains, unless otherwise stated in the domain list.
          </div>
          You can opt out of sending the signal
          to an individual domain by turning off the domain's switch in the domain list below or apply a
          different setting to all current and future domains.
          `
        }
        else {

          defaultSettingInfo = `
          ${apply_all_switch}
          <div class="important-text"> You have opted to allow all domains to track and sell 
          your information, unless otherwise stated in the domain list. 
          </div>
          You can opt out of allowing an individual domain to
          track and sell your information by 
          turning on the domain's switch in the domain list below or apply a differnt setting to all current and future
          domains.
          `  
        }
      }
      else {
        defaultSettingInfo = `
        ${apply_all_switch}
        <div class="important-text"> When you visit a new domain you will be asked
        to choose your privacy preference for that domain. 
        </div>
        You can change the privacy preference made for
        an individual domain by 
        toggling the domain's switch in the domain list below or you can choose a setting to apply to all
        current and future domains.
        `
      }
    } 
    else if (result.UI_SCHEME==2) {
      defaultSettingInfo =
      `
      <p class="uk-text-center">Select below the forms of online tracking you do NOT want to be subjected to.</p>
      <div class="uk-child-width-1-3@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
        <div class="choice">
          <div id='advertising-card' class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary" 
            uk-tooltip="title:Many websites use third party ad networks that will receive your data for advertising purposes. Ad networks will often track you across multiple sites you visit.; pos: top-right">
            <a class="uk-position-cover first" href="#" id="advertising" checked></a>
            <span class="uk-text-middle">Advertising</span>
          </div>
        </div>
        <div class="choice">
          <div id='analytics-card' class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary" 
            uk-tooltip="title:Many websites use third party services that will keep track of site metrics, for example, your geographical region or whether you experienced any errors on the site you visited.; pos: top-right">
            <a class="uk-position-cover first" href="#" id="analytics" checked></a>
            <span class="uk-text-middle">Analytics</span>
          </div>
        </div>
        <div class="choice">
          <div id='social-card' class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary" 
            uk-tooltip="title:Many websites use content delivery networks to serve images, videos, and other content files. They may also show you content from social networks and share your data with those.; pos: top-right">
            <a class="uk-position-cover first" href="#" id="social" checked></a>
            <span class="uk-text-middle">Content & Social</span>
          </div>
        </div>
      </div>
      <div class="uk-child-width-1-3@m uk-grid-match uk-text-center uk-margin-medium-top" uk-grid>
        <div class="choice">
          <div id='cryptomining-card' class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary" 
            uk-tooltip="title:Some sites use malicious third party services that will use your computer to mine for crypto currencies.; pos: top-right">
            <a class="uk-position-cover first" href="#" id="cryptomining" checked></a>
            <span class="uk-text-middle">Cryptomining</span>
          </div>
        </div>
        <div class="choice">
          <div id='fingerprinting-card' class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary" 
            uk-tooltip="title:Browser fingerprinting is a sneaky technique to identify you based on the characteristics of your browser, for example, by your browser version and the plugins you use. Some sites use third party fingerprinting services for advertising purposes and disclose your data to those.; pos: top-right">
            <a class="uk-position-cover first" href="#" id="fingerprinting" checked></a>
            <span class="uk-text-middle">Fingerprinting</span>
          </div>
        </div>
        <div class="choice">
          <div id='others-card' class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary" 
            uk-tooltip="title:This category includes your first party sites, i.e., the sites that you intentionally visit, as well as sites that do not fall in any of the other categories.; pos: top-right">
            <a class="uk-position-cover first" href="#" id="others" checked></a>
            <span class="uk-text-middle">Others</span>
          </div>
        </div>
      </div>
      `
    } 
    else if (result.UI_SCHEME==3) {
      defaultSettingInfo =
      `
      <div class="uk-container main">
        <h2 class="uk-legend uk-text-center">Privacy Profile</h2>
        <div class="uk-child-width-1-3@m uk-grid-match uk-text-center" uk-grid>
          <div class="choice">
            <div id='extremely-privacy-sensitive-card' class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary" 
              uk-tooltip="title: GPC signals will be sent to all visited websites.; pos: top-right">
              <a class="uk-position-cover first" href="#" id="extremely-privacy-sensitive" checked></a>
              <span class="uk-text-middle">Extremely Privacy-Sensitive</span>
            </div>
          </div>
          <div class="choice">
            <div id='moderately-privacy-sensitive-card' class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
              uk-tooltip="title: GPC signals will be sent to most websites that participate in tracking. Different types of tracking covered include fingerprinting, cryptomining, analytics and advertising.; pos: top-right">
              <a class="uk-position-cover second" href="#" id="moderately-privacy-sensitive" checked></a>
              <span class="uk-text-middle">Moderately Privacy-Sensitive</span>
            </div>
          </div>
          <div class="choice">
            <div id="not-privacy-sensitive-card" class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
              uk-tooltip="title: GPC signals will only be sent to websites that support malicious and/or invasive tracking. This includes fingerprinting and cryptomining.; pos: top-right">
              <a class="uk-position-cover third" href="#" id="not-privacy-sensitive" checked></a>
              <span class="uk-text-middle">Not Privacy-Sensitive</span>
            </div>
          </div>
        </div>
      </div>
      <hr>
      `
    } 
    else if (result.UI_SCHEME==4){
      defaultSettingInfo = 
      `
      <div class="uk-container main">
        <div class="uk-alert-success" uk-alert>
          <a class="uk-alert-close" uk-close></a>
          <p>You will see 10 banners poping up by random. Based on your banner decisions, we will learn your privacy profiles and put you in the relevant categories. You will no longer need to see the banners after that. The learning is currently in progress.</p>
        </div>
      </div>
      <hr>
      `
    }
    else if (result.UI_SCHEME==0){
      defaultSettingInfo = 
      `
      <div class="important-text"> When you visit a new domain you will be asked
        to choose your privacy preference for that domain. 
      </div>
      You can change the privacy preference made for
      an individual domain by 
      toggling the domain's switch in the domain list below. 
      `
    }
    else if (result.UI_SCHEME == 6){
      defaultSettingInfo = 
      `
      <div class="uk-container main">
        <div class="uk-child-width-1-2@m uk-grid-match uk-text-center" uk-grid>
          <div class="choice">
            <div id='sending' class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
              uk-tooltip="title: GPC signals will be sent to most websites that participate in tracking. Different types of tracking covered include fingerprinting, cryptomining, analytics and advertising.; pos: top-right">
              <a class="uk-position-cover second" href="#" id="sending" checked></a>
              <span class="uk-text-middle">Send Signal</span>
            </div>
          </div>
          <div class="choice">
            <div id="not-sending" class="uk-card-small uk-card-default uk-box-shadow-medium uk-card-hover uk-card-body uk-inline" uk-toggle="cls: uk-card-primary"
              uk-tooltip="title: GPC signals will only be sent to websites that support malicious and/or invasive tracking. This includes fingerprinting and cryptomining.; pos: top-right">
              <a class="uk-position-cover third" href="#" id="not-sending" checked></a>
              <span class="uk-text-middle">Do Not Send Signal</span>
            </div>
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
       Send Do Not Sell Signals to All
      </button>
    `
  let toggle_domainlist_off =
    ` <button
        id="toggle_all_off"
        class="uk-badge blue-buttons button"
        type="button">
        Send Do Not Sell Signals to None
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
    <label id="apply_to_all_label"><input id="apply_to_all" type="checkbox">Apply To Future Domains</label>
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
    if(result.UI_SCHEME==2 || result.UI_SCHEME==3)
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
      if(result.UI_SCHEME==2 || result.UI_SCHEME==3){
        document.getElementById(`delete ${domain}`).classList.add("hide")
      }
    }
  });
}

function updatePrefScheme3() {
  chrome.storage.local.get(["DOMAINS", "CHECKLIST", "USER_CHOICES", "NPSLIST"], function (result){
    let domains = result.DOMAINS;
    for(let d in domains){
      // by default, do not send GPC signals
      let value = false;
      // if user chose extremely privacy sensitive: send GPC signals
      if (result.USER_CHOICES == "Extremely Privacy-Sensitive") value = true;
      // if user chose not privacy sensitive: do not send GPC signals
      else if (result.USER_CHOICES == "Not Privacy-Sensitive")  {
          value = false;
          if (result.NPSLIST.includes(d)) value = true;
      }
      // if the user chose moderately gpc signals
      else if (result.USER_CHOICES == "Moderately Privacy-Sensitive"){
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

async function updatePrefScheme2() {

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
    body = renderParse(scaffoldTemplate, nonDomainListHeadings, 'scaffold-component'); 
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
      let modal = UIkit.modal("#learning-finish-modal");
      modal.show();
      document.getElementById("learning-finish-modal-button").onclick = function () {modal.hide();} 
      chrome.storage.local.set({"LEARNING": "Completed"});
    }
  })   
}
