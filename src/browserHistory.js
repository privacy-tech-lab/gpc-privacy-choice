/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

chrome.runtime.sendMessage({greeting:"NEW PAGE", site: window.location.href, referrer: document.referrer})
