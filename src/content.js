// it doesn't like opera for some reason
// if (navigator.userAgent.includes(' OPR/')) {
//     var userAgent = navigator.userAgent
//     userAgent = userAgent.replace(/ OPR\/\d+\.\d+\.\d+\.\d+/, '')
//     console.debug(`userAgent is:`,userAgent)
//     Object.defineProperty(navigator, "userAgent", { get() { return userAgent } })
//     const realBrands = navigator.userAgentData.brands
//     console.debug(`realBrands is:`,realBrands)
//     Object.defineProperty(navigator.userAgentData, "brands", { get() { return [ realBrands[0] ] } })
//     const userAgentData = navigator.userAgentData
//     Object.defineProperty(navigator, "userAgentData", { get() { return {...userAgentData, brands: [realBrands[0]]} } })
// }

const script = document.createElement("script")
script.src = chrome.runtime.getURL("injected.js")
script.onload = function () {
    this.remove() // clean up after loading
}
;(document.head || document.documentElement).appendChild(script)