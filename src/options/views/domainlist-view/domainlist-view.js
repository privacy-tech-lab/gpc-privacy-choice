import { renderParse, fetchParse } from '../../components/util.js'
import { buildToggle, toggleListener, permRemoveFromDomainlist } from "../../../domainlist.js";

const headings = {
    title: 'Domain List',
    subtitle: "Toggle which domains you would like to receive Do Not Sell signals"
}

// Creates the event listeners for the `domainlist` page buttons and options
function eventListeners() {
    document.getElementById('searchbar').addEventListener('keyup', filterList )
    createToggleListeners();

    window.onscroll = function() { stickyNavbar() };
    var nb = document.getElementById("domainlist-navbar");
    var sb = document.getElementById("searchbar")
    var sticky = nb.offsetTop;

    // Sticky navbar
    function stickyNavbar() {
      if (window.pageYOffset >= sticky) nb.classList.add("sticky")
      else nb.classList.remove("sticky")
    }
}

// Creates the specific Domain List toggles as well as the perm delete
function createToggleListeners() {
  chrome.storage.local.get(["DOMAINS"], function (result) {
    for (let domain in result.DOMAINS) {
      toggleListener(domain, domain)
      deleteButtonListener(domain)
    }
  });
}

//Creates the buttons and information on default/apply-all setting
function createDeafultSettingInfo(){
  var turn_off_apply_all_button =
  `  <button
        id="apply-all-off-btn"
        class="uk-badge button blue-buttons"
        type="button">
        turn off universal settings
      </button>
      and instead customize your privacy preference for each new domain
      that you visit.

  `
  var dont_allow_all_button =
  `
  <button
    id="dont-allow-all-btn"
    class="uk-badge button blue-buttons"
    type="button"
    style="margin-right: -2px;">
    send do not send signals to all domains
  </button>
  `
  var allow_all_button =
  `
  <button
    id="allow-all-btn"
    class="uk-badge button blue-buttons"
    type="button"
    style="margin-right: -2px;">
    allow all domains to track and sell 
    your information
  </button>
  `
  chrome.storage.local.get(["APPLY_ALL", "ENABLED"], function (result) {
    let apply_all_bool = result.APPLY_ALL;
    if(apply_all_bool){
      if(result.ENABLED){
        var defaultSettingInfo =
        `
        <div class="important-text">
        You have opted to send do not sell signals to all domains, unless otherwise stated in the domain list.
        </div>
        If you would like to change this setting, , but maintain a universal setting, you can choose to
        ${allow_all_button}. 
        Alternatively, you can 
        ${turn_off_apply_all_button}
        <br/>
        <br/>
        You can opt out of sending the signal
        to an individual domain by turning off the domain's switch in the domain list below.
        `
      }
      else{
        var defaultSettingInfo = `
        <div class="important-text"> You have opted to allow all domains to track and sell 
        your information, unless otherwise stated in the domain list. </div>
        If you would like to change this setting, but maintain a universal setting, you can choose to
        ${dont_allow_all_button}.
         Alternatively, you can 
        ${turn_off_apply_all_button}
        <br/>
        <br/>
        You can opt out of allowing an individual domain to
        track and sell your information by 
        turning on the domain's switch in the domain list below.
        `  
      }
    }else{
      var defaultSettingInfo = `
      <div class="important-text"> When you visit a new domain you will be asked
       to choose your privacy preference for that domain. </div>
        If you would like to apply a universal preference to all domains
        that you visit you can choose to
        ${dont_allow_all_button}&nbsp;or ${allow_all_button}.
        <br/>
        <br/>
        You can also change the privacy prefernce made for
        an individual domain by 
        toggling the domain's switch in the domain list below.
        `

    }
    
    document.getElementById('current-apply-all-setting').innerHTML = defaultSettingInfo;
})
}
//add button listeners for default/apply-all setting buttons
function addButtonListeners(){
document.addEventListener('click', event => {
  if (event.target.id=='allow-all-btn'){
      chrome.storage.local.set({DOMAINLIST_ENABLED: false});
      chrome.storage.local.set({APPLY_ALL: true});
      chrome.storage.local.get(["DOMAINS", "ENABLED"], function (result) {
          var new_domains = result.DOMAINS;
          for (let d in new_domains){
              new_domains[d] = false;
          }
          chrome.storage.local.set({ DOMAINS: new_domains });
          chrome.storage.local.set({ ENABLED: false });
          location.reload()
      })
}
  if (event.target.id=='dont-allow-all-btn'){
  chrome.storage.local.set({DOMAINLIST_ENABLED: false});
      chrome.storage.local.set({APPLY_ALL: true});
      chrome.storage.local.get(["DOMAINS"], function (result) {
          var new_domains = result.DOMAINS;
          for (let d in new_domains){
              new_domains[d] = true;
          }
          chrome.storage.local.set({ DOMAINS: new_domains });
          location.reload()
      })
}
  if(event.target.id=='apply-all-off-btn'){
    chrome.storage.local.set({DOMAINLIST_ENABLED: true});
    chrome.storage.local.set({APPLY_ALL: false});
    chrome.storage.local.set({ ENABLED: true });
    location.reload()
}
  if(event.target.id=='toggle_all_on'){
    chrome.storage.local.get(["DOMAINS"], function (result) {
      var new_domains = result.DOMAINS;
      for (let d in new_domains){
          new_domains[d] = true;
      }
      chrome.storage.local.set({ DOMAINS: new_domains });
      location.reload()
  })
}
  if(event.target.id=='toggle_all_off'){
    chrome.storage.local.get(["DOMAINS"], function (result) {
      var new_domains = result.DOMAINS;
      for (let d in new_domains){
          new_domains[d] = false;
      }
      chrome.storage.local.set({ DOMAINS: new_domains });
      location.reload()
  })
  }

  if(event.target.id=='delete_all_domainlist'){
      let delete_prompt = `Are you sure you would like to permanently delete all domain from the Domain List?`
      let success_prompt = `Successfully deleted all domains from the Domain List.
        NOTE: Domains will be automatically added back to the list when the domain is requested again.`
      if (confirm(delete_prompt)) {
        chrome.storage.local.set({ DOMAINS: {} });
      }
      location.reload()
      alert(success_prompt)
    }
;})}

