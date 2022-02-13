// Class for objects holding information on a potential ad interaction
export class AdEvent {
  constructor(originTabId, targetTabId) {
    let date = new Date();
    this.tabId = originTabId;
    this.targetTabId = targetTabId;
    this.adFrameId = null;
    this.reasoning = null;
    this.adBool = false;
    this.timestamp = date;
    //   firebase.firestore.Timestamp.fromDate(date)
    liveAdEvents[targetTabId] = this;
  }
  removeAdEvent() {
    delete liveAdEvents[this.tabId];
    delete this;
  }
}
