const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('client/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace ANY color using rgba(255,255,255,...) with var(--text-muted)
  content = content.replace(/color:\s*['"]rgba\(255,\s*255,\s*255,\s*[0-9.]+\)['"]/g, "color: 'var(--text-muted)'");
  content = content.replace(/color=['"]rgba\(255,\s*255,\s*255,\s*[0-9.]+\)['"]/g, "color=\"var(--text-muted)\"");
  
  // Replace remaining color: '#fff' or color="#fff" with var(--text) unless it's a specific button or explicitly needed
  // Note: we've already done most, but let's catch edge cases
  content = content.replace(/color=['"]#fff['"]/g, "color=\"var(--text)\"");
  content = content.replace(/color:\s*['"]#fff['"]/g, "color: 'var(--text)'");
  
  // Fix specific borders and backgrounds that were white-glass
  content = content.replace(/border:\s*['"]1px solid rgba\(255,255,255,\s*0\.1\)['"]/g, "border: '1px solid var(--border)'");
  content = content.replace(/border:\s*['"]2px solid rgba\(255,255,255,\s*0\.3\)['"]/g, "border: '2px solid var(--border)'");
  content = content.replace(/background:\s*['"]rgba\(255,255,255,\s*0\.2\)['"]/g, "background: 'var(--bg-2)'");
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
  }
});