//create buttons to manage entire domainlist at once
function CreateDomainlistManagerButtons(){
  var toggle_domainlist_on =
    `  <button
          id="toggle_all_on"
          class="uk-badge button blue-buttons"
          type="button">
          Toggle All On
        </button>
        `
  var toggle_domainlist_off =
  `  <button
        id="toggle_all_off"
        class="uk-badge blue-buttons button"
        type="button">
        Toggle All Off
      </button>
      `
  var delete_all =
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

  var manger_btns=
  `
  ${toggle_domainlist_on}
  ${toggle_domainlist_off}
  ${delete_all}
  `

  document.getElementById('domainlist-manager-btns').innerHTML = manger_btns;
}


// Delete buttons for each domain
function deleteButtonListener (domain) {
  document.getElementById(`delete ${domain}`).addEventListener("click",
    (async () => {
      let delete_prompt = `Are you sure you would like to permanently delete this domain from the Domain List?`
      let success_prompt = `Successfully deleted ${domain} from the Domain List.
NOTE: It will be automatically added back to the list when the domain is requested again.`
      if (confirm(delete_prompt)) {
        await permRemoveFromDomainlist(domain)
        alert(success_prompt)
        document.getElementById(`li ${domain}`).remove();
      }
  }))
}

// Filterd lists code heavily inspired by
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

// Builds the list of domains in the domainlist, and their respective options, to be displayed
function buildList() {
  let items = ""
  chrome.storage.local.get(["DOMAINS"], function (result) {
    for (let domain in result.DOMAINS) {
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

// Renders the `domain list` view in the options page
export async function domainlistView(scaffoldTemplate) {
    const body = renderParse(scaffoldTemplate, headings, 'scaffold-component')
    let content = await fetchParse('./views/domainlist-view/domainlist-view.html', 'domainlist-view')

    document.getElementById('content').innerHTML = body.innerHTML
    document.getElementById('scaffold-component-body').innerHTML = content.innerHTML

    buildList();
    createDeafultSettingInfo();
    CreateDomainlistManagerButtons();
    eventListeners();
    addButtonListeners();
}