(function () {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Thank You Section -->
    	<p><strong>Thank You</strong> to Alexious, Alexjp127, anonik123, Apprent1c3, Arthritic Gamer, Azrael, bachmanis, bahamutus, battdapsycho, Blackread, brinda, Calaiope, CJ, ClipperClip, Cory, Crackborn, Dart1920, deaconivory, deusexmachiatto, Drei, Eleros, EliseArtemia, ennui, Fawx, Ferrrett33, Finya, Gaetan, GGs, Gh0st, Griz, Growltiger, Hexanode, ItsMadManBen, Iyzik, Jerilith, JerryYOJ, jura11, Katoh, keyf, koxi98, Kyler45, lakoor, LeavingUndad, Leet, Lethallan17, Literally Some Cat, lollllll_nope, Lord Kroq-Gar, MaskPlague, McPinkBalls, mfvicli, n7magistrate, Night_Thastus, Orionis, Pan, patchuli, R., rachelcurren, Riderofchaos1337, Rivussy, RobertGK, Sapphire, Shaddoll_Shekhinaga, SieurPersil, Sir_Lith, Styyx - GTS Grandpa, syzygy, umberember, Vektor, Venn, Vulken, wankingSkeever, wroc, The Wonton Cat, xXproud_vampire_serpaXx, and 0ddAngel!
			</p>
			<p><strong>Special Thanks</strong> to Corrupt Bliss, Demognomicon, Discrepancy, J3w3ls, Krispyroll, and SpinPigeon!
			</p>

      <p><strong>Core Advisor — RomatebitegeL</strong><br>
      With enormous gratitude for his many contributions: new test ideas, troubleshooting suggestions, bug fixes, version-update fixes, technical reviews, and general crash-log mentoring.</p>

  `;
  
  // Inject into a target container
  const target = document.getElementById('thank-you-section');
  if (target) {
    target.appendChild(container);
  } else {
    console.warn('Thank You section target not found.');
  }
})();
