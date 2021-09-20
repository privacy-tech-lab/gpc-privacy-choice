/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

window._3rd_party_test_step1_loaded = function(){
    // At this point, a third-party domain has now attempted to set a cookie (if all went to plan!)
    var step2Url = 'https://gpc-privacy-choice-cookie-test.herokuapp.com/step2.php',
        resultsEl = document.getElementById('3rd_party_cookie_test_results'),
        step2El = document.createElement('script');
  
    // Update loading / results message
    resultsEl.innerHTML = 'Stage one complete, loading stage 2&hellip;';
    // And load the second part of the test (reading the cookie)
    step2El.setAttribute('src', step2Url);
    resultsEl.appendChild(step2El);
}

window._3rd_party_test_step2_loaded = function(cookieSuccess){
    var resultsEl = document.getElementById('3rd_party_cookie_test_results');
    // Show message
    resultsEl.innerHTML = (cookieSuccess ? 'Third party cookies are <b>functioning</b> in your browser.' : 'Third party cookies appear to be <b>disabled</b>.');

    // Done, so remove loading class
    resultsEl.className = resultsEl.className.replace(/\bloading\b/,' ');
}