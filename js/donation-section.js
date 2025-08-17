(function () {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Donation Section -->
    <span style="display: inline-block;">
    <div align="center">
        <a href="https://ko-fi.com/phostwood" target="_blank">
        <div class="kofi-button2">
            <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Support me on Ko-fi">
            <span></span>
        </div>
        </a>
        <span id="help-me-out">Has this tool helped you out?<br>
        If so, can you help me out?<br></span>
    </div>
    <br>
    <span style="font-size: 2em;">🪙</span> Please <b>consider supporting its continued development</b>. Out of 18,000 users, fewer than 40 have ever donated, with only three monthly subscribers currently supporting the project. Even a <b>$1 donation</b> (a frugal coffee!) on <a href="https://ko-fi.com/phostwood">Ko-fi</a> or <a href="https://www.patreon.com/Patreon">Patreon</a> shows your appreciation and helps validate ongoing improvements.<br>
    <br>
    <span style="font-size: 2em;">🪙</span> With over <b>600 hours of ongoing development</b>, this advanced analyzer examines modded Skyrim crash logs to help diagnose and fix 75-90% of crashes with identifiable causes, providing well-researched troubleshooting steps and links. It's currently helping almost 200 different Skyrim modders analyze over 300 crash logs each day, standing apart from other automated analyzers with its advanced diagnoses, detailed troubleshooting steps, and frequent updates.<br>
    <br>
    While <b>not a replacement</b> for talented human crash log readers, it works much faster and can free up these <a href="#footer">rare experts</a> to focus on the more challenging crash logs that require human analysis.<br>
    <br>
    <small><i>Interested in exclusive advertising opportunities? <a href="https://www.reddit.com/r/Phostwood">Get in touch</a>.</i></small>
    <br><br>
    <div id="quote"></div>

    <!-- Custom Ko-fi Button -->
    <a href="https://ko-fi.com/phostwood" id="kofi-button" target="_blank">
        <div class="kofi-button">
        <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Support me on Ko-fi">
        <span>Spare a coin on Ko-fi</span>
        </div>
    </a>
    <br><br>
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
