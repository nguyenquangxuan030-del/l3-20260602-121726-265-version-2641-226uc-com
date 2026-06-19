export function bindMoviePlayer(config) {
    const root = config.root;
    const url = config.url;

    if (!root || !url) {
        return;
    }

    const video = root.querySelector("video");
    const overlay = root.querySelector("[data-player-overlay]");
    let hls;
    let ready = false;

    const load = () => {
        if (!video || ready) {
            return;
        }

        ready = true;
        video.setAttribute("controls", "controls");

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal || !hls) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    hls = null;
                    video.src = url;
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else {
            video.src = url;
        }
    };

    const play = () => {
        load();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        const promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(() => {});
        }
    };

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    if (video) {
        video.addEventListener("click", () => {
            if (!ready || video.paused) {
                play();
            }
        });
    }

    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
