const port_to_listen = 8181;

const express = require('express');

const app = express();
app.use(express.static('web-ui'));

const http_server = app.listen(port_to_listen, () => {
    console.log('Listening on port ' + port_to_listen);
});