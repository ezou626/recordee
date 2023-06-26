const express = require('express');
const app = express();
const PORT = 3000;

var favicon = require('serve-favicon');
app.use(favicon(__dirname + '/../resources/favicon.ico'));

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

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: './client'})
})

app.get('index.js', (req, res) => {
    res.sendFile('index.js', {root: './client'})
  })

app.get('icon.png', (req, res) => {
    res.sendFile('icon.png', {root: './resources'})
})

app.listen(PORT, () => {
    console.log(`Started localhost server!`);
    console.log(`Join at http://${ips["Wi-Fi"][0]}:${PORT}`);
});