import { fetchTemplate, parseTemplate, animateCSS } from "../../components/util.js";
import { settingsView } from "../settings-view/settings-view.js";
import { domainlistView } from "../domainlist-view/domainlist-view.js";

// Opens the `Settings` page
async function displaySettings(bodyTemplate) {
    animateCSS("#scaffold", 'fadeOut', async function() {
        document.getElementById('scaffold').remove()
        await settingsView(bodyTemplate)
        animateCSS("#scaffold", 'fadeIn');
      });
      document.querySelector('.navbar-item.active').classList.remove('active')
      document.querySelector('#main-view-settings').classList.add('active')
}

// Opens the `Domainlist` page
function displayDomainlist(bodyTemplate) {
    animateCSS("#scaffold", 'fadeOut', async function() {
        document.getElementById('scaffold').remove()
        await domainlistView(bodyTemplate)
        animateCSS("#scaffold", 'fadeIn');
      });
      document.querySelector('.navbar-item.active').classList.remove('active')
      document.querySelector('#main-view-domainlist').classList.add('active')
}

// Prepares the `Main` page elements and intializes the default `Settings` page
export async function mainView() {
  let docTemplate = await fetchTemplate("./views/main-view/main-view.html");
  const bodyTemplate = await fetchTemplate(
    "./components/scaffold-component.html"
  );
  document.body.innerHTML = parseTemplate(docTemplate).getElementById(
    "main-view"
  ).innerHTML;

  chrome.storage.local.get(["DOMAINLIST_PRESSED"], (result)=> {
    if (!result.DOMAINLIST_PRESSED) {
      settingsView(bodyTemplate); // First page
      document.querySelector('#main-view-settings').classList.add('active')
    } else {
      domainlistView(bodyTemplate); // First page
      chrome.storage.local.set({ DOMAINLIST_PRESSED: false });
      document.querySelector('#main-view-domainlist').classList.add('active')
    }


  document
    .getElementById("main-view-settings")
    .addEventListener("click", () => displaySettings(bodyTemplate));
  document
    .getElementById("main-view-domainlist")
    .addEventListener("click", () => displayDomainlist(bodyTemplate));
  })
}
