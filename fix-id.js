const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/community/notice/page.tsx',
  'src/app/community/qa/page.tsx',
  'src/app/info/facility/page.tsx',
  'src/app/place/page.tsx',
  'src/app/program/calendar/page.tsx',
  'src/app/wave/qa/page.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace ._id with .id
    content = content.replace(/\._id/g, '.id');
    // Replace {_id: with {id:
    content = content.replace(/\{\s*_id\s*:/g, '{id:');
    // Replace "_id" with "id"
    content = content.replace(/["']_id["']/g, '"id"');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
