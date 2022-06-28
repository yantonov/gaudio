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

const extractFileName = function(url) {
    const regexp = /[^?]+\/([^?\/]+)\??.*/;
    const match = decodeURI(url).match(regexp);
    if (match) {
        return match[1];
    }
    return url;
};

const toFileDescriptor = function(url) {
    return {
        url: url,
        fileName: extractFileName(url)
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
        if (!visited[item.fileName]) {
            visited[item.fileName] = true;
            result.push(item);
        }
    }
    result.sort();
    return result;
}

const preprocessAttributeValue = function(protocol, host) {
    return function(value) {
        if (value.startsWith("//")) {
            return protocol + value;
        }
        if (!value.startsWith(protocol)) {
            return host + value;
        }
        return value;
    }
}

const getAudioLinkFilterPredicate = function() {
    const isAudioLinkWithExtension = function(extension) {
        return function(value) {
            return value.endsWith(extension) || value.indexOf(extension + "?") >= 0;
        }
    }
    const extensions = ['mp3', 'm4a', 'ogg', 'mp4'];
    const extensionCheckers = extensions.map(ext => isAudioLinkWithExtension('.' + ext));
    const isAudioLink = function(value) {
        return extensionCheckers.some(fn => fn(value));
    }
    return isAudioLink;
}


chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log("Message from:" + sender.id);
        let audioFiles = [];
        const protocol = window.location.protocol;
        const host = window.location.protocol + '//' + window.location.hostname + window.location.port;

        const preprocessValue = preprocessAttributeValue(protocol, host);
        const isAudioLink = getAudioLinkFilterPredicate()

        search(document.documentElement, audioFiles, isAudioLink, preprocessValue);
        audioFiles = unique(audioFiles.map(x => toFileDescriptor(x)));
        sendResponse({items: audioFiles})
    }
);
