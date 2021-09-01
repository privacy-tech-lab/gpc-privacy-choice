import { mainView }from './views/main-view/main-view.js'

document.addEventListener('DOMContentLoaded', function(){
    chrome.storage.local.get(["UI_SCHEME"], function(result){
        if (result.UI_SCHEME == 6) mainView(false);
        else mainView(true);
    })
})
