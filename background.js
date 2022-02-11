const iconRules = [{
    conditions: [
        new chrome.declarativeContent.PageStateMatcher({
            pageUrl:  {urlMatches: 'https://*.myshopify.com/admin/transfers/*'},
        })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
}];

chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules(iconRules);
});