(function () {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Donation Section -->
    <span style="display: inline-block;">
    <div align="center">
        <a href="https://ko-fi.com/phostwood" target="_blank">
        <span class="kofi-button2">
            <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Support me on Ko-fi">
            <span></span>
        </span>
        </a> &nbsp;
        <a href="https://ko-fi.com/phostwood"><img src="./images/Phostwood Avatar 100x102 - Designer (10).png" alt="Support me on Ko-fi" style="height: 113px; border-width: 5px; border-color: black; border-style: solid;"></a>
        </br>
        <span id="help-me-out">“Spare a septim for a humble crash-log analyzer?” — Phostwood<br></span>
    </div>
    <br>
    <span style="font-size: 2em;">🪙</span> Please consider supporting this project's continued development. With 33,000 all-time users and over 4,500 monthly visitors, the community of financial supporters remains remarkably small — only 55 have ever donated, and <b>just eight generous monthly subscribers currently sustain the project.</b> On <a href="https://ko-fi.com/phostwood">Ko-fi</a> or <a href="https://www.patreon.com/Phostwood">Patreon</a> — your support directly validates and enables future development.<br>
    <br>
    <span style="font-size: 2em;">🪙</span> With over <b>700 hours of ongoing development</b>, this advanced analyzer examines modded Skyrim crash logs to help diagnose and fix 75-90% of crashes with identifiable causes, while providing many well-researched troubleshooting steps and links. It's currently helping over 250 different Skyrim modders analyze almost 400 crash logs each day.<br>
    <br>
    <small><i>Interested in exclusive advertising opportunities? <a href="https://www.reddit.com/r/Phostwood">Get in touch</a>.</i></small>
    <br><br>
    <div id="quote"></div>

    <div align="center">
      <!-- Custom Ko-fi Button -->
      <a href="https://ko-fi.com/phostwood" id="kofi-button" target="_blank">
          <div class="kofi-button">
          <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Support me on Ko-fi">
          <span>Spare a coin on Ko-fi</span>
          </div>
      </a>
    </div>
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
