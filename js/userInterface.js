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
				pageTitle.textContent = "Phostwood's Skyrim SE Crash Log Analyzer";
				logInstructions.innerHTML = `
				<strong>Find your crash logs at:</strong><br>
				<code id="crashDirectory">${crashDirectory.textContent}</code><br>
				Replace [Skyrim_Directory] with your actual Skyrim installation directory.<br>
				Or, alternately, <a href="#" id="loadTestLog">use the Test Log</a> to simulate almost every possible crash log issue at once.
			`;
			} else if (selectedValue === 'crashlogger') {
				crashDirectory.textContent = '[Skyrim_Directory]\\Data\\SKSE\\Plugins\\CrashLogger\\Logs<br>-OR- [My_Documents]\\My Games\\Skyrim Special Edition\\SKSE';
				pageTitle.textContent = "Phostwood's Skyrim AE Crash Log Analyzer";
				logInstructions.innerHTML = `
				<strong>Find your crash logs at:</strong><br>
				<code id="crashDirectory">${crashDirectory.textContent}</code><br>
				Replace [Skyrim_Directory] with your actual Skyrim installation directory.<br>
				Or, alternately, <a href="#" id="loadTestLog">use the Test Log</a> to simulate almost every possible crash log issue at once.
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
	};
	window.showCopyDiagnosesButton = function () {
		document.getElementById('convert-button').style.display = 'inline-block';
	};

	window.hideH4 = function () {
		document.querySelectorAll('h4').forEach(h4 => h4.classList.add('hidden'));
	};
	window.showH4 = function () {
		document.querySelectorAll('h4').forEach(h4 => h4.classList.remove('hidden'));
	};


	window.clearResult = function () {
		document.getElementById('result').innerHTML = '<code>(click "Anaylze" button to see results)</code><p>&nbsp;</p>';
		document.getElementById('speculation').innerHTML = '';
		document.getElementById('fileFlags').innerHTML = '';
		hideH4();
		hideCopyDiagnosesButton();
		updateLogTypeInfo(); // Update UI based on the reset
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
			if (file.type === 'text/plain') {
				loadFile({ target: { files: [file] } });
			} else {
				console.error('Unsupported file type:', file.type);
				alert('Unsupported file type. Please select a text file (.txt) containing a NetScriptFramework crash log.');
			}
		}
	};

	window.addEmojiClickEvent = function() {
        var elements = document.querySelectorAll('li, details');
        elements.forEach(function (element) {
            var regex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
            var matches = element.textContent.match(regex);
            if (matches) {
                matches.forEach(function (match) {
                    var span = document.createElement('span');
                    span.textContent = match;
                    span.style.cursor = 'pointer';
                    span.style.position = 'relative';
                    span.style.zIndex = '1';
                    element.innerHTML = element.innerHTML.replace(new RegExp(match, 'gu'), span.outerHTML);
                });

                var spans = element.querySelectorAll('span');
                spans.forEach(function (span) {
                    span.addEventListener('click', function (event) {
                        var parentElement = span.closest('li, details');
                        if (parentElement) {
                            var resultsHeader = getResultsHeader();
                            var markdown = convertHTMLToMarkdown(parentElement.outerHTML);
                            var finalMarkdown = resultsHeader + markdown;
                            copyToClipboard(finalMarkdown);
                            alert('Markdown copied to clipboard!');
                        }
                        event.stopPropagation();
                    });
                });
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
	document.getElementById('versionNumber').innerHTML = getVersionNumber();

	var dropZone = document.getElementById('crashLog');
	dropZone.addEventListener('dragover', function (evt) {
		handleDragOver(evt);
		this.classList.add('dragover');
	}, false);
	dropZone.addEventListener('dragleave', function () {
		this.classList.remove('dragover');
	}, false);
	dropZone.addEventListener('drop', function (evt) {
		handleDrop(evt);
		this.classList.remove('dragover');
	}, false);
	dropZone.addEventListener('input', clearResult, false);

	document.getElementById('convert-button').addEventListener('click', function () {
		var resultsHeader = 'Results from [Crash Log Analyzer ' + getVersionNumber() + '](https://phostwood.github.io/crash-analyzer/):\n\n';
		var htmlContent = document.getElementById('result').innerHTML;
		var markdown = convertHTMLToMarkdown(htmlContent);
		var finalMarkdown = resultsHeader + markdown;
		copyToClipboard(finalMarkdown);
		alert('Markdown copied to clipboard!');
	});


	// - - -  "Copy Diagnosis" button - - - 

	// Function to remove "⤵️ show more" links and their associated content from HTML
	window.removeMoreInfoLinks = function(html) {
		// Create a temporary DOM to manipulate the HTML string
		var tempDOM = document.createElement('div');
		tempDOM.innerHTML = html;

		// Remove "⤵️ show more" links and their associated content
		var moreInfoButtons = tempDOM.querySelectorAll('a.toggleButton');
		moreInfoButtons.forEach(function (toggleButton) {
			if (toggleButton.textContent === '⤵️ show more') {
				var liNode = toggleButton;
				while (liNode && liNode.nodeName !== 'LI') { // Keep going up until we find an li ancestor
					liNode = liNode.parentNode;
				}
				if (liNode) {
					// Remove the entire list item that contains the "⤵️ show more" link and its associated content
					liNode.parentNode.removeChild(liNode);
				}
			}
		});

		return tempDOM.innerHTML;
	}

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
				prefix = ' '.repeat(nestingLevel * 2) + prefix;
			}
			return prefix + content.trim() + '\n';
		}
	});

	// Function to convert HTML to Markdown for Discord
	window.convertHTMLToMarkdown = function(html)  {
		html = removeMoreInfoLinks(html);
		html = removeSkipTheseStepsLinks(html);

		// Create a temporary DOM to manipulate the HTML string
		var tempDOM = document.createElement('div');
		tempDOM.innerHTML = html;

		// Remove specific emoji characters (🎯❗❓⚠️)
		//DISABLED:  html = html.replace(/[\uD83C\uDFAF\u2757\u2753\u26A0\uFE0F]/g, '');
		// Remove all non-ASCII characters
		//DISABLED:  html = html.replace(/[^\x00-\x7F]/g, '');

		var markdown = turndownService.turndown(html);
		//replace '\.' with '.' to prevent escaping of periods
		//markdown = markdown.replace(/\\./g, '.');

		// Replace multiple consecutive newline characters with a single newline character
		markdown = markdown.replace(/\n\s*\n/g, '\n');

		// Double up backslashes to prevent escaping
		// markdown = markdown.replace(/\\/g, '\\\\');

		return markdown;
	}


	window.getResultsHeader = function()  {
		return 'Results from [Crash Log Analyzer ' + getVersionNumber() + '](https://phostwood.github.io/crash-analyzer/):\n\n';
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
		// Markdown link to be added at the top of the results
		var resultsHeader = getResultsHeader();
		var htmlContent = document.getElementById('result').innerHTML;
		var markdown = convertHTMLToMarkdown(htmlContent);
		var finalMarkdown = resultsHeader + markdown;
		copyToClipboard(finalMarkdown);
		alert('Markdown copied to clipboard!');
	});


	// Call initial setup functions
	toggleAdvancedElements();
	addEmojiClickEvent();

	window.addEventListener('load', function() {
		// Set all toggleButtons to display as "⤴️ hide"
		document.querySelectorAll('.toggleButton').forEach(function (toggleButton) {
			var extraInfo = toggleButton.nextElementSibling;
			extraInfo.style.display = 'list-item';
			toggleButton.textContent = '⤴️ hide';
		});

		document.body.addEventListener('click', function (event) {
			if (event.target.className === 'toggleButton') {
				var extraInfo = event.target.nextElementSibling;
				if (extraInfo.style.display === 'none') {
					extraInfo.style.display = 'list-item';
					event.target.textContent = '⤴️ hide';
				} else {
					extraInfo.style.display = 'none';
					event.target.textContent = '⤵️ show more';
				}
				event.preventDefault();
			}
		});

		if (window.location.href.toLowerCase().endsWith('?advanced')) {
			document.getElementById('speculativeInsights').checked = true;
		}
	});

	// Add event listener for the Test Log link
	document.getElementById('loadTestLog').addEventListener('click', function(e) {
		e.preventDefault();
		loadAndAnalyzeTestLog();
	});
	
	function loadAndAnalyzeTestLog() {
		Utils.debuggingLog(['userInterface.js'], 'Starting to load test log');
		fetch('https://raw.githubusercontent.com/Phostwood/crash-analyzer/main/Test_Log.txt')
			.then(response => response.text())
			.then(data => {
				Utils.debuggingLog(['userInterface.js'], 'Test log data received, length:', data.length);
				document.getElementById('crashLog').value = data;
				displayFilename('Test_Log.txt');
				return new Promise(resolve => setTimeout(() => resolve(data), 100)); // 100ms delay
			})
			.then((data) => {
				Utils.debuggingLog(['userInterface.js'], 'About to call analyzeLog, textarea value length:', document.getElementById('crashLog').value.length);
				analyzeLog();
				Utils.debuggingLog(['userInterface.js'], 'analyzeLog called');
			})
			.catch(error => console.error('Error loading or analyzing Test Log:', error));
	}
});
