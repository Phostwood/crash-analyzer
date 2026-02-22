function highestPriorityIndicators(sections) {
  Utils.debuggingLog(['highestPriorityIndicators'], `Function called with sections: ${JSON.stringify(Object.keys(sections))}`);
  
  // Only process Crash Logger SSE logs
  /* DISABLED CODE: 
  if (!sections.hasCrashLoggerSseLog) {
    return '';
  }
  */

  // Must have at least one of these sections with content
  const hasRelevantObjects = sections.relevantObjects && sections.relevantObjects.trim().length > 0;
  const hasStack = sections.stack && sections.stack.trim().length > 0;
  const hasProbableCallstack = sections.probableCallstack && sections.probableCallstack.trim().length > 0;
  const hasRegisters = sections.registers && sections.registers.trim().length > 0;

  Utils.debuggingLog(['highestPriorityIndicators'], `hasRelevantObjects: ${hasRelevantObjects}, hasStack: ${hasStack}, hasProbableCallstack: ${hasProbableCallstack}, hasRegisters: ${hasRegisters}`);

  if (!hasStack && !hasProbableCallstack) {
    Utils.debuggingLog(['highestPriorityIndicators'], `Returning empty string - no stack or probable callstack found`);
    return '';
  }

  let report = `<li><b>🎯 Highest-Confidence Indicators:</b> Many crash logs may appear to have multiple possible causes, but this crash log summary can usually help isolate the most likely cause. Additionally, this summary can be very useful when no helpful diagnoses are found in this report. Below is a "de-noised" and deduped view of the what are typically the most important sections in most crash logs. Entries near the top generally being more significant than those below. Cross-reference these with the "🔎 Files/Elements" above and the listed "Detected indicators" below in this report for additional context. <b>Notes:</b> (<b>1</b>) While these are usually excellent starting points, they won't always point to the cause. (<b>2</b>) Some lines may be especially long and may require scrolling side-to-side to see in full. `;

  if (sections.hasCrashLoggerSseLog) {
    report += `<a href="#" class="toggleButton">⤴️ hide</a><br><br><copypaste class="extraInfo" style="display: list-item;"><pre><code>📌`;
  } else {
    report += `(<b>3</b>) ⚠️This feature is primarily developed for Crash Logger SSE logs, and may be noisier and considerably less insightful with Netscript Framework or Trainwreck logs. <a href="#" class="toggleButton">⤵️ show more</a><copypaste class="extraInfo" style="display:none"><pre><code>📌`;
  }

  // Get filename from the HTML document
  const filenameElement = document.getElementById('filename');
  let displayFilename = '';
  if (filenameElement) {
    const codeElement = filenameElement.querySelector('code');
    if (codeElement) {
      displayFilename = codeElement.textContent.trim();
    }
  }

  Utils.debuggingLog(['highestPriorityIndicators'], `displayFilename: ${displayFilename}`);

  // Add filename to report if found
  if (displayFilename) {
    report += displayFilename + '\n\n';
  }

  // Process first error line - always display with filename and hexcode
  if (sections.firstLine) {
    const summarized = summarizeFirstLine(sections.firstLine);
    Utils.debuggingLog(['highestPriorityIndicators'], `firstLine summarized: ${summarized}`);
    if (summarized !== sections.firstLine) {
      report += 'Summarized <b>First-Line Error:</b>\n	' + summarized + '\n\n';
    } else {
      report += '<b>First-Line Error:</b>\n	' + summarized + '\n\n';
    }
  }

  // Process STACK section (first 300 lines only)
  if (hasStack) {
    report += 'Summarized top of <b>STACK:</b>\n';
    const cleaned = stripNoise(sections.stackTop300); // first 300 lines only
    Utils.debuggingLog(['highestPriorityIndicators'], `STACK cleaned length: ${cleaned.length} chars`);
    const truncated = cleaned.split('\n').slice(0, 20).join('\n'); // Only output 20 lines
    Utils.debuggingLog(['highestPriorityIndicators'], `STACK truncated length: ${truncated.length} chars, lines: ${truncated.split('\n').length}`);
    report += truncated ? truncated + '\n\n' : '	(No significant indicators found)\n\n';
  }

  // Process POSSIBLE RELEVANT OBJECTS section (first 50 lines only)
  // Present in CrashLoggerSSE 1.20.x and NSF logs (absent in 1.19.x and Trainwreck)
  if (hasRelevantObjects) {
    report += 'Summarized <b>POSSIBLE RELEVANT OBJECTS:</b>\n';
    const cleaned = stripNoise(sections.relevantObjectsTop50); // first 50 lines only
    Utils.debuggingLog(['highestPriorityIndicators'], `POSSIBLE RELEVANT OBJECTS cleaned length: ${cleaned.length} chars`);
    const truncated = cleaned.split('\n').slice(0, 10).join('\n'); // Only output 10 lines
    Utils.debuggingLog(['highestPriorityIndicators'], `POSSIBLE RELEVANT OBJECTS truncated length: ${truncated.length} chars, lines: ${truncated.split('\n').length}`);
    report += truncated ? truncated + '\n\n' : '	(No significant indicators found)\n\n';
  }

  // Process PROBABLE CALL STACK section (first 50 lines only)
  if (hasProbableCallstack) {
    report += 'Summarized top of <b>PROBABLE CALL STACK:</b>\n';
    const cleaned = stripNoise(sections.probableCallstackTop50);  // first 50 lines only
    Utils.debuggingLog(['highestPriorityIndicators'], `PROBABLE CALL STACK cleaned length: ${cleaned.length} chars`);
    const truncated = cleaned.split('\n').slice(0, 10).join('\n'); // Only output 10 lines
    Utils.debuggingLog(['highestPriorityIndicators'], `PROBABLE CALL STACK truncated length: ${truncated.length} chars, lines: ${truncated.split('\n').length}`);
    report += truncated ? truncated + '\n\n' : '	(No significant indicators found)\n\n';
  }

  // Process REGISTERS: section (first 50 lines only)
  if (hasRegisters) {
    report += 'Summarized top of <b>REGISTERS:</b>\n';
    const cleaned = stripNoise(sections.registersTop50); // first 50 lines only
    Utils.debuggingLog(['highestPriorityIndicators'], `REGISTERS cleaned length: ${cleaned.length} chars`);
    const truncated = cleaned.split('\n').slice(0, 10).join('\n'); // Only output 10 lines
    Utils.debuggingLog(['highestPriorityIndicators'], `REGISTERS truncated length: ${truncated.length} chars, lines: ${truncated.split('\n').length}`);
    report += truncated ? truncated + '\n' : '	(No significant indicators found)\n';
  }

  report += '</code></pre></copypaste><br></li>';

  report = Utils.highlightFilenames(report);

  Utils.debuggingLog(['highestPriorityIndicators'], `Final report length: ${report.length} chars`);

  return report;
}

