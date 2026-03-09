const express = require('express');
const app = express();
const PORT = 4000;
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.listen(PORT, () => {
    console.log(`Port ${PORT} is available and server is listening.`);
    process.exit(0);
});
