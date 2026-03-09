const mongoose = require('mongoose');
const uri = 'mongodb://localhost:27017/dsa-tracker';
mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    console.log('Local MongoDB found');
    process.exit(0);
  })
  .catch(err => {
    console.error('Local MongoDB NOT found');
    process.exit(1);
  });
