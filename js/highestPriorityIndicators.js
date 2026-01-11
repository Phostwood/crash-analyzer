function highestPriorityIndicators(sections) {
  // Only process Crash Logger SSE logs
  /* DISABLED CODE: 
  if (!sections.hasCrashLoggerSseLog) {
    return '';
  }
  */
  
  // Must have at least one of these sections with content
  const hasStack = sections.stack && sections.stack.trim().length > 0;
  const hasProbableCallstack = sections.probableCallstack && sections.probableCallstack.trim().length > 0;
  const hasRegisters = sections.registers && sections.registers.trim().length > 0;
  
  if (!hasStack && !hasProbableCallstack) {
    return '';
  }
  
  let report = `<li><b>🎯 Highest-Confidence Indicators:</b> Many crash logs may appear to have multiple possible causes, but this crash log summary can usually help isolate the most likely cause. Additionally, this summary can be very useful when no helpful diagnoses are found in this report. Below is a "de-noised" and deduped view of the what are typically the most important sections in most crash logs. Entries near the top generally being more significant than those below. Cross-reference these with the "🔎 Files/Elements" above and the listed "Detected indicators" below in this report for additional context. <b>Notes:</b> (<b>1</b>) While these are usually excellent starting points, they won't always point to the cause. (<b>2</b>) Some lines may be especially long and may require scrolling side-to-side to see in full. `;
  
  if (sections.hasCrashLoggerSseLog) {
    report += `<a href="#" class="toggleButton">⤴️ hide</a><br><br><pre class="extraInfo" style="display: list-item;"><code>`;
  } else {
    report += `(<b>3</b>) ⚠️This feature is primarily developed for Crash Logger SSE logs, and may be noisier and considerably less insightful with Netscript Framework or Trainwreck logs. <a href="#" class="toggleButton">⤵️ show more</a><pre class="extraInfo" style="display:none"><code>`;
  } 

  //TODO FIX THIS?: report += displayFilename(input.files[0].name);
  
  // Process first error line, but only display if significant indicators found
  if (sections.firstLine) {
    const cleaned = stripNoise(sections.firstLine);
    report += cleaned ? 'Summarized <b>First-Line Error:</b>\n' + cleaned + '\n\n' : ''; 
  }

  // Process STACK section (first 300 lines only)
  if (hasStack) {
    report += 'Summarized top of <b>STACK:</b>\n';
    const cleaned = stripNoise(sections.stackTop300); // first 300 lines only
    const truncated = cleaned.split('\n').slice(0, 20).join('\n'); // Only output 20 lines
    report += truncated ? truncated + '\n\n' : '(No significant indicators found)\n\n';
  }
  
  // Process PROBABLE CALL STACK section (first 50 lines only)
  if (hasProbableCallstack) {
    report += 'Summarized top of <b>PROBABLE CALL STACK:</b>\n';
    const cleaned = stripNoise(sections.probableCallstackTop50);  // first 50 lines only
    const truncated = cleaned.split('\n').slice(0, 10).join('\n'); // Only output 10 lines
    report += truncated ? truncated + '\n\n' : '(No significant indicators found)\n\n';
  }

  // Process REGISTERS: section (first 50 lines only)
  if (hasRegisters) {
    report += 'Summarized top of <b>REGISTERS:</b>\n';
    const cleaned = stripNoise(sections.registersTop50); // first 50 lines only
    const truncated = cleaned.split('\n').slice(0, 10).join('\n'); // Only output 10 lines
    report += truncated ? truncated + '\n' : '(No significant indicators found)\n';
  }
  
  report += '</code></pre><br></li>';
  
  report = Utils.highlightFilenames(report);
  
  return report;
}

function stripNoise(text) {
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
  
  return cleaned.replace(/\s+$/, ''); // only strip trailing whitespace, not leading
}