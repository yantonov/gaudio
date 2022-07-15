const search = (node, foundElements, predicate, preprocessValue) => {
    if (node.hasAttributes()) {
        var attrs = node.attributes;
        for(var i = 0; i < attrs.length; ++i) {
            const attrValue = attrs[i].value;
            if (predicate(attrValue + '')) {
                let preprocessedElement = preprocessValue(attrValue);
                if (preprocessedElement != null) {
                    foundElements.push(preprocessedElement);
                }
            }
        }
    }
    const children = node.children;
    for (let i = 0; i < children.length; ++i) {
        search(children[i], foundElements, predicate, preprocessValue);
    }
};

const extractFileName = (url) => {
    const regexp = /[^?]+\/([^?\/]+)\??.*/;
    const match = decodeURI(url).match(regexp);
    if (match) {
        return match[1];
    }
    return url;
};

const toFileDescriptor = (url) => {
    return {
        url: url,
        fileName: extractFileName(url)
    }
};

const unique = (items) => {
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

const preprocessAttributeValue = (protocol, host) => {
    return (value) => {
        if (value.startsWith("https://")) {
            return value;
        }
        if (value.startsWith("http://")) {
            return value;
        }

        // just some data attributes, it's neither relative URL nor absolute URL
        if (!value.startsWith("/")) {
            return null;
        }

        if (value.startsWith("//")) {
            // really strange case, but here is an example
            // url=//open.live.bbc.co.uk/mediaselector/6/redir/version/2.0/mediaset/audio-nondrm-download/proto/https/vpid/p0cd7c8f.mp3
            // example of the page: https://www.bbc.co.uk/programmes/p0cd7h81
            return protocol + value;
        }

        if (!value.startsWith(host)) {
            return host + value;
        }
        return value;
    }
}

const getAudioLinkFilterPredicate = () => {
    const isAudioLinkWithExtension = (extension) => {
        return (value) => {
            return value.endsWith(extension) || value.indexOf(extension + "?") >= 0;
        }
    }
    const extensions = ['mp3', 'm4a', 'ogg', 'mp4'];
    const extensionCheckers = extensions.map(ext => isAudioLinkWithExtension('.' + ext));
    const isAudioLink = (value) => {
        return extensionCheckers.some(fn => fn(value));
    }
    return isAudioLink;
}

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {
        let audioFiles = [];
        const protocol = window.location.protocol;
        const host = window.location.protocol + '//' + window.location.hostname + window.location.port;

        const preprocessValue = preprocessAttributeValue(protocol, host);
        const isAudioLink = getAudioLinkFilterPredicate()

        search(document.documentElement, audioFiles, isAudioLink, preprocessValue);
        for (let i = 0; i < window.frames.length; i++) {
            let frame = window.frames[i];
            // TODO: solve CORS problem for https://datacrunchcorp.com/education-and-ai/
            // https://quillette.com/2022/07/06/james-kirchick-on-secret-city-the-hidden-history-of-gay-washington/
            try {
                search(frame.document.documentElement, audioFiles, isAudioLink, preprocessValue);
            }
            catch (error) {
                console.log(error);
            }
        }

        audioFiles = unique(audioFiles.map(x => toFileDescriptor(x)));
        sendResponse({items: audioFiles})
    }
);
