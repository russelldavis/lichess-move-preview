// Inject the script so we have access to window and dom properties
const script = document.createElement('script');
script.type = "module";
script.src = chrome.runtime.getURL('./content.js');
script.onload = () => script.remove();
document.documentElement.appendChild(script);

// Old way, for an isolated script:
// Dynamically import the main script as a module.
// This allows us to use static imports in the main script.
// See https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension
// import("./content.js");
