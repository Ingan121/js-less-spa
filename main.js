// js-less-spa
// Made by Ingan121
// Licensed under the MIT License
// SPDX-License-Identifier: MIT

const http = require('http');
const fs = require('fs');
let pendingRes = null;
let lastZIndex = 0;
let ignoreClick = false;
let clockInterval = null;

http.createServer(onRequest).listen(8888, '127.0.0.1');
console.log('js-less-spa server started');

function onRequest(req, res) {
    console.log('Serve: ' + req.url);
    if (req.url.startsWith("/cmd/")) {
        if (ignoreClick) {
            //console.log('Ignoring click event');
            ignoreClick = false;
            res.end();
            return;
        }
        const cmd = req.url.split("/cmd/")[1].split("?")[0];
        switch (cmd) {
            case 'c1':
            case 'c2':
            case 'index':
                sendHtmlPart(cmd);
                break;
            case 'counter':
                beginCounter();
                break;
            case 'clock':
                beginClock();
                break;
        }
        // Otherwise the client keeps sending new requests till the pointer is released
        ignoreClick = true;
        setTimeout(() => ignoreClick = false, 200);
        res.end();
    } else if (req.url === "/style.css") {
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(fs.readFileSync("style.css"));
        res.end();
    } else if (req.url === "/") {
        pendingRes = res;
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<!DOCTYPE html><html><head><title>js-less-spa</title><meta charset="utf-8"><link rel="stylesheet" href="/style.css"></head><body>');
        sendHtmlPart('index');
    }
}

function beginCounter() {
    sendCssVars();
    let count = 1;
    sendDocument('<h1>Count: 0</h1>');
    const interval = setInterval(() => {
        if (count === 10) {
            clearInterval(interval);
            sendDocument('<h1>Count: 10</h1><br><button class="index">Go back to the main page</button>');
        } else {
            sendDocument(`<h1>Count: ${count++}</h1>`);
        }
    }, 1000);
}

function beginClock() {
    sendCssVars();
    sendDocument('<h1>Time: Please wait...</h1><button class="index">Go back to the main page</button>');
    clockInterval = setInterval(() => {
        const date = new Date();
        const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        sendDocument(`<h1>Time: ${time}</h1><button class="index">Go back to the main page</button>`);
    }, 1000);
}

function sendHtmlPart(name) {
    sendCssVars();
    sendDocument(fs.readFileSync(`${name}.part.html`));
    clearInterval(clockInterval);
}

function sendCssVars() {
    // Randomize the URL to prevent caching
    pendingRes.write(`
        <style>
            :root {
                --c1: url("/cmd/c1?r=${Math.random()}");
                --c2: url("/cmd/c2?r=${Math.random()}");
                --index: url("/cmd/index?r=${Math.random()}");
                --counter: url("/cmd/counter?r=${Math.random()}");
                --clock: url("/cmd/clock?r=${Math.random()}");
            }
        </style>
    `);
}

function sendDocument(text) {
    pendingRes.write(`<div class="document" style="z-index: ${lastZIndex++}">`);
    pendingRes.write(text);
    pendingRes.write('</div>');
}