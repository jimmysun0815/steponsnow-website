/**
 * 微信内置浏览器引导蒙层
 * 检测到微信 UA 时弹出蒙层，引导用户点击右上角"···"在浏览器打开。
 * 因为微信屏蔽了自定义 scheme（steponsnow://）和大部分应用商店跳转。
 */
(function () {
    if (!/MicroMessenger/i.test(navigator.userAgent)) return;

    var css = ''
        + '@keyframes wxArrowMove{0%,100%{transform:translateY(0)}50%{transform:translateY(12px)}}'
        + '.wx-mask{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:99999;padding:24px;color:#fff;'
        + 'font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;'
        + 'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;animation:wxFade .25s ease-out}'
        + '@keyframes wxFade{from{opacity:0}to{opacity:1}}'
        + '.wx-arrow{position:absolute;top:12px;right:36px;font-size:72px;line-height:1;color:#FFCC00;'
        + 'animation:wxArrowMove 1.4s ease-in-out infinite;text-shadow:0 2px 12px rgba(0,0,0,.4)}'
        + '.wx-title{font-size:20px;font-weight:700;line-height:1.6;margin-top:24px}'
        + '.wx-title .dots{display:inline-block;padding:2px 14px;border-radius:10px;border:1.5px solid #fff;font-weight:800;margin:0 4px;letter-spacing:2px}'
        + '.wx-sub{margin-top:20px;font-size:14px;color:rgba(255,255,255,.75);line-height:1.7;padding:0 32px;max-width:320px}'
        + '.wx-close{margin-top:40px;padding:11px 28px;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.5);border-radius:24px;font-size:14px;cursor:pointer;-webkit-tap-highlight-color:transparent}'
        + '.wx-close:active{background:rgba(255,255,255,.1)}';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    var mask = document.createElement('div');
    mask.className = 'wx-mask';
    mask.innerHTML = ''
        + '<div class="wx-arrow">↗</div>'
        + '<div class="wx-title">请点击右上角 <span class="dots">···</span><br>选择「在浏览器打开」</div>'
        + '<div class="wx-sub">微信不支持直接跳转 App 或应用商店，<br>请在浏览器中打开以正常使用。</div>'
        + '<button class="wx-close" type="button">先看看页面</button>';
    document.body.appendChild(mask);

    mask.querySelector('.wx-close').addEventListener('click', function () {
        mask.style.display = 'none';
    });
})();
