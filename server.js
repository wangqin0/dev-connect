const express = require('express');
const connectDb = require('./config/db')

const app = express();

const PORT = process.env.PORT || 5000;

connectDb();

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

app.get('/', (req, res) => res.send('API Running'));
