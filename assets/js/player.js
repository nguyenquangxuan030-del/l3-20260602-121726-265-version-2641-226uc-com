import { H as Hls } from './video-player-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-start]');
    var status = shell.querySelector('[data-player-status]');
    var source = shell.dataset.src;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function startPlayback() {
      if (!video || !source) {
        shell.classList.add('is-error');
        setStatus('当前页面没有可用播放源。');
        return;
      }

      shell.classList.add('is-loading');
      setStatus('正在加载播放源…');

      if (button) {
        button.hidden = true;
      }

      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {
            setStatus('浏览器已加载播放源，请再次点击播放。');
          });
        }, { once: true });
        return;
      }

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          shell.classList.remove('is-loading');
          setStatus('播放源已就绪。');
          video.play().catch(function () {
            setStatus('播放源已就绪，请再次点击播放器播放。');
          });
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            shell.classList.remove('is-loading');
            shell.classList.add('is-error');
            setStatus('播放源加载失败，请检查 m3u8 文件是否存在。');
            hlsInstance.destroy();
            hlsInstance = null;
            if (button) {
              button.hidden = false;
            }
          }
        });
        return;
      }

      shell.classList.add('is-error');
      setStatus('当前浏览器不支持 HLS 播放。');
      if (button) {
        button.hidden = false;
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
  });
});
