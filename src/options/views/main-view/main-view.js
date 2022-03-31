import { fetchTemplate, parseTemplate } from "../../components/util.js";
import { domainlistView } from "../domainlist-view/domainlist-view.js";

// Display the domain list page
export async function mainView(buildList) {
  let docTemplate = await fetchTemplate("./views/main-view/main-view.html");
  const bodyTemplate = await fetchTemplate(
    "./components/scaffold-component.html"
  );
  document.body.innerHTML =
    parseTemplate(docTemplate).getElementById("main-view").innerHTML;
  domainlistView(bodyTemplate, buildList);
  document.querySelector("#main-view-domainlist").classList.add("active");
}
