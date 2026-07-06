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
  
  // Fix search box and forms
  content = content.replace(/color:\s*'#fff'/g, "color: 'var(--text)'");
  content = content.replace(/color:\s*"#fff"/g, "color: 'var(--text)'");
  content = content.replace(/color:\s*'rgba\(255,\s*255,\s*255,\s*0\.6\)'/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*'rgba\(255,255,255,0\.6\)'/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*'rgba\(255,255,255,0\.5\)'/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*'rgba\(255,255,255,0\.65\)'/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*'rgba\(255,255,255,0\.7\)'/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*'rgba\(255,255,255,0\.85\)'/g, "color: 'var(--text-muted)'");
  
  // Backgrounds that were semi-transparent white (glass on dark) should be semi-transparent dark (glass on light)
  content = content.replace(/background:\s*'rgba\(255,255,255,0\.1\)'/g, "background: 'var(--bg-2)'");
  content = content.replace(/background:\s*'rgba\(255,255,255,0\.08\)'/g, "background: 'var(--bg-2)'");
  content = content.replace(/border:\s*'1px solid rgba\(255,255,255,0\.2\)'/g, "border: '1px solid var(--border)'");
  content = content.replace(/border:\s*'1px solid rgba\(255,255,255,0\.15\)'/g, "border: '1px solid var(--border)'");
  
  // Navbar specific fixes
  // Change ternary text colors
  content = content.replace(/isScrolled \|\| !isLanding \? 'var\(--text-muted\)' : 'rgba\(255,255,255,0\.85\)'/g, "'var(--text-muted)'");
  content = content.replace(/isScrolled \|\| !isLanding \? 'var\(--text\)' : '#fff'/g, "'var(--text)'");
  content = content.replace(/isScrolled \|\| !isLanding \? 'var\(--text-muted\)' : '#fff'/g, "'var(--text-muted)'");
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
  }
});
