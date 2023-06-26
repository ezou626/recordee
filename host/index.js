//initialize express app
const express = require('express');
const app = express();
const PORT = 3000;

//parse POST request body
app.use(express.json());

//serve favicon
var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/../resources/favicon.ico'));

//get public ip address for localhost
const { networkInterfaces } = require('os');
const nets = networkInterfaces();
const ips = {};
for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!ips[name]) {
                ips[name] = [];
            }
            ips[name].push(net.address);
        }
    }
}

//storage variables
let scores = {"eric": 0, "kevin": 0};
const clients = [];

//serve index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', {root: './client'})
})

//serve index.js
app.get('/index.js', (req, res) => {
    res.sendFile('index.js', {root: './client'})
})

// POST endpoint to receive the messages and send SSE to clients
app.post('/update', (req, res) => {
    //getting stuff
    let id = req.body.id;
    let change = req.body.change;

    //update score
    scores[id] += change;
    console.log(scores);
    // Send the message to all connected clients
    clients.forEach(client => client.write(`event: update\ndata: ${JSON.stringify(scores)}\n\n)`));

    //Send result
    res.send("Scores updated!");
});

// SSE endpoint for clients to connect
app.get('/updatescore', (req, res) => {
    // Set the appropriate headers for SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    res.flushHeaders();
    // Create a new client connection
    const client = res;
    let counter = 0;
    let interValID = setInterval(() => {
        counter++;
        if (counter >= 100) {
            clearInterval(interValID);
            res.end(); // terminates SSE session
            return;
        }
        res.write(`data: ${JSON.stringify(scores)}\n\n)`); // res.write() instead of res.send()
    }, 1000);

    // Add the client to the clients list
    clients.push(client);
  
    // Remove the client when the connection is closed
    req.on('close', () => {
      const index = clients.indexOf(client);
      clients.splice(index, 1);
    });
});

//start app
app.listen(PORT, () => {
    console.log(`Started localhost server!`);
    console.log(`Join at http://${ips["Wi-Fi"][0]}:${PORT}`);
});