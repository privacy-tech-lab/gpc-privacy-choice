//class to locally store info on third party requests when a site is live
export class ThirdPartyData {
  constructor(tabId, url, docId, userDocId) {
    this.count = 0;
    this.sCollection = collection(
      db,
      "users",
      userDocId,
      "Browser History",
      docId,
      "Third Party Requests Summary"
    );
    this.eCollection = collection(
      db,
      "users",
      userDocId,
      "Browser History",
      docId,
      "Third Party Requests (first 50)"
    );
    if (allThirdPartyData[tabId] === undefined) allThirdPartyData[tabId] = {};
    allThirdPartyData[tabId][url] = this;
    this.thirdPartyDomains = {};
    for (let site of Object.keys(allThirdPartyData[tabId])) {
      if (site != url) {
        writeThirdPartyDataToDb(allThirdPartyData[tabId][site]);
        delete allThirdPartyData[tabId][site];
      }
    }
  }
}
