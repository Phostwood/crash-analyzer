(function () {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Thank You Section -->
    	<p><strong>Thank You</strong> to Alexious, Alexjp127, anonik123, Arthritic Gamer, Azrael, bachmanis, Blackread, CJ, Demognomicon, Eleros, ennui, Ferrrett33, Finya, Gaetan, Griz, Hexanode, ItsMadManBen, Iyzik, Jerilith, J3w3ls, Katoh, keyf, lakoor, Leet, lollllll_nope, Lord Kroq-Gar, MaskPlague, n7magistrate, Orionis, Pan, patchuli, R., rachelcurren, Riderofchaos1337, Rivussy, Shaddoll_Shekhinaga, SieurPersil, syzygy, umberember, Vektor, Vulken, and wankingSkeever!
			</p>
			<p><strong>Special Thanks</strong> to Corrupt Bliss, Discrepancy, Krispyroll, RomatebitegeL, and SpinPigeon!
			</p>
  `;

  // Inject into a target container
  const target = document.getElementById('thank-you-section');
  if (target) {
    target.appendChild(container);
  } else {
    console.warn('Thank You section target not found.');
  }
})();
