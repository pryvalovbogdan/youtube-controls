console.log("YouTube control content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message in content script:', request);

    if (request.type === "STOP_PLAYING") {
        const mediaEls = [...document.querySelectorAll('video, audio')];

        if (mediaEls.length === 0) {
            console.warn("No video/audio elements found");
        }

        mediaEls.forEach(el => {
            if (!el.paused) {
                console.log("Pausing media element");
                el.pause();
            }
        });

        sendResponse({ status: "paused" });
    }
});