function summarizeFirstLine(firstLine) {
  Utils.debuggingLog(['summarizeFirstLine'], `Input firstLine: ${firstLine}`);
  
  // Extract filename and hexcode from the first line
  // Pattern: filename.ext+HEXCODE (e.g., SkyrimSE.exe+0D6DDDA, EngineFixes.dll+002CF91)
  const pattern = /(\w+\.(?:exe|dll))\+([0-9A-Fa-f]+)/i;
  const match = firstLine.match(pattern);

  if (match) {
    const result = match[1] + '+' + match[2];
    Utils.debuggingLog(['summarizeFirstLine'], `Match found: ${result}`);
    return result;
  }

  // If no match found, return entire first line
  Utils.debuggingLog(['summarizeFirstLine'], `No match found, returning empty string`);
  return firstLine;
}

function stripNoise(text) {
  Utils.debuggingLog(['stripNoise'], `Input text length: ${text ? text.length : 0} chars`);
  
  // Process line by line - do ALL processing per line to preserve structure
  const seenLines = new Set();

  let cleaned = text.split('\n')
    .map(line => {
      // Preserve original indentation
      const indent = line.match(/^(\s*)/)[0];
      let content = line.trim();

      // Skip empty lines
      if (content.length === 0) {
        return null;
      }

      const lowerContent = content.toLowerCase();

      // Remove lines with specific patterns
      if (/^Flags:/i.test(content)) return null;
      //if (/^Object Reference:/i.test(content)) return null;
      if (/^FormID:/i.test(content)) return null;
      if (/^Checking TESObjectREFR:/i.test(content)) return null;
      if (/^Checking Parent:/i.test(content)) return null;
      if (/^NiPropertyType:/i.test(content)) return null;

      // Check if line contains any unlikely culprits
      for (const culprit of Utils.unlikelyCulprits) {
        if (lowerContent.includes(culprit.toLowerCase())) {
          return null;
        }
      }

      // Check if line contains any items from removeList
      for (const item of Utils.removeList) {
        if (lowerContent.includes(item)) {
          return null;
        }
      }

      // Now clean this specific line (not across lines!)
      content = content.replace(/\[RSP[\+\-][^\]]*\]/g, '');
      content = content.replace(/0x[0-9A-Fa-f]+/g, '');
      content = content.replace(/\+0x[0-9A-Fa-f]+/gi, '');
      content = content.replace(/\+[0-9A-Fa-f]{3,}/g, '');
      content = content.replace(/\[\s*\d+\s*\]/g, '');
      //content = content.replace(/\s*\([^)]*\*?\)\s*/g, ' ');
      content = content.replace(/\[uint:.*?\]/g, '');
      content = content.replace(/\[int:.*?\]/g, '');
      content = content.replace(/\[[0-9]+\]/g, '');
      content = content.replace(/->\s*\d+/g, '');
      content = content.replace(/Unhandled exception\s+"EXCEPTION_ACCESS_VIOLATION"\s+at\s*/i, '');


      // Remove assembly instructions
      //content = content.replace(/\b(mov|movups|movss|sbb|xor|lea|sub|ret|jmp|je|jne|cmp)\b.*/gi, ''); // excluded and, or, test, and other standalone words

      //Remove other instructions
      //content = content.replace(/\b(qword|ptr|rax|rcx|rbx|nop|shl|al|vmovups|xmm0|\_\_int64)\b.*/gi, '');

      // Clean up extra spaces within the line
      content = content.replace(/\s+/g, ' ').trim();

      // Skip if now too short
      if (content.length <= 3) {
        return null;
      }

      // Remove more lines with specific patterns
      if (/\(size_t\)/i.test(content)) return null;
      if (/\(void\*\)/i.test(content)) return null;

      // Skip duplicates
      if (seenLines.has(content)) {
        return null;
      }
      seenLines.add(content);

      // Return line with original indentation
      return indent + content;
    })
    .filter(line => line !== null)
    .join('\n');

  const finalResult = cleaned.replace(/\s+$/, ''); // only strip trailing whitespace, not leading
  
  Utils.debuggingLog(['stripNoise'], `Output text length: ${finalResult.length} chars, lines kept: ${seenLines.size}`);
  
  return finalResult;
}