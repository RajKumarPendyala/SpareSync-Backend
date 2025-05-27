const fs = require('fs');
const path = require('path');

exports.deleteUploadedFile = async (file) => {
  if (!file) return;

  const filename = typeof file === 'string' ? path.basename(file) : file.filename;
  const filePath = path.join(__dirname, '..', 'uploads', filename);

  fs.unlink(filePath, (err) => {
    if (err) console.error('Failed to delete uploaded file:', err.message);
    else console.log('Temp image file deleted:', filePath);
  });
};