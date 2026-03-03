(function () {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- If This Helped You Section -->
    <span style="display: inline-block; width: 100%;">

    <span style="font-size: 2em;">🎉</span> If this analyzer has helped you, here are is an easy way to <b>help us out:</b><br>
    <span style="font-size: 1.5em;">⬇️</span> Download, vote for, and <b>endorse</b> our new <a href="https://www.nexusmods.com/skyrimspecialedition/mods/173224" target="_blank">Phostwood's QLP - MO2 Crash Log Quick-Link Plugin</a> on NexusMods — a two-click <b>shortcut from crash to analysis</b>. Every download and endorsement helps our analyzer reach more people.<br>
    <br>

    <!-- Donation Section -->
    <style>
      .support-images { display: flex; flex-wrap: nowrap; justify-content: center; align-items: center; gap: 8px; }
      .support-images .support-mod-img { height: 180px; display: block; }
      .support-images .kofi-button2 { height: 90px; width: auto; }
      .support-images .kofi-button2 img { height: 90px; width: auto; }
      @media (max-width: 480px) {
        .support-images { flex-direction: column; align-items: center; }
        .support-images .support-mod-img { height: auto; width: min(220px, 80vw); }
        .support-images .kofi-button2 { transform: scale(0.8); }
      }
    </style>
    <div class="support-images">
        <a href="https://www.nexusmods.com/skyrimspecialedition/mods/173224" target="_blank"><img src="https://phostwood.github.io/crash-analyzer/images/QLP-339x339.png" alt="Phostwood's QLP" class="support-mod-img"></a>
        <a href="https://ko-fi.com/phostwood" target="_blank">
          <span class="kofi-button2">
            <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Support me on Ko-fi">
            <span></span>
          </span>
        </a>
        <a href="https://www.nexusmods.com/skyrimspecialedition/mods/173224" target="_blank"><img src="https://phostwood.github.io/crash-analyzer/images/Sovnkrasch-339x339.png" alt="Sovnkrasch" class="support-mod-img"></a>
    </div>
    <div align="center"><span id="help-me-out">"Spare a septim for a humble crash-log analyzer?" — Phostwood<br></span></div>
    <br>
    <span style="font-size: 2em;">🪙</span> There's still a lot more this analyzer could do — and <b>your support</b> is what makes further development possible. Financial backing is currently very thin: <b>only eight monthly patrons</b> sustain the project right now. If this tool has saved you time and frustration, please consider a one-time tip or monthly subscription on <a href="https://ko-fi.com/phostwood">Ko-fi</a>, <a href="https://www.patreon.com/Phostwood">Patreon</a>, or <a href="https://www.paypal.com/paypalme/Phostwood">PayPal</a>. One-time or monthly PayPal donations are also available via my <a href="https://www.nexusmods.com/profile/Phostwood" target="_blank">Nexus profile page</a>. Donations are voluntary, but <b>highly appreciated!</b><br>
    <div id="quote"></div>
    <br>

    </span>

    <!-- Thank You Message -->
    <p id="thank-you-message">"Oh, thank you! Divines bless your kind heart!" 😊</p>
  `;

  // Inject into a target container
  const target = document.getElementById('donation-section');
  if (target) {
    target.appendChild(container);
  } else {
    console.warn('Donation section target not found.');
  }
})();