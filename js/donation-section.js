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
        <a href="https://www.patreon.com/Phostwood"><img src="./Patreon.png" alt="Support me on Patreon" style="height: 80px; border-width: 5px; border-color: black; border-style: solid;"></a>
        </br>
        <span id="help-me-out">This project needs more patrons.<br></span>
    </div>
    <br>
    <span style="font-size: 2em;">🪙</span> Please <b>consider supporting this project's continued development</b>. With 23,000 all-time users and over 3,000 monthly visitors, the community of financial supporters remains remarkably small — fewer than 45 have ever donated, and just five generous monthly subscribers currently sustain the project. <b>Monthly patrons are especially valued</b> since they provide reliable support for ongoing improvements. Whether you're able to contribute $1 (the cost of a frugal coffee!) or more—as a one-time gift or monthly subscription on <a href="https://ko-fi.com/phostwood">Ko-fi</a> or <a href="https://www.patreon.com/Phostwood">Patreon</a> — your support directly validates and enables future development.<br>
    <br>
    <span style="font-size: 2em;">🪙</span> With over <b>650 hours of ongoing development</b>, this advanced analyzer examines modded Skyrim crash logs to help diagnose and fix 75-90% of crashes with identifiable causes, providing well-researched troubleshooting steps and links. It's currently helping almost 200 different Skyrim modders analyze over 300 crash logs each day, standing apart from other automated analyzers with its advanced diagnoses, detailed troubleshooting steps, and frequent updates.<br>
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
