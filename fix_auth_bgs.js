const fs = require('fs');

const authPages = [
  'client/src/pages/auth/OwnerLogin.jsx',
  'client/src/pages/auth/OwnerRegister.jsx',
  'client/src/pages/auth/TenantLogin.jsx',
  'client/src/pages/auth/TenantRegister.jsx'
];

authPages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the dark left panel backgrounds with a light premium background
  content = content.replace(/background:\s*'linear-gradient\(145deg, var\(--dark\).*?\)',/g, "background: 'var(--primary-light)',");
  content = content.replace(/background:\s*'linear-gradient\(135deg, var\(--primary\).*?\)',/g, "background: 'var(--primary-light)',");
  content = content.replace(/background:\s*'var\(--primary\)'/g, "background: 'var(--primary-light)'"); // For tenant login/register
  
  // Also fix any hardcoded decorative circle backgrounds in Auth pages
  content = content.replace(/background:\s*'rgba\(76,92,231,0\.15\)'/g, "background: 'rgba(31,122,77,0.05)'");
  content = content.replace(/background:\s*'rgba\(8,176,148,0\.1\)'/g, "background: 'rgba(31,122,77,0.05)'");
  content = content.replace(/background:\s*'rgba\(99,102,241,0\.08\)'/g, "background: 'rgba(31,122,77,0.05)'");
  content = content.replace(/background:\s*'rgba\(255,255,255,0\.1\)'/g, "background: 'rgba(31,122,77,0.05)'");
  content = content.replace(/background:\s*'rgba\(255,255,255,0\.05\)'/g, "background: 'rgba(31,122,77,0.05)'");
  
  // Fix border of the decorative circles if any
  content = content.replace(/border:\s*'2px solid var\(--border\)'/g, "border: 'none'");
  
  fs.writeFileSync(file, content);
  console.log('Updated:', file);
});
