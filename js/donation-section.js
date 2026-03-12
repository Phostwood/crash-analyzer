(function () {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- If This Helped You Section -->
    <span style="display: inline-block; width: 100%;">

    <span style="font-size: 2em;">🎉</span> If this analyzer has helped you, here's an easy way to <b>give back:</b><br>

    <span style="font-size: 1.5em;">⬇️</span> Download, vote for, and <b>endorse</b> our <b>"Quick Link" Plugins (QLP)</b> on NexusMods — featuring <b>zero-click analysis</b> that automatically detects new crash logs when Skyrim crashes and launches the analyzer with your report ready in seconds. It can also generate a shareable link, even for especially large crash logs.<br>
    

    <!-- QLP Mod Links -->
    <style>
      .qlp-mods { display: flex; justify-content: center; gap: 24px; align-items: center; margin: 12px 0; }
      .qlp-mods a { text-align: center; text-decoration: none; }
      .qlp-mods img { height: 124px; width: auto; display: block; margin: 0 auto 6px auto; }
      .kofi-wrap { display: flex; justify-content: center; margin: 12px 0; }
      .kofi-button2 { height: 90px; width: auto; }
      .kofi-button2 img { height: 90px; width: auto; }
      @media (max-width: 480px) {
        .qlp-mods { flex-direction: column; }
        .kofi-button2 { transform: scale(0.8); }
      }
    </style>
    <div class="qlp-mods">
      <a href="https://www.nexusmods.com/skyrimspecialedition/mods/173224" target="_blank">
        <img src="images/MO2-logo.png" alt="Mod Organizer 2">
        Phostwood's QLP for MO2
      </a>
      <a href="https://www.nexusmods.com/skyrimspecialedition/mods/174063" target="_blank">
        <img src="images/Vortex-logo.png" alt="Vortex">
        Phostwood's QLP for Vortex
      </a>
    </div>
    <br>
    <br>
    <div align="center"><span id="help-me-out">"Spare a septim for a humble crash-log analyzer?" — Phostwood<br></span></div>
    <span style="font-size: 2em;">🪙</span> There's still a lot more this analyzer could do — and <b>your support</b> is what makes further development possible. Financial backing is currently very thin: <b>only eight monthly patrons</b> sustain the project right now. If this tool has saved you time and frustration, please consider a one-time tip or monthly subscription on <a href="https://ko-fi.com/phostwood">Ko-fi</a>, <a href="https://www.patreon.com/Phostwood">Patreon</a>, or <a href="https://www.paypal.com/paypalme/Phostwood">PayPal</a>. One-time or monthly PayPal donations are also available via my <a href="https://www.nexusmods.com/profile/Phostwood" target="_blank">Nexus profile page</a>. Donations are voluntary, but <b>highly appreciated!</b><br>
    <div class="kofi-wrap">
      <a href="https://ko-fi.com/phostwood" target="_blank">
        <span class="kofi-button2">
          <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Support me on Ko-fi">
          <span></span>
        </span>
      </a>
    </div>
    <div id="quote"></div>
    <br>

    </span>

    <!-- Thank You Message -->
    <p id="thank-you-message">"Oh, thank you! Divines bless your kind heart!" 😊</p>
  `;

  const target = document.getElementById('donation-section');
  if (target) {
    target.appendChild(container);
  } else {
    console.warn('Donation section target not found.');
  }
})();