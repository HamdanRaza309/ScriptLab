function normalizeText(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function normalizeHeading(line) {
  const trimmedLine = String(line || '').trim();

  if (/^Hook:?$/i.test(trimmedLine)) {
    return 'Hook';
  }

  if (/^Setup\/Context:?$/i.test(trimmedLine)) {
    return 'Setup/Context';
  }

  const keySectionMatch = trimmedLine.match(/^Key Section (\d+):?$/i);
  if (keySectionMatch) {
    return `Key Section ${Number(keySectionMatch[1])}`;
  }

  if (/^Conclusion\/CTA:?$/i.test(trimmedLine)) {
    return 'Conclusion/CTA';
  }

  return null;
}

function stripStructureHeadings(text) {
  return normalizeText(text)
    .split('\n')
    .filter((line) => !normalizeHeading(line))
    .join('\n')
    .trim();
}

function countWords(text) {
  const narrationOnly = stripStructureHeadings(text);
  if (!narrationOnly) {
    return 0;
  }

  return narrationOnly.split(/\s+/).filter(Boolean).length;
}

function isWordCountInRange(wordCount, lengthConfig) {
  return wordCount >= lengthConfig.minWords && wordCount <= lengthConfig.maxWords;
}

function parseStructuredSections(text) {
  const sections = {};
  let currentHeading = null;

  for (const rawLine of normalizeText(text).split('\n')) {
    const canonicalHeading = normalizeHeading(rawLine);

    if (canonicalHeading) {
      currentHeading = canonicalHeading;
      if (!sections[currentHeading]) {
        sections[currentHeading] = [];
      }
      continue;
    }

    if (currentHeading) {
      sections[currentHeading].push(rawLine.trim());
    }
  }

  return sections;
}

function validateStructure(text, lengthConfig) {
  const sections = parseStructuredSections(text);
  const issues = [];
  const requiredKeySections = Array.from(
    { length: lengthConfig.keySectionCount },
    (_, index) => `Key Section ${index + 1}`
  );
  const requiredHeadings = [
    'Hook',
    'Setup/Context',
    ...requiredKeySections,
    'Conclusion/CTA',
  ];

  for (const heading of requiredHeadings) {
    if (!sections[heading]) {
      issues.push(`Missing required heading: ${heading}.`);
      continue;
    }

    const contentLines = sections[heading].filter(Boolean);
    if (contentLines.length === 0) {
      issues.push(`Section "${heading}" needs actual narration text.`);
    }
  }

  const hookLines = (sections.Hook || []).filter(Boolean);
  if (hookLines.length > 0 && (hookLines.length < 2 || hookLines.length > 3)) {
    issues.push('Hook must contain 2-3 short lines.');
  }

  const foundKeySections = Object.keys(sections)
    .filter((heading) => /^Key Section \d+$/.test(heading))
    .sort((a, b) => Number(a.split(' ').pop()) - Number(b.split(' ').pop()));

  if (foundKeySections.length !== lengthConfig.keySectionCount) {
    issues.push(
      `Expected exactly ${lengthConfig.keySectionCount} key sections for a ${lengthConfig.minutes}-minute script.`
    );
  }

  return {
    isComplete: issues.length === 0,
    issues,
    sections,
  };
}

module.exports = {
  countWords,
  isWordCountInRange,
  normalizeHeading,
  normalizeText,
  parseStructuredSections,
  stripStructureHeadings,
  validateStructure,
};
