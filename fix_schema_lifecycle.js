const fs = require('fs');

const jsFile = 'script.js';
if (fs.existsSync(jsFile)) {
    let jsContent = fs.readFileSync(jsFile, 'utf8');

    const oldLogicRegex = /const schema = document\.getElementById\('productSchema'\);\s*if \(schema\) \{\s*(const productUrl[\s\S]*?)schema\.textContent = JSON\.stringify\(productSchemaData\);\s*\}/;

    const match = jsContent.match(oldLogicRegex);
    if (match) {
        const innerLogic = match[1];
        
        const newLogic = `
  const oldSchema = document.getElementById('productSchema');
  if (oldSchema) oldSchema.remove();

  const newSchema = document.createElement('script');
  newSchema.type = 'application/ld+json';
  newSchema.id = 'productSchema';

  ${innerLogic}
  newSchema.textContent = JSON.stringify(productSchemaData);
  document.head.appendChild(newSchema);
`;
        
        jsContent = jsContent.replace(oldLogicRegex, newLogic.trim());
        fs.writeFileSync(jsFile, jsContent);
        console.log('Fixed script.js lifecycle');
    } else {
        console.log('Regex did not match.');
    }
}
