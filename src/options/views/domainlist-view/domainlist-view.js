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
    eventListeners();
}