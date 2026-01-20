(function () {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Thank You Section -->
    	<p><strong>Thank You</strong> to Alexious, Alexjp127, anonik123, Arthritic Gamer, Azrael, bachmanis, Blackread, CJ, Crackborn, Demognomicon, Eleros, ennui, Ferrrett33, Finya, Gaetan, GGs, Griz, Hexanode, ItsMadManBen, Iyzik, Jerilith, jura11, J3w3ls, Katoh, keyf, lakoor, Leet, Lethallan17, lollllll_nope, Lord Kroq-Gar, MaskPlague, n7magistrate, Night_Thastus, Orionis, Pan, patchuli, R., rachelcurren, Riderofchaos1337, Rivussy, Shaddoll_Shekhinaga, SieurPersil, Silly Angel, Sir_Lith, syzygy, umberember, Vektor, Venn, Vulken, wankingSkeever, and The Wonton Cat!
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
