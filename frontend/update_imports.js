const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.expo') {
        filelist = walkSync(dir + '/' + file, filelist);
      }
    }
    else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const allFiles = [...walkSync('./app'), ...walkSync('./src')];
console.log('Total files:', allFiles.length);

let modifiedCount = 0;

for (const file of allFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix router paths
    content = content.replace(/"\/settings\/notifications"/g, '"/notifications"');
    content = content.replace(/"\/settings\/analytics"/g, '"/analytics"');
    content = content.replace(/"\/settings\/subscription"/g, '"/profile/subscription"');
    content = content.replace(/"\/project-management\/drafts"/g, '"/projects/drafts"');
    content = content.replace(/"\/project-management\/export-library"/g, '"/projects/export-library"');

    // Single quotes
    content = content.replace(/'\/settings\/notifications'/g, "'/notifications'");
    content = content.replace(/'\/settings\/analytics'/g, "'/analytics'");
    content = content.replace(/'\/settings\/subscription'/g, "'/profile/subscription'");
    content = content.replace(/'\/project-management\/drafts'/g, "'/projects/drafts'");
    content = content.replace(/'\/project-management\/export-library'/g, "'/projects/export-library'");

    if (file.includes('_layout.tsx')) {
        content = content.replace(/name="settings\/notifications"/g, 'name="notifications"');
        content = content.replace(/name="settings\/analytics"/g, 'name="analytics"');
        content = content.replace(/name="settings\/subscription"/g, 'name="profile/subscription"');
        content = content.replace(/name="project-management\/drafts"/g, 'name="projects/drafts"');
        content = content.replace(/name="project-management\/export-library"/g, 'name="projects/export-library"');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
    }
}
console.log('Modified files:', modifiedCount);
