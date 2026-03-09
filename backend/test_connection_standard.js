const mongoose = require('mongoose');
const uri = 'mongodb://myuser:mypassword123@ac-4fhb9mi-shard-00-00.cfehwax.mongodb.net:27017,ac-4fhb9mi-shard-00-01.cfehwax.mongodb.net:27017,ac-4fhb9mi-shard-00-02.cfehwax.mongodb.net:27017/?ssl=true&replicaSet=atlas-6v24r9-shard-0&authSource=admin&appName=Cluster0';

console.log('Testing connection to:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('✅ Success: Connected to MongoDB Atlas');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error: Failed to connect to MongoDB Atlas');
        console.error(err);
        process.exit(1);
    });
