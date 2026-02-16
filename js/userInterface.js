document.addEventListener('DOMContentLoaded', function() {
	const logTypeSelect = document.getElementById('logType');
	const downloadLink = document.getElementById('downloadLink');
	
	// Define the Nexus Mods URLs for each crash logging mod
	const modUrls = {
		'crashlogger': 'https://www.nexusmods.com/skyrimspecialedition/mods/59818', // Crash Logger SSE
		'netscript': 'https://www.nexusmods.com/skyrimspecialedition/mods/21294',   // .NET Script Framework
		'trainwreck': 'https://www.nexusmods.com/skyrimspecialedition/mods/106440'   // Trainwreck
	};
	
	// Set initial URL explicitly (not relying on the default value)
	downloadLink.href = modUrls['crashlogger'];
	
	// Update URL when selection changes
	logTypeSelect.addEventListener('change', function() {
		downloadLink.href = modUrls[this.value];
	});
});






// Load crash log from query string parameter or wait for manual input/postMessage
function initializeCrashLogLoader() {
    console.log('[Crash Log Loader] Initializing...');
    
    let crashLogReceived = false;
    
    // Check for query string parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const logUrl = urlParams.get('log');
    
    if (logUrl) {
        loadCrashLogFromUrl(logUrl);
    } else {
        console.log('[Crash Log Loader] No query parameter found, ready for manual input');
        setupPostMessageListener();
    }
    
    // Fetch and insert crash log from Pastebin URL
    async function loadCrashLogFromUrl(pastebinUrl) {
        if (crashLogReceived) return;
        
        try {
            console.log('[Crash Log Loader] Fetching from:', pastebinUrl);
            
            // Extract paste ID
            let pasteId = pastebinUrl.split('pastebin.com/').pop().split('?')[0];
            pasteId = pasteId.replace('raw/', ''); // Remove 'raw/' if present
            
            // Try multiple CORS proxy options
            const proxyUrls = [
                `https://corsproxy.io/?${encodeURIComponent(`https://pastebin.com/raw/${pasteId}`)}`,
                `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://pastebin.com/raw/${pasteId}`)}`,
                `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(`https://pastebin.com/raw/${pasteId}`)}`
            ];
            
            let crashLogContent = null;
            let lastError = null;
            
            // Try each proxy until one works
            for (const proxyUrl of proxyUrls) {
                try {
                    console.log('[Crash Log Loader] Trying proxy:', proxyUrl.split('?')[0]);
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        crashLogContent = await response.text();
                        console.log(`[Crash Log Loader] Success! Fetched ${crashLogContent.length} characters`);
                        break;
                    }
                } catch (err) {
                    lastError = err;
                    console.log('[Crash Log Loader] Proxy failed, trying next...');
                    continue;
                }
            }
            
            if (!crashLogContent) {
                throw lastError || new Error('All proxies failed');
            }
            
            insertCrashLog(crashLogContent, 'Crash Log (from Pastebin)');
            crashLogReceived = true;
            
        } catch (e) {
            console.error('[Crash Log Loader] Failed to fetch:', e);
            
            // Extract paste ID for manual link
            let pasteId = pastebinUrl.split('pastebin.com/').pop().split('?')[0].replace('raw/', '');
            
            const manualMessage = `Failed to automatically load crash log from Pastebin.\n\n` +
                `Please manually copy the crash log from:\n` +
                `https://pastebin.com/raw/${pasteId}\n\n` +
                `Then paste it into the text area below.`;
            
            alert(manualMessage);
        }
    }
    
    // Insert crash log into textarea and analyze
    function insertCrashLog(content, filename) {
        const textarea = document.getElementById('crashLog');
        if (!textarea) {
            console.error('[Crash Log Loader] Textarea not found');
            return;
        }
        
        textarea.value = content;
        console.log('[Crash Log Loader] Crash log inserted');
        
        if (typeof displayFilename === 'function' && filename) {
            displayFilename(filename);
        }
        
        setTimeout(() => {
            if (typeof analyzeLog === 'function') {
                analyzeLog();
            }
        }, 100);
    }
    
    // Set up listener for postMessage (fallback method)
    function setupPostMessageListener() {
        window.addEventListener('message', function(event) {
            if (crashLogReceived) return;
            
            // Accept messages from file:// or null origin
            if (event.origin !== 'null' && !event.origin.startsWith('file://')) {
                return;
            }
            
            const data = event.data;
            
            if (data.type === 'CRASH_LOG_DATA') {
                console.log(`[Crash Log Loader] Received via postMessage: ${data.crashLog.length} chars`);
                crashLogReceived = true;
                
                insertCrashLog(data.crashLog, data.filename);
                
                if (event.source) {
                    event.source.postMessage({ type: 'CRASH_LOG_LOADED' }, event.origin);
                }
            }
        });
        
        // Signal ready to window.opener
        if (window.opener && window.opener !== window) {
            window.opener.postMessage({ type: 'CRASH_LOG_READY' }, '*');
        }
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCrashLogLoader);
} else {
    initializeCrashLogLoader();
}








