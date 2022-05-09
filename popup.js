window.onload = function() {
    chrome.tabs.query({
        'active': true,
        'currentWindow': true
    }, function(tabs) {
        const tab = tabs[0];
        const page = document.getElementById('url');
        page.append(tab.url);
        const itemsListEl = document.getElementById('audio-list');
        chrome.tabs.sendMessage(
            tab.id,
            {hello: "world"},
            null,
            function(response) {
                const items = response.items;
                for (let i = 0; i < items.length; ++i) {
                    const itemUrl = items[i];

                    const itemEl = document.createElement("div");
                    const itemLink = document.createElement("a");
                    itemLink.setAttribute('href', itemUrl);
                    itemLink.setAttribute('target', '_blank');
                    const textNode = document.createTextNode(itemUrl);
                    itemLink.appendChild(textNode);
                    itemEl.appendChild(itemLink);
                    itemsListEl.appendChild(itemEl)
                }
            }
        );
    });
}
