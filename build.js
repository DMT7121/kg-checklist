const fs = require('fs');
const path = require('path');

function build() {
  console.log('Building checklist frontend...');
  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  try {
    // Read source files
    let indexHtml = fs.readFileSync('Index.html', 'utf8');
    const stylesHtml = fs.readFileSync('Styles.html', 'utf8');
    const scriptsHtml = fs.readFileSync('Scripts.html', 'utf8');

    // Replace Apps Script template include tags with actual content
    indexHtml = indexHtml.replace(/<\?!= include\(['"]Styles['"]\);\s*\?>/g, stylesHtml);
    indexHtml = indexHtml.replace(/<\?!= include\(['"]Scripts['"]\);\s*\?>/g, scriptsHtml);

    // Save to dist/index.html
    fs.writeFileSync(path.join('dist', 'index.html'), indexHtml, 'utf8');
    console.log('Successfully compiled Index.html into dist/index.html');
    return true;
  } catch (err) {
    console.error('Build failed:', err);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  build();
}

module.exports = build;