document.addEventListener('DOMContentLoaded', function () {

	if (Utils.isSkyrimPage) {
		const logTypeSelect = document.getElementById('logType');
		const logInstructions = document.getElementById('logInstructions');
		const crashDirectory = document.getElementById('crashDirectory');
		const pageTitle = document.getElementById('pageTitle');

		function updateLogTypeInfo() {
			const selectedValue = logTypeSelect.value;
			if (selectedValue === 'netscript') {
				crashDirectory.textContent = '[Skyrim_Directory]\\Data\\SKSE\\Plugins\\NetScriptFramework\\Crash';
				pageTitle.textContent = "Phostwood's Skyrim Crash Log Analyzer";
				logInstructions.innerHTML = `
				<strong>Find your crash logs at:</strong><br>
				<code id="crashDirectory">${crashDirectory.textContent}</code><br>
				Replace [Skyrim_Directory] with your actual Skyrim installation directory path.<br>
			`;
			} else if (selectedValue === 'crashlogger') {
				crashDirectory.textContent = '[My_Documents]\\My Games\\Skyrim Special Edition\\SKSE';
				pageTitle.textContent = "Phostwood's Skyrim Crash Log Analyzer";
				logInstructions.innerHTML = `
				<strong>Find your crash logs at:</strong><br>
				<code id="crashDirectory">${crashDirectory.textContent}</code><br>
				Replace [My_Documents] with your actual directory path.<br>
				Crash logs are datetime stamped. For example from January 21: <code>crash-2026-01-21-10-20-23.log</code><br>
			
				<br>
				<b>Log files aren't showing up?</b> <a href="#" class="toggleButton">⤵️ show more</a>
				<ul class="extraInfo" style="display:none">
					<li>Crash Logger SSE logs are dropped one directory up from where Trainwreck logs are dropped. See "<b>Find your crash logs at:</b>" above. Be sure you have checked the correct location.</li>
					<li><b>Add antivirus exclusions:</b> Your antivirus may be blocking or quarantining crash log files. Add an exclusion for the appropriate crash log directory (see "<b>Find your crash logs at:</b>" above) in your antivirus software settings.</li>
					<li><b>Carefully reinstall</b> your crash logging mod. <a href="https://www.nexusmods.com/skyrimspecialedition/mods/59818">Crash Logger SSE</a> is usually the recommended option. <b>Only one</b> crash logging mod may be used, so be sure to remove or disable all other crash logging mods.</li>
					<li><b>Check OneDrive:</b> If your Documents folder is actively syncing, or if OneDrive has glitched and left files locked after syncing, Skyrim may fail to save or load files. 
						See <a href="https://docs.google.com/document/d/1Ot0l8uFv-AJZr1X6vRMQNovhua_NUtE_HhbkrfJi1Ss/edit?tab=t.0">Ways To Get Rid Of OneDrive</a> (Google Doc) and 
						<a href="https://steamcommunity.com/app/489830/discussions/0/2263565217515804221/">Steam Community - Skyrim vs. OneDrive</a>. 
						Where possible, avoid extreme measures like uninstalling OneDrive; instead, adjust sync settings or exclude your Skyrim folders.
					</li>
					<li><b>Verify permissions:</b> Run the game and mod manager with administrator rights. Ensure your Skyrim and Mods folders are not set to read-only.</li>
					<li><b>Check free space:</b> Make sure your SSD or HDD has sufficient free space. Skyrim and SKSE may fail to write saves or cache files if the drive is nearly full. Aim to keep at least several GB free. Ideally, maintain <a href="https://computercity.com/hardware/storage/how-much-space-should-i-leave-on-my-ssd">at least 10-20% free space</a> on your SSD for optimal performance.</li>
					<li>Consider temporarily switching to <b>Trainwreck</b>, as while it usually lacks important indicators, it is sometimes able to output crash logs where others can not.</li>
					<li>Consider trying <a href="https://www.nexusmods.com/skyrimspecialedition/mods/79406">ProcMon - Skyrim Disk Usage Profiles</a> for viewing what mod/data was last loaded before your Skyrim crashed or froze ... reportedly often useful for isolating  crashes/freezes that won't output a crash log.</li>
					<li>Consult <a href="#footer">Skyrim modding communities</a>, as they may have additional advice on dealing with specific types of freezes that don't output crash logs.</li>
				</ul>
			`;
			} else if (selectedValue === 'trainwreck') {
				crashDirectory.textContent = '[My_Documents]\\My Games\\Skyrim Special Edition\\SKSE\\Crashlogs';
				pageTitle.textContent = "Phostwood's Skyrim Crash Log Analyzer";
				logInstructions.innerHTML = `
				<strong>Find your crash logs at:</strong><br>
				<code id="crashDirectory">${crashDirectory.textContent}</code><br>
				Replace [My_Documents] with your actual directory path.<br>
				`;
			}

			
		}
		logTypeSelect.addEventListener('change', updateLogTypeInfo);

		// Initial call to set default state
	} else {
		function updateLogTypeInfo() {
			// Nolvus-specific code (if any)
			// This block can be empty if there's no Nolvus-specific initialization needed
		}
	}
	updateLogTypeInfo();

	// Global functions
	window.getVersionNumber = function () {
		var versionNumber = document.querySelector('meta[name="version"]').getAttribute('content');
		return '(v' + versionNumber + ')';
	};
	document.getElementById('versionNumber').innerHTML = getVersionNumber();

	// Functions to show or hide the "Copy Diagnosis" button based on content
	window.hideCopyDiagnosesButton = function () {
		document.getElementById('convert-button').style.display = 'none';
		document.getElementById('scrollDownInstructions').style.display = 'none';
	};
	window.showCopyDiagnosesButton = function () {
		document.getElementById('convert-button').style.display = 'inline-block';
		document.getElementById('scrollDownInstructions').style.display = 'inline-block';
	};

	window.hideH4 = function () {
		document.querySelectorAll('h4').forEach(h4 => h4.classList.add('hidden'));
	};
	window.showH4 = function () {
		document.querySelectorAll('h4').forEach(h4 => h4.classList.remove('hidden'));
	};


	window.clearResult = function () {
		document.getElementById('result').innerHTML = '<code>(click "Analyze" button to see results)</code><p>&nbsp;</p>';
		document.getElementById('speculation').innerHTML = '';
		document.getElementById('fileFlags').innerHTML = '';
		hideH4();
		hideCopyDiagnosesButton();
		updateLogTypeInfo(); // Update UI based on the reset
		Utils.FilenamesTracker.reset();

		const analyzeButton = document.getElementById('analyzeButton');
		analyzeButton.disabled = false;
		analyzeButton.textContent = 'Analyze';
		//displayQuote();
	};

	window.clearAll = function () {
		document.getElementById('filename').innerHTML = '';
		document.getElementById('crashLog').value = '';
		clearResult();
	};


	window.openLinksInNewTab = function () {
		// Get all anchor elements on the page
		const links = document.querySelectorAll('a');
		
		// Loop through each link and set target to "_blank"
		links.forEach(link => {
			// Check if the href contains the excluded URL
			if (!link.href.includes('phostwood.github.io/crash-analyzer')) {
			link.target = '_blank';
			// Optional: Add rel="noopener noreferrer" for security
			// UNUSED, IS OPEN SOURCE CODE: link.rel = 'noopener noreferrer';
			}
		});
	}


	window.disableAnalyzeButtonAndTrackUniqueCrashLogCount = function () {
		const analyzeButton = document.getElementById('analyzeButton');
		const crashLogContent = document.getElementById('crashLog').value;
		
		if(crashLogContent) {
			analyzeButton.disabled = true;
			analyzeButton.textContent = 'Analyzed...';
			
			// Check if all required features are available
			if (window.crypto && window.crypto.subtle && isLocalStorageAvailable()) {
				// Generate a hash of the crash log content
				generateCrashLogHash(crashLogContent)
					.then(hash => {
						if (!hash) {
							console.log("Hashing failed, not tracking crash_log_submitted_deduped event");
							return;
						}
						
						// Get existing hashes from localStorage or initialize empty array
						let submittedLogs = [];
						try {
							submittedLogs = JSON.parse(localStorage.getItem('submittedCrashLogs') || '[]');
							if (!Array.isArray(submittedLogs)) submittedLogs = [];
						} catch (e) {
							console.warn("Error parsing localStorage data, not tracking crash_log_submitted_deduped event");
							return;
						}
						
						// Check if this hash is new
						if (!submittedLogs.includes(hash)) {
							// Add to submitted logs
							submittedLogs.push(hash);
							// Limit the size of the array to only track most recent 50 crash logs
							if (submittedLogs.length > 50) {
								submittedLogs.shift();
							}
							
							// Try to save back to localStorage
							try {
								localStorage.setItem('submittedCrashLogs', JSON.stringify(submittedLogs));
								
								// Only track if we successfully saved the hash
								if (window.location.hostname !== 'localhost' && !window.location.protocol.startsWith('file:')) {
									gtag('event', 'crash_log_submitted_deduped');
									clarity('set', 'crash_log_submitted_deduped', true);
								} else {
									console.log("crash_log_submitted_deduped prevented since localhost");
								}
								Utils.debuggingLog(['disableAnalyzeButtonAndTrackUniqueCrashLogCount'], submittedLogs);
							} catch (e) {
								console.warn("Failed to save to localStorage, not tracking crash_log_submitted_deduped event");
							}
						} else {
							console.log("crash_log_submitted_deduped prevented since this log was already analyzed");
						}
					})
					.catch(error => {
						console.error("Error in crash log deduplication, not tracking crash_log_submitted_deduped event:", error);
					});
			} else {
				console.log("Required features not available, not tracking crash_log_submitted_deduped event");
			}
		} else {
			analyzeButton.disabled = false;
			analyzeButton.textContent = 'Analyze';
		}
		
		// Helper functions
		function isLocalStorageAvailable() {
			try {
				const test = '__test__';
				localStorage.setItem(test, test);
				localStorage.removeItem(test);
				return true;
			} catch (e) {
				return false;
			}
		}
		
		async function generateCrashLogHash(content) {
			try {
				const encoder = new TextEncoder();
				const data = encoder.encode(content);
				const hashBuffer = await crypto.subtle.digest('SHA-256', data);
				return Array.from(new Uint8Array(hashBuffer))
					.map(b => b.toString(16).padStart(2, '0'))
					.join('');
			} catch (error) {
				console.warn("Hashing failed:", error);
				return null;
			}
		}
	};
	
		

	// - - -  handle drag-and-drop and "Choose File" button  - - - 

	// Functions to handle file selection and load the file content into the textarea
	window.displayFilename = function (fileName) {
		var filenameDisplay = document.getElementById('filename');
		filenameDisplay.innerHTML = '<b>Loaded file:</b> <code>' + fileName + '</code>';
	};

	window.loadFile = function (event) {
		var input = event.target;
		var reader = new FileReader();
		reader.onload = function () {
			document.getElementById('crashLog').value = reader.result;
			displayFilename(input.files[0].name);
			clearResult();
			analyzeLog();
			//displayQuote();
			//never used (too awkward): scrollToDiagnosesHeader();
		};
		reader.onerror = function (event) {
			console.error('File reading error:', event.target.error);
		};
		reader.readAsText(input.files[0]);
	};


	// Function to handle drag and drop with visual feedback, file type validation, and filename display
	window.handleDragOver = function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
	};

	window.handleDrop = function (evt) {
		evt.stopPropagation();
		evt.preventDefault();
		var files = evt.dataTransfer.files;
		if (files.length > 0) {
			var file = files[0];
			if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.log')) {
				loadFile({ target: { files: [file] } });
				// Scroll to top after initiating file load
				window.scrollTo(0, 0);
			} else {
				console.error('Unsupported file type:', file.type);
				alert('Unsupported file type. Please select a text file (.txt) containing a NetScriptFramework crash log.');
			}
		}
	};

	window.addEmojiClickEvent = function() {
		var elements = document.querySelectorAll('li, details, copypaste');
		elements.forEach(function (element) {
			// Combined regex that handles both single emojis and the keycap sequence
			var regex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F989}\u{1FA9B}\u{1F916}]|\u{0031}\u{FE0F}\u{20E3}|\u{0032}\u{FE0F}\u{20E3}|\u{0033}\u{FE0F}\u{20E3}/gu;
			var matches = element.textContent.match(regex);
			if (matches) {
				// Store the original HTML
				var html = element.innerHTML;
				
				// Replace all emojis at once
				matches.forEach(function (match) {
					var span = document.createElement('span');
					span.textContent = match;
					span.style.cursor = 'pointer';
					span.style.position = 'relative';
					span.style.zIndex = '1';
					
					// Escape special regex characters in the match for replacement
					var escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
					html = html.replace(new RegExp(escapedMatch, 'u'), span.outerHTML);
				});
				
				// Update the element's HTML only once
				element.innerHTML = html;

				// Now add event listeners
				var spans = element.querySelectorAll('span');
				spans.forEach(function (span) {
					span.addEventListener('click', function (event) {
						var parentElement = span.closest('li, details, copypaste');
						if (parentElement) {
							// Store the clicked emoji in a variable
							var clickedEmoji = span.textContent;
							
							// Use the shared popup function and pass the emoji
							showFormatSelectionPopup(
								function() { return parentElement.outerHTML; },
								null,
								clickedEmoji  // Pass the emoji that was clicked
							);
						}
						event.stopPropagation();
					});
				});
			}
		});
	};


	
	// Shared function to show format selection popup
	function showFormatSelectionPopup(contentProvider, callback, clickedEmoji = null) {
		// Create the dialog HTML using template literals
		var dialogHTML = `
			<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 1000; display: flex; justify-content: center; align-items: center;">
				<div style="background-color: white; padding: 20px; border-radius: 5px; max-width: 400px; text-align: center;">
					<h3 style="margin-top: 0; color: #333;">Copy to clipboard with markdown formatting for:</h3>
					<div style="display: flex; justify-content: space-around; margin-top: 20px;">
						<button id="redditBtn" style="padding: 8px 16px;">Reddit</button>
						<button id="discordBtn" style="padding: 8px 16px;">Discord</button>
					</div>
					<div style="margin-top: 15px; text-align: center;">
						<input type="checkbox" id="disableMarkdownLinks">
						<label for="disableMarkdownLinks" style="margin-left: 5px; color: #000;">Disable markdown links</label>
					</div>
				</div>
			</div>
		`;
		
		// Create a container for the dialog
		var dialogContainer = document.createElement('div');
		dialogContainer.innerHTML = dialogHTML;
		
		// Append the dialog to the body
		var dialogElement = dialogContainer.firstElementChild;
		document.body.appendChild(dialogElement);
		
		// Get references to the buttons and checkbox
		var redditBtn = dialogElement.querySelector('#redditBtn');
		var discordBtn = dialogElement.querySelector('#discordBtn');
		var disableLinksCheckbox = dialogElement.querySelector('#disableMarkdownLinks');
		
		// Button event handlers
		function handleButtonClick(formatType) {
			document.body.removeChild(dialogElement);
			
			if (formatType === "Reddit") {
				window.redditFormat = true;
			} else {
				window.redditFormat = false;
			}
			
			// Get content from the provided function
			var content = contentProvider();
			var markdown = convertHTMLToMarkdown(content);
			var analyzerCitation = getAnalyzerCitation(formatType, markdown.length, clickedEmoji);
			var finalMarkdown = markdown + analyzerCitation;
			
			// Check if disable markdown links is checked
			if (disableLinksCheckbox.checked) {
				finalMarkdown = finalMarkdown.replace(/\]\(/g, ']:(');
			}
			
			copyToClipboard(finalMarkdown);
			
			// Reset the format flags after copying
			window.redditFormat = false;
			
			// Execute callback if provided
			if (callback && typeof callback === 'function') {
				callback();
			}
		}
		
		redditBtn.addEventListener('click', function() {
			handleButtonClick("Reddit");
		});
		
		discordBtn.addEventListener('click', function() {
			handleButtonClick("Discord");
		});
		
		// Add click event to the overlay to close the dialog
		dialogElement.addEventListener('click', function(e) {
			if (e.target === dialogElement) {
				document.body.removeChild(dialogElement);
			}
		});
	};



	window.toggleAdvancedElements = function() {
		var advancedElements = document.getElementsByClassName('advanced');
		var shouldDisplay = true;
		for (var i = 0; i < advancedElements.length; i++) {
			advancedElements[i].style.display = shouldDisplay ? 'inline-block' : 'none';
		}
	};


	// Setup the event listeners for drag and drop with visual feedback
	// Use the body or a main container as the drop zone
	var dropZone = document.body; // or document.getElementById('mainContainer')
	var crashLogInput = document.getElementById('crashLog');

	dropZone.addEventListener('dragover', function (evt) {
		handleDragOver(evt);
		this.classList.add('dragover');
	}, false);

	dropZone.addEventListener('dragleave', function (evt) {
		// Only remove the class if we're leaving the dropZone itself, not a child
		if (evt.target === this) {
			this.classList.remove('dragover');
		}
	}, false);

	dropZone.addEventListener('drop', function (evt) {
		handleDrop(evt);
		this.classList.remove('dragover');
	}, false);

	// Keep the input event on the actual input field
	crashLogInput.addEventListener('input', clearResult, false);


	// - - -  "Copy Diagnosis" button - - - 


	// Function to remove "⤵️ show more" links and their associated content from HTML
	window.removeMoreInfoLinks = function (html) {
		// If the fragment starts with an LI, give the parser a valid context
		var wrapperNeeded = /^\s*<li[\s>]/i.test(html);
		var tempDOM = document.createElement('div');
		tempDOM.innerHTML = wrapperNeeded ? `<ul>${html}</ul>` : html;

		/**
		 * Find the extraInfo element after a toggle button
		 * Skips over text nodes and <br> tags to find the actual content element
		 */
		function findExtraInfoElement(toggleButton) {
			var node = toggleButton.nextSibling;
			while (node) {
				// Skip text nodes and <br> tags
				if (node.nodeType === Node.TEXT_NODE || 
					(node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR')) {
					node = node.nextSibling;
					continue;
				}
				// Found an element - check if it's extraInfo
				if (node.nodeType === Node.ELEMENT_NODE) {
					if (node.classList && (node.classList.contains('extraInfo') || node.classList.contains('extraInfoOL'))) {
						return node;
					}
					// If we found a different element, also return it (might be PRE without class)
					if (node.tagName === 'PRE' || node.tagName === 'DIV' || node.tagName === 'OL' || node.tagName === 'UL') {
						return node;
					}
				}
				node = node.nextSibling;
			}
			return null;
		}

		/**
		 * Remove all nodes between the toggle button and the target element
		 */
		function removeNodesInBetween(toggleButton, target) {
			let current = toggleButton.nextSibling;
			while (current && current !== target) {
				let next = current.nextSibling;
				current.remove();
				current = next;
			}
		}

		var moreInfoButtons = tempDOM.querySelectorAll('a.toggleButton');
		moreInfoButtons.forEach(function (toggleButton) {
			var buttonText = toggleButton.textContent.trim();
			if (buttonText === '⤵️ show more') {
				// Collapsed: remove the toggle link and its hidden content
				var extraInfoElement = findExtraInfoElement(toggleButton);
				if (extraInfoElement) {
					removeNodesInBetween(toggleButton, extraInfoElement);
					extraInfoElement.remove();
				} else {
					// fallback: remove parent LI
					var node = toggleButton.parentNode;
					while (node) {
						if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'LI') {
							node.remove();
							return;
						}
						node = node.parentNode;
					}
				}
				toggleButton.remove();
			}

			if (buttonText === '⤴️ hide') {
				// Expanded: keep the content, just remove the toggle link itself
				toggleButton.remove();
			}

		});

		// If we wrapped with <ul>, unwrap before returning
		if (wrapperNeeded) {
			var ul = tempDOM.querySelector('ul');
			return ul ? ul.innerHTML : tempDOM.innerHTML;
		}
		return tempDOM.innerHTML;
	};




	// Function to remove "⤴️ hide" links from HTML
	window.removeSkipTheseStepsLinks = function(html)  {
		// Create a temporary DOM to manipulate the HTML string
		var tempDOM = document.createElement('div');
		tempDOM.innerHTML = html;

		// Remove "⤴️ hide" links
		var skipStepsButtons = tempDOM.querySelectorAll('a.toggleButton');
		skipStepsButtons.forEach(function (toggleButton) {
			if (toggleButton.textContent.trim() === '⤴️ hide') {
				toggleButton.remove();
			}
		});

		return tempDOM.innerHTML;
	}


	// Convert the modified HTML to Markdown
	var turndownService = new TurndownService({
		bulletListMarker: '-', // Markdown bullet list marker
		headingStyle: 'atx'    // Markdown heading style
	});

	// Add a rule to handle <a> tags to remove link previews
	turndownService.addRule('noLinkPreview', {
		filter: 'a',
		replacement: function (content, node) {
			return '[' + content + '](' + '<' + node.href + '>' + ')';
		}
	});

	// Add a rule to ignore elements with 'display: none' style
	turndownService.addRule('ignoreHidden', {
		filter: function (node) {
			var style = node.getAttribute('style');
			if (style) {
				var styles = style.split(';').reduce(function (obj, styleDeclaration) {
					var parts = styleDeclaration.split(':');
					if (parts[0] && parts[1]) {
						obj[parts[0].trim()] = parts[1].trim();
					}
					return obj;
				}, {});
				return styles.display === 'none';
			}
			return false;
		},
		replacement: function (content, node) {
			return '';
		}
	});

	// Add a rule to handle <li> tags for proper line breaks and indentation in Discord
	turndownService.addRule('listItem', {
		filter: 'li',
		replacement: function (content, node) {
			var prefix = '- ';
			var parent = node.parentNode;
			if (parent.nodeName === 'OL' || parent.nodeName === 'UL') {
				var nestingLevel = 0;
				while (parent.parentNode) {
					if (parent.parentNode.nodeName === 'LI' && (parent.nodeName === 'OL' || parent.nodeName === 'UL')) {
						nestingLevel++;
					}
					parent = parent.parentNode;
				}
				// Use 3 spaces for Reddit, 2 spaces for Discord
				var multiplier = window.redditFormat ? 3 : 2;
				prefix = ' '.repeat(nestingLevel * multiplier) + prefix;
			}
			return prefix + content.trim() + '\n';
		}
	});

	// Add a rule to exclude `class="no-markdown"` indicated content from markdown text
	// Example: <button class="no-markdown" onclick="navigator.clipboard.writeText(document.getElementById('microcodeCmd').innerText)">Copy to Clipboard</button>
	turndownService.addRule('ignoreNoMarkdown', {
		filter: function (node) {
			return node.nodeType === 1 && node.classList.contains('no-markdown');
		},
		replacement: function () {
			return ''; // strip it out of the Markdown
		}
	});


	
	// Add a rule to convert <pre> blocks into Reddit-style fenced code blocks
	turndownService.addRule('ignoreCodeInsidePre', {
		filter: function (node) {
			return node.nodeName === 'CODE' && node.parentNode.nodeName === 'PRE';
		},
		replacement: function (content, node) {
			return node.textContent;
		}
	});
	turndownService.addRule('preToFencedCode', {
		filter: 'pre',
		replacement: function (content, node) {
			// Extract raw text inside <pre> without Turndown altering it
			const raw = node.textContent || '';

			// Ensure no accidental leading/trailing newlines
			const cleaned = raw.replace(/^\n+|\n+$/g, '');

			return '```\n' + cleaned + '\n```';
		}
	});



	// Function to convert HTML to Markdown for Discord
	window.convertHTMLToMarkdown = function(html) {
		html = removeMoreInfoLinks(html);
		html = removeSkipTheseStepsLinks(html);
	
		// Create a temporary DOM to manipulate the HTML string
		var tempDOM = document.createElement('div');
		tempDOM.innerHTML = html;
	
		var markdown = turndownService.turndown(html);
		
		// Replace multiple consecutive newline characters with a single newline character
		markdown = markdown.replace(/\n\s*\n/g, '\n');
	
		return markdown;
	}


	window.getAnalyzerCitation = function(formatType, markdownLength, clickedEmoji = null)  {
		let analyzerCitation = '';
		
		// If thumbtack emoji was clicked, return short citation format
		if (clickedEmoji === '📌') {
			if(Utils.isSkyrimPage) {
				analyzerCitation = '\n\n~~\n\nSummarized at https://phostwood.github.io/crash-analyzer/skyrim.html';
			} else {
				analyzerCitation = '\n\n~~\n\nSummarized at https://phostwood.github.io/crash-analyzer/';
			}
			Utils.debuggingLog(['userInterface.js'], 'analyzerCitation (thumbtack short format):', analyzerCitation);
			return analyzerCitation;
		}

		//OLD VERSION: if (markdownLength > 1635 && formatType !== "Reddit") {
		if (formatType !== "Reddit") {
			//Help shorten it to fit into Discord posts
			if(Utils.isSkyrimPage) {
				analyzerCitation = '\n\n~~\n\nhttps://phostwood.github.io/crash-analyzer/skyrim.html';
			} else {
				analyzerCitation = '\n\n~~\n\nhttps://phostwood.github.io/crash-analyzer/';
			}
		} else {
			if(Utils.isSkyrimPage) {
				analyzerCitation = '\n\n~~\n\nResult(s) from Phostwood\'s Skyrim Crash Log Analyzer ' + convertHTMLToMarkdown(getVersionNumber()) + '\n\n🔎 Automate analysis of your Skyrim SE/AE crash logs at: \n\nhttps://phostwood.github.io/crash-analyzer/skyrim.html';
			} else {
				analyzerCitation = '\n\n~~\n\nResult(s) from Nolvus Crash Log Analyzer ' + convertHTMLToMarkdown(getVersionNumber()) + '\n\n🔎 Automate analysis of your Nolvus crash logs at: \n\nhttps://phostwood.github.io/crash-analyzer/';
			}
		}
		
		Utils.debuggingLog(['userInterface.js'], 'analyzerCitation:', analyzerCitation);
		return analyzerCitation;
	}
	

	// Function to copy text to clipboard
	window.copyToClipboard = function(text)  {
		var dummy = document.createElement("textarea");
		document.body.appendChild(dummy);
		dummy.value = text;
		dummy.select();
		document.execCommand("copy");
		document.body.removeChild(dummy);
	}

	// Event listener for the "Copy Diagnosis" button
	document.getElementById('convert-button').addEventListener('click', function () {
		// Use the shared popup function
		showFormatSelectionPopup(
			function() { return document.getElementById('result').innerHTML; }
		);
	});





