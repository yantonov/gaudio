const createLink = function(item) {
    const itemUrl = item.url;
    const fileName = item.fileName;
    const itemEl = document.createElement("div");
    const itemLink = document.createElement("a");
    itemLink.setAttribute('href', itemUrl);
    itemLink.setAttribute('target', '_blank');
    const textNode = document.createTextNode(fileName);
    itemLink.appendChild(textNode);
    itemEl.appendChild(itemLink);
    return itemEl;
}

window.onload = function() {
    chrome.tabs.query({
        'active': true,
        'currentWindow': true
    }, function(tabs) {
        const tab = tabs[0];
        const itemsListEl = document.getElementById('audio-list');
        chrome.tabs.sendMessage(
            tab.id,
            {hello: "world"},
            null,
            function(response) {
                if (response) {
                    const items = response.items;
                    for (let i = 0; i < items.length; ++i) {
                        const item = items[i];
                        itemsListEl.appendChild(createLink(item));
                    }
                }
            }
        );
    });
}
