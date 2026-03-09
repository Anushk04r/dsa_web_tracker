const mongoose = require('mongoose');
const uri = 'mongodb+srv://myuser:mypassword123@cluster0.cfehwax.mongodb.net/';

console.log('Testing connection to:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('✅ Success: Connected to MongoDB Atlas');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error: Failed to connect to MongoDB Atlas');
        console.error('Error Code:', err.code);
        console.error('Error Name:', err.name);
        console.error('Message:', err.message);
        process.exit(1);
    });