// Call initial setup functions
toggleAdvancedElements();
addEmojiClickEvent();

// FIXED: Call initial setup functions and handle toggle buttons correctly
window.addEventListener('load', function() {
	/**
	 * Helper function to find the extraInfo element after a toggle button
	 * This skips over <br> tags to find the actual content element
	 */
	function findExtraInfoElement(toggleButton) {
		var node = toggleButton.nextSibling;
		while (node) {
			// Skip text nodes and <br> tags
			if (node.nodeType === Node.TEXT_NODE || 
				(node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR')) {
				node = node.nextSibling;
				continue;
			}
			// Found an element
			if (node.nodeType === Node.ELEMENT_NODE) {
				if (node.classList && (node.classList.contains('extraInfo') || node.classList.contains('extraInfoOL'))) {
					return node;
				}
				// Return first element found (might be PRE without class)
				return node;
			}
			node = node.nextSibling;
		}
		return null;
	}

	// Set all toggleButtons to display as "⤴️ hide"
/* UNNECESSARY? (and caused problems with new section: "Log files aren't showing up?")		document.querySelectorAll('.toggleButton').forEach(function (toggleButton) {
		var extraInfo = findExtraInfoElement(toggleButton);
		if (extraInfo) {
			if (extraInfo.classList.contains('extraInfoOL')) {
				extraInfo.style.display = 'block';
			} else {
				extraInfo.style.display = 'list-item';
			}
			toggleButton.textContent = '⤴️ hide';
		}
	}); */

	document.body.addEventListener('click', function (event) {
		if (event.target.className === 'toggleButton') {
			var extraInfo = findExtraInfoElement(event.target);
			if (extraInfo) {
				if (extraInfo.style.display === 'none') {
					if (extraInfo.classList.contains('extraInfoOL')) {
						extraInfo.style.display = 'block';
					} else {
						extraInfo.style.display = 'list-item';
					}
					event.target.textContent = '⤴️ hide';
				} else {
					extraInfo.style.display = 'none';
					event.target.textContent = '⤵️ show more';
				}
			}
			event.preventDefault();
		}
	});

	
	/* UNUSED LEGACY CODE:
	if (window.location.href.toLowerCase().includes('?advanced')) {
		document.getElementById('speculativeInsights').checked = true;
	}
	*/

	// Initialize tryFormIDs checkbox based on URL
	if (Utils.getQueryParams().has('tryFormIDs')) {
		document.getElementById('tryFormIDs').checked = true;
	}

	document.getElementById('tryFormIDs').addEventListener('change', function(e) {
		// Store crashLog before URL change
		saveCrashLogToStorage();
		Utils.setQueryParam('tryFormIDs', e.target.checked);
	});

	// Initialize analyzeFullLog checkbox based on URL
	if (Utils.getQueryParams().has('analyzeFullLog')) {
		document.getElementById('analyzeFullLog').checked = true;
	}

	document.getElementById('analyzeFullLog').addEventListener('change', function(e) {
		// Store crashLog before URL change
		saveCrashLogToStorage();
		Utils.setQueryParam('analyzeFullLog', e.target.checked);
	});	

	// Restore crashLog from storage after page load
	restoreCrashLogFromStorage();
	// Analyze the log after a brief delay
	setTimeout(() => {
		analyzeLog();
	}, 100);
});

/**
 * Stores the crashLog textarea and filename div content to localStorage
 */
function saveCrashLogToStorage() {
	try {
		const crashLogElement = document.getElementById('crashLog');
		const filenameElement = document.getElementById('filename');
		
		if (crashLogElement && crashLogElement.value) {
			localStorage.setItem('urlChange_crashLog', crashLogElement.value);
		}
		
		if (filenameElement && filenameElement.innerHTML) {
			localStorage.setItem('urlChange_filename', filenameElement.innerHTML);
		}
		
		Utils.debuggingLog(['localStorage', 'store'], 
			`Stored crash data: ${crashLogElement?.value.length || 0} chars log, ${filenameElement?.innerHTML.length || 0} chars filename`);
		
	} catch (e) {
		console.warn('localStorage unavailable, skipping crash data storage:', e.name);
	}
}

/**
 * Restores the crashLog textarea and filename div content from localStorage
 */
function restoreCrashLogFromStorage() {
	try {
		const storedLog = localStorage.getItem('urlChange_crashLog');
		const storedFilename = localStorage.getItem('urlChange_filename');
		
		if (!storedLog && !storedFilename) {
			return; // Nothing to restore
		}
		
		Utils.debuggingLog(['localStorage', 'restore'], 
			`Restoring crash data: ${storedLog?.length || 0} chars log, ${storedFilename?.length || 0} chars filename`);
		
		// Restore the textarea value
		if (storedLog) {
			const crashLogElement = document.getElementById('crashLog');
			if (crashLogElement) {
				crashLogElement.value = storedLog;
			}
		}
		
		// Restore the filename div content
		if (storedFilename) {
			const filenameElement = document.getElementById('filename');
			if (filenameElement) {
				filenameElement.innerHTML = storedFilename;
			}
		}
		
		// Clear stored data
		localStorage.removeItem('urlChange_crashLog');
		localStorage.removeItem('urlChange_filename');
		
	} catch (e) {
		// localStorage is corrupted or inaccessible - silently ignore
		console.warn('localStorage unavailable or corrupted, skipping crash data restore:', e.name);
		return;
	}
}




	// Add event listener for the Test Log link
	document.getElementById('loadTestLog').addEventListener('click', function(e) {
		e.preventDefault();
		loadAndAnalyzeTestLog();
	});
	
	function loadAndAnalyzeTestLog() {
		let logTypeSelect = null;
		let selectedValue = "netscriptframework";
		let testLogUrl;
		if (Utils.isSkyrimPage) {
			logTypeSelect = document.getElementById('logType');
			selectedValue = logTypeSelect.value;
		} 
	
		let testFileName = 'TestLogNetScriptFramework1.txt';
		if (selectedValue === 'crashlogger') {
			testFileName = 'TestLogCrashLogger1.txt';
		} else if (selectedValue === 'trainwreck') {
			testFileName = 'TestLogTrainwreck1.txt';
		}

		Utils.debuggingLog(['loadAndAnalyzeTestLog', 'userInterface.js'], 'testFileName:', testFileName );
		testLogUrl = 'https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/' + testFileName;
	
		Utils.debuggingLog(['loadAndAnalyzeTestLog', 'userInterface.js'], 'Starting to load test log');
		fetch(testLogUrl)
			.then(response => response.text())
			.then(data => {
				Utils.debuggingLog(['loadAndAnalyzeTestLog', 'userInterface.js'], 'Test log data received, length:', data.length);
				document.getElementById('crashLog').value = data;
				displayFilename(testFileName);
				return new Promise(resolve => setTimeout(() => resolve(data), 100)); // 100ms delay
			})
			.then((data) => {
				Utils.debuggingLog(['loadAndAnalyzeTestLog', 'userInterface.js'], 'About to call analyzeLog, textarea value length:', document.getElementById('crashLog').value.length);
				analyzeLog();
				//displayQuote();
				//never used (too awkward):  scrollToDiagnosesHeader();
				Utils.debuggingLog(['loadAndAnalyzeTestLog', 'userInterface.js'], 'analyzeLog called');
			})
			.catch(error => console.error('Error loading or analyzing Test Log:', error));
	}

  

// Function to display cycling quotes
function displayQuote() {
    // Array of quote objects with their respective NPCs
    const quotes = [
        { text: "Spare a coin? Talos rewards the generous.", npc: "Silda the Unseen" },
        { text: "I ain't askin' for much, just a few septims.", npc: "Silda the Unseen" },
        { text: "Can you spare a septim?", npc: "Noster Eagle-Eye" },
        { text: "A septim is all I ask. Is that so bad?", npc: "Edda of Riften" },
        { text: "A few septims for my supper is all I ask.", npc: "Silda the Unseen" },
        { text: "The Divines smile on those who show mercy an' charity.", npc: "Silda the Unseen" },
        { text: "A few septims ain't nothing. You can spare that, can't you?", npc: "Silda the Unseen" }
    ];

    let currentQuoteIndex = 0;
    let intervalId; 

    function updateQuote() {
        const quote = quotes[currentQuoteIndex];
        const quoteElement = document.getElementById('quote');
        
        if (quoteElement) {
            quoteElement.style.opacity = 0;
            
            setTimeout(() => {
                quoteElement.innerHTML = `
                    <p>"${quote.text}"</p>
                    <p class="attribution">- ${quote.npc}</p>
                `;
                quoteElement.style.opacity = 1;
                
                currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            }, 1000);
        }
    }

    // Initial quote display
    updateQuote();
    
    // Set interval for quote cycling
    intervalId = setInterval(updateQuote, 10000); // Defaults to 10 seconds until stopped with thank you message

    // Modify the showThankYouMessage function to clear the interval
    const originalShowThankYou = showThankYouMessage;
    showThankYouMessage = function() {
        clearInterval(intervalId); // Stop the quote cycling
        originalShowThankYou(); // Call the original function
    };
}

// Function to display the thank you message
function showThankYouMessage() {
    const message = document.getElementById('thank-you-message');
    if (message) {
        message.classList.add('show');
        // Smooth scroll to the thank you message
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Add event listener to the Ko-fi button
const kofiButton = document.getElementById('kofi-button');
if (kofiButton) {
    kofiButton.addEventListener('click', function() {
        showThankYouMessage();
    });
}

// Initialize the quote display
displayQuote();
openLinksInNewTab();

});
