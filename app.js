'use strict';

import express from 'express';
import path from 'path';
import http from 'http';

let app = express();
let _dirname = path.resolve();
app.get('/', (req, res) => {
    res.sendFile(_dirname + '/client/index.html');
});
app.use('/client', express.static(_dirname + '/client'));

let httpServer = http.createServer(app);
let PORT = process.env.PORT || 8082;
httpServer.on('error', (err) => {
    console.error(err);
});
httpServer.listen(PORT, () => {
    console.log('Server listening on port: ' + PORT);
});