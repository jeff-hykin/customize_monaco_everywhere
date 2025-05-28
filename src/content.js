const isMacOS = navigator.userAgent.includes('Macintosh') || navigator.userAgent.includes('Mac OS X');

// 
// hackerrank run buttons
// 
if (document.querySelector('.ui-btn.ui-btn-normal.ui-btn-secondary.pull-right.msR.hr-monaco-compile.hr-monaco__run-code.ui-btn-styled')) {
    // ctrl+enter = basic run
    // ctrl+shift+enter = submit
    document.addEventListener('keydown', function(event) {
        if (isMacOS && event.ctrlKey && event.key === 'Enter') {
            document.querySelector('.ui-btn.ui-btn-normal.ui-btn-secondary.pull-right.msR.hr-monaco-compile.hr-monaco__run-code.ui-btn-styled').click();
        }
    })
    document.addEventListener('keydown', function(event) {
        if (isMacOS && event.ctrlKey && event.shiftKey && event.key === 'Enter') {
            document.querySelector('.ui-btn.ui-btn-normal.ui-btn-primary.pull-right.hr-monaco-submit.ui-btn-styled').click();
        }
    })
}

// Inject a script tag into the page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function () {
  this.remove(); // clean up after loading
};
(document.head || document.documentElement).appendChild(script);


