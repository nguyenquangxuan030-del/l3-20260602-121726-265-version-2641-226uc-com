async function attachHls(video, source) {
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    await video.play();
    return;
  }

  const module = await import("./hls-vendor-dru42stk.js");
  const Hls = module.H;

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(function () {
        video.controls = true;
      });
    });
    video._hlsInstance = hls;
    return;
  }

  video.src = source;
  await video.play();
}

document.querySelectorAll("[data-player]").forEach(function (player) {
  const button = player.querySelector("[data-play]");
  const video = player.querySelector("video");

  if (!button || !video) {
    return;
  }

  button.addEventListener("click", async function () {
    const source = button.getAttribute("data-video-src");

    if (!source) {
      return;
    }

    button.classList.add("is-hidden");
    video.controls = true;

    try {
      await attachHls(video, source);
    } catch (error) {
      button.classList.remove("is-hidden");
      button.querySelector("strong").textContent = "点击重试";
      console.error("播放器初始化失败", error);
    }
  });
});
