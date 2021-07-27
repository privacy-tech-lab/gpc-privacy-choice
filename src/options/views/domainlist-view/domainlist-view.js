// OptMeowt-Research is licensed under the MIT License
// Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
// privacy-tech-lab, https://privacytechlab.org/

import { renderParse, fetchParse } from '../../components/util.js'
import { buildToggle, toggleListener, permRemoveFromDomainlist, allOn, allOff} from "../../../domainlist.js";

const headings = {
    title: 'Domain List',
    subtitle: "Toggle which domains you would like to receive Do Not Sell signals"
}

// Creates the event listeners for the `domainlist` page buttons and options
function addEventListeners() {
  document.getElementById('searchbar').addEventListener('keyup', filterList);
  document.addEventListener('click', event => {
    if (event.target.id=='toggle_all_off' && document.getElementById("apply_to_all").checked){
      let toggleOff_prompt = `Are you sure you would like to toggle off the GPC setting for all sites in your domain list?
      NOTE: Your current preferences will be permanently lost.`
      if (confirm(toggleOff_prompt)) {
        chrome.storage.local.get(["DOMAINS", "ENABLED"], function (result) {
            if (allOn(result.DOMAINS) === false && allOff(result.DOMAINS) === false) {
              chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Personalized domain list" , newSetting: "Allow tracking", universalSetting: "Allow all"})
            }
            else if (allOn(result.DOMAINS) === true) {
              chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Don't Allow Tracking" , newSetting: "Allow tracking", universalSetting: "Allow all"})
            }
            else {
              chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Allow tracking" , newSetting: "No change", universalSetting: "Allow all"})
            }
            let new_domains = result.DOMAINS;
            for (let d in new_domains){
                new_domains[d] = false;
            }
            chrome.storage.local.set({DOMAINLIST_ENABLED: false});
            chrome.storage.local.set({UV_SETTING: "Allow all"});
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
    if (event.target.id=='toggle_all_on' && document.getElementById("apply_to_all")){
      let toggleOn_prompt = `Are you sure you would like to toggle on the GPC setting for all sites in your domain list?
      NOTE: Your current preferences will be permanently lost.`
      if (confirm(toggleOn_prompt)) {
        chrome.storage.local.set({DOMAINLIST_ENABLED: false});
          chrome.storage.local.set({APPLY_ALL: true});
          chrome.storage.local.get(["DOMAINS"], function (result) {
              if (allOff(result.DOMAINS) === false && allOn(result.DOMAINS) === false) {
                chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC signal", prevSetting: "Personalized domain list" , newSetting: "Don't allow tracking", universalSetting: "Don't allow all"})
              }
              else if (allOff(result.DOMAINS) === true) {
                chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC signal", prevSetting: "Allow Tracking" , newSetting: "Don't allow tracking", universalSetting: "Don't allow all"})
              }
              else {
                chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Don't allow tracking", newSetting: "No change", universalSetting: "Don't allow all"})
              }
              let new_domains = result.DOMAINS;
              for (let d in new_domains){
                  new_domains[d] = true;
              }
              chrome.runtime.sendMessage
                  ({greeting:"UPDATE CACHE", newEnabled:true , newDomains: new_domains , newDomainlistEnabled: false })
              chrome.storage.local.set({ DOMAINS: new_domains });
              chrome.storage.local.set({UV_SETTING: "Don't allow all"});
              chrome.storage.local.set({ ENABLED: true });
              createList();
              createDefaultSettingInfo();
              document.getElementById("apply_to_all").checked=false
              addToggleListeners();
        })
      }
      else document.getElementById("apply_to_all").checked=false
  }
    if(event.target.id=='apply-all-off-btn'){
      chrome.storage.local.get(["UV_SETTING"], function (result) {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Universal Setting", prevSetting: result.UV_SETTING , newSetting: "Off", universalSetting: "Off"})
      })
      chrome.storage.local.set({DOMAINLIST_ENABLED: true});
      chrome.storage.local.set({UV_SETTING: "Off"});
      chrome.storage.local.set({APPLY_ALL: false});
      chrome.storage.local.set({ ENABLED: true });
      chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled:true , newDomains: 'dontSet' , newDomainlistEnabled: true })
      createDefaultSettingInfo();
  }
    if(event.target.id=='toggle_all_on'&& !document.getElementById("apply_to_all")){
      let toggleOn_prompt = `Are you sure you would like to toggle on the GPC setting for all sites in your domain list?
      NOTE: Your current preferences will be permanently lost.`
      if (confirm(toggleOn_prompt)) {
        chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result) {
          if (allOff(result.DOMAINS) === false && allOn(result.DOMAINS) !== true) {
            chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC signal", prevSetting: "Personalized domain list" , newSetting: "Don't allow tracking", universalSetting: result.UV_SETTING })
          }
          if (allOff(result.DOMAINS) === true) {
            chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC signal", prevSetting: "Allow Tracking" , newSetting: "Don't allow tracking", universalSetting: result.UV_SETTING})
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
    if(event.target.id=='toggle_all_off'&& !document.getElementById("apply_to_all").checked){
      let toggleOff_prompt = `Are you sure you would like to toggle off the GPC setting for all sites in your domain list?
      NOTE: Your current preferences will be permanently lost.`
      if (confirm(toggleOff_prompt)) {
        chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result) {
          if (allOn(result.DOMAINS) === false && allOff(result.DOMAINS) !== true) {
            chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC Signal", prevSetting: "Personalized domain list" , newSetting: "Allow tracking", universalSetting: result.UV_SETTING})
          }
          if (allOn(result.DOMAINS) === true) {
            chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "GPC Signal", prevSetting: "Don't Allow Tracking" , newSetting: "Allow tracking", universalSetting: result.UV_SETTING})
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
  
    if(event.target.id=='delete_all_domainlist'){
        let delete_prompt = `Are you sure you would like to permanently delete all domains from the Domain List? NOTE: Domains will be automatically added back to the list when the domain is requested again.`
        if (confirm(delete_prompt)) {
          chrome.storage.local.get(["UV_SETTING"], function (result) {
            chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains", setting: "Delete domain", prevSetting: null, newSetting: null, universalSetting: result.UV_SETTING})
          })
          chrome.storage.local.set({ DOMAINS: {} });
          chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled: 'dontSet', newDomains: {} , newDomainlistEnabled: 'dontSet' })
        }
        createList();
        addToggleListeners();
      }
  ;});
  addToggleListeners();
}

// Creates the specific Domain List toggles as well as the perm delete
function addToggleListeners() {
  chrome.storage.local.get(["DOMAINS"], function (result) {
    for (let domain in result.DOMAINS) {
      toggleListener(domain, domain)
      deleteButtonListener(domain)
    }
  });
}

// Delete buttons for each domain
function deleteButtonListener (domain) {
  document.getElementById(`delete ${domain}`).addEventListener("click",()=>{
        permRemoveFromDomainlist(domain)
        document.getElementById(`li ${domain}`).remove();
})}

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

// Create HTML for the buttons and information on default/apply-all setting
function createDefaultSettingInfo(){
  let turn_off_apply_all_button =
  `
  <button
      uk-tooltip="title: You will be asked to choose your privacy preference for each new domain that you visit.;
        pos: right"
      id="apply-all-off-btn"
      class="uk-badge button blue-buttons"
      type="button">
      Turn Off Apply All Setting
    </button>

  `
  let dont_allow_all_button =
  `
    <button
      uk-tooltip="title: All domains (new and old) that you visit will recieve Do Not Sell signals. This will toggle on the setting of all domains in your domain list.;
        pos: right"
      id="dont-allow-all-btn"
      class="uk-badge button blue-buttons"
      type="button"
      style="margin-right: -2px;">
      Don't Allow Any Domain to Track and Sell
    </button>
  `

  let allow_all_button =
  `
    <button
      uk-tooltip="title: All domains (new and old) that you visit will be permitted to track and sell your information. This will toggle off the setting of all domains in your domain list.;
        pos: right"
      id="allow-all-btn"
      class="uk-badge button blue-buttons"
      type="button"
      style="margin-right: -2px;">
      Allow All Domains to Track and Sell
    </button>
  </div>
  `
  chrome.storage.local.get(["APPLY_ALL", "ENABLED"], function (result) {
    let apply_all_bool = result.APPLY_ALL;

    let defaultSettingInfo;
    if(apply_all_bool){
      if(result.ENABLED){
        defaultSettingInfo =
        `
        <div class="important-text">
        You have opted to send do not sell signals to all domains, unless otherwise stated in the domain list.
        </div>
        You can opt out of sending the signal
        to an individual domain by turning off the domain's switch in the domain list below or apply a
        different setting to all current and future domains.
        `
      }
      else{

        defaultSettingInfo = `
        <div class="important-text"> You have opted to allow all domains to track and sell 
        your information, unless otherwise stated in the domain list. </div>
        You can opt out of allowing an individual domain to
        track and sell your information by 
        turning on the domain's switch in the domain list below or apply a differnt setting to all current and future
        domains.
        `  
      }
    }else{
      defaultSettingInfo = `
      <div class="important-text"> When you visit a new domain you will be asked
       to choose your privacy preference for that domain. </div>
      You can change the privacy preference made for
      an individual domain by 
      toggling the domain's switch in the domain list below or you can choose a setting to apply to all
      current and future domains.
      `

    }
    
    document.getElementById('current-apply-all-setting').innerHTML = defaultSettingInfo;
})
}

// Create HTML for buttons to manage entire domainlist at once
function createDomainlistManagerButtons(){
  let toggle_domainlist_on =
    `  <button
          id="toggle_all_on"
          class="uk-badge button blue-buttons"
          type="button">
          Toggle All On
        </button>
        `
  let toggle_domainlist_off =
  `  <button
        id="toggle_all_off"
        class="uk-badge blue-buttons button"
        type="button">
        Toggle All Off
      </button>
      `
  let delete_all =
  `  <button
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
            float: right;
          "
        class="uk-badge button"
        type="button">
        Delete All
      </button>
      `
  let apply_to_all=
  `
  <label><input id="apply_to_all" type="checkbox">Apply To All Future Domains As Well</label>
  `


  let manager_btns=
  `
  ${toggle_domainlist_on}
  ${toggle_domainlist_off}
  ${apply_to_all}
  ${delete_all}
  `

  document.getElementById('domainlist-manager-btns').innerHTML = manager_btns;
}

// Create HTML for displaying the list of domains in the domainlist, and their respective options
function createList() {
  let items = ""
  chrome.storage.local.get(["DOMAINS"], function (result) { 
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
  });
}

function createWalkThroughTour() {
  chrome.storage.local.get(["FIRST_INSTALLED"], function (result){
    if (result.FIRST_INSTALLED){
      let modal = UIkit.modal("#welcome-modal");
      modal.show();
      document.getElementById("modal-button").onclick = function () {
        modal.hide();
      }
    }
  });
  chrome.storage.local.set({FIRST_INSTALLED: false});
}

// Renders the `domain list` view in the options page
export async function domainlistView(scaffoldTemplate) {
    const body = renderParse(scaffoldTemplate, headings, 'scaffold-component')
    let content = await fetchParse('./views/domainlist-view/domainlist-view.html', 'domainlist-view')

    document.getElementById('content').innerHTML = body.innerHTML
    document.getElementById('scaffold-component-body').innerHTML = content.innerHTML

    createDefaultSettingInfo();
    createDomainlistManagerButtons();
    createList();
    createWalkThroughTour();
    addEventListeners();
}