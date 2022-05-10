const search = function(node, foundElements, predicate, preprocessValue) {
    if (node.hasAttributes()) {
        var attrs = node.attributes;
        for(var i = 0; i < attrs.length; ++i) {
            const attrValue = attrs[i].value;
            if (predicate(attrValue + '')) {
                foundElements.push(preprocessValue(attrValue));
            }
        }
    }
    const children = node.children;
    for (let i = 0; i < children.length; ++i) {
        search(children[i], foundElements, predicate, preprocessValue);
    }
};

const unique = function(items) {
    if (!items) {
        return [];
    }
    let visited = {}
    let result = []
    for (var i = 0; i < items.length; ++i) {
        let item = items[i];
        if (!visited[item]) {
            visited[item] = true;
            result.push(item);
        }
    }
    result.sort();
    return result;
}


chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log("Message from:" + sender.id);
        let audioFiles = [];
        const protocol = window.location.protocol;
        const host = window.location.protocol + '//' + window.location.hostname + window.location.port;
        const preprocessValue = function(value) {
            if (value.startsWith("//")) {
                return protocol + value;
            }
            if (!value.startsWith(protocol)) {
                return host + value;
            }
            return value;
        }
        const isAudioLinkWithExtension = function(extension) {
            return function(value) {
                return value.endsWith(extension) || value.indexOf(extension + "?") >= 0;
            }
        }
        const isMp3 = isAudioLinkWithExtension(".mp3");
        const isM4a = isAudioLinkWithExtension(".m4a");
        const isAudioLink = function(value) {
            return isMp3(value) || isM4a(value);
        }
        search(document.documentElement, audioFiles, isAudioLink, preprocessValue);
        audioFiles = unique(audioFiles);
        sendResponse({items: audioFiles})
    }
);

