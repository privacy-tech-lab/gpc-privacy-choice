// GPC Privacy Choice is licensed under the MIT License
// Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
// privacy-tech-lab, https://privacytechlab.org/

import { mainView }from './views/main-view/main-view.js'

document.addEventListener('DOMContentLoaded', function(){
    chrome.storage.local.get(["UI_SCHEME"], function(result){
        if (result.UI_SCHEME == 6) mainView(false);
        else mainView(true);
    })
})
