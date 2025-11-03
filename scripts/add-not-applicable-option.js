#!/usr/bin/env node
/**
 * Script pour ajouter l'option "non applicable" à tous les fichiers de tests
 */
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join } from 'path';

const testFiles = await glob('tests/**/*.js', {
  ignore: ['**/utils/**', '**/analyze.js', '**/display.js', '**/observer.js', '**/highlight.js', '**/keyboard-visualization.js']
});

console.log(`Found ${testFiles.length} test files to update`);

for (const file of testFiles) {
  let content = readFileSync(file, 'utf-8');
  let modified = false;
  
  // 1. Ajouter l'option radio "not-applicable" après "not-tested"
  if (content.includes('validationNotTested') && !content.includes('validationNotApplicable')) {
    const notTestedPattern = /(\s+<div class="validation-option">\s+<input type="radio" name="test-\$\{testId\}-validation" id="test-\$\{testId\}-not-tested" value="not-tested"[^>]*>\s+<label for="test-\$\{testId\}-not-tested">\$\{t\('validationNotTested'\)\}<\/label>\s+<\/div>\s+)(<\/div>\s+<\/div>)/;
    if (notTestedPattern.test(content)) {
      content = content.replace(
        notTestedPattern,
        `$1        <div class="validation-option">
          <input type="radio" name="test-\${testId}-validation" id="test-\${testId}-not-applicable" value="not-applicable">
          <label for="test-\${testId}-not-applicable">\${t('validationNotApplicable')}</label>
        </div>
$2`
      );
      modified = true;
    }
  }
  
  // 2. Mettre à jour les fonctions updateXxxStatus pour gérer "not-applicable"
  const updateFunctionPattern = /function update(\w+)Status\(testId, validationValue\) \{[\s\S]*?(else if \(validationValue === 'failed'\) \{[\s\S]*?resultsMessage = t\('statusFailed'\);[\s\S]*?\} else \{[\s\S]*?\/\/ not-tested)/;
  if (updateFunctionPattern.test(content) && !content.includes("validationValue === 'not-applicable'")) {
    content = content.replace(
      /(} else if \(validationValue === 'failed'\) \{[\s\S]*?resultsMessage = t\('statusFailed'\);[\s\S]*?\}) else \{[\s\S]*?\/\/ not-tested/,
      `$1} else if (validationValue === 'not-applicable') {
    testItem.className = 'test-item not-applicable';
    status = 'not-applicable';
    resultsMessage = t('validationNotApplicable');
  } else {
    // not-tested`
    );
    modified = true;
  }
  
  if (modified) {
    writeFileSync(file, content, 'utf-8');
    console.log(`✅ Updated: ${file}`);
  }
}

console.log('Done!');

