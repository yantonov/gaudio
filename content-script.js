const search = function(node, foundElements, predicate) {
    if (node.hasAttributes()) {
        var attrs = node.attributes;
        for(var i = 0; i < attrs.length; ++i) {
            const attrValue = attrs[i].value;
            if (predicate(attrValue + '')) {
                foundElements.push(attrValue);
            }
        }
    }
    const children = node.children;
    for (let i = 0; i < children.length; ++i) {
        search(children[i], foundElements, predicate);
    }
};


chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log("Message from:" + sender.id);
        let audioFiles = [];
        search(document.documentElement, audioFiles, x => x.endsWith(".mp3") || x.endsWith(".m4a"))
        sendResponse({items: audioFiles})
    }
);

