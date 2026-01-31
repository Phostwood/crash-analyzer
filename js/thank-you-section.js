(function () {
  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Thank You Section -->
    	<p><strong>Thank You</strong> to Alexious, Alexjp127, anonik123, Arthritic Gamer, Azrael, bachmanis, battdapsycho, Blackread, CJ, Crackborn, Demognomicon, deusexmachiatto, Eleros, EliseArtemia, ennui, Ferrrett33, Finya, Gaetan, GGs, Griz, Hexanode, ItsMadManBen, Iyzik, Jerilith, jura11, Katoh, keyf, lakoor, Leet, Lethallan17, lollllll_nope, Lord Kroq-Gar, MaskPlague, n7magistrate, Night_Thastus, Orionis, Pan, patchuli, R., rachelcurren, Riderofchaos1337, Rivussy, Sapphire, Shaddoll_Shekhinaga, SieurPersil, Sir_Lith, syzygy, umberember, Vektor, Venn, Vulken, wankingSkeever, The Wonton Cat, and 0ddAngel!
			</p>
			<p><strong>Special Thanks</strong> to Corrupt Bliss, Discrepancy, J3w3ls, Krispyroll, RomatebitegeL, and SpinPigeon!
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
