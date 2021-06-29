import { fetchTemplate, parseTemplate, animateCSS } from "../../components/util.js";
import { domainlistView } from "../domainlist-view/domainlist-view.js";

function displayDomainlist(bodyTemplate) {
    animateCSS("#scaffold", 'fadeOut', async function() {
        document.getElementById('scaffold').remove()
        await domainlistView(bodyTemplate)
        animateCSS("#scaffold", 'fadeIn');
      });
      document.querySelector('.navbar-item.active').classList.remove('active')
      document.querySelector('#main-view-domainlist').classList.add('active')
}

// Display the domain list page
export async function mainView() {
  let docTemplate = await fetchTemplate("./views/main-view/main-view.html");
  const bodyTemplate = await fetchTemplate("./components/scaffold-component.html");
  document.body.innerHTML = parseTemplate(docTemplate).getElementById(
    "main-view"
  ).innerHTML;
  
  domainlistView(bodyTemplate); 
  document
    .querySelector('#main-view-domainlist')
    .classList.add('active')
}