"use strict";

require('dotenv').config();

const express     = require('express');
const app         = express();
const path        = require('path');
const logger      = require('morgan');
const cors        = require('cors');
const bodyParser  = require('body-parser');
const debug       = require('debug')('app-socket:server');

const http    = require('http').Server(app);
const io      = require('socket.io')(http);
const port    = 2201;
app.set('port', port);

/* ========================================================================== */
app.use(logger('dev'));
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '/app_vi/views/', 'index.html'));
});

let cln = {};
let cln_last = '';
let num = 1;
io.on('connection', function(socket){
    socket.on('send-add', (idx) => {
        console.log(idx);
        cln[idx] = {
            "socket": socket.id
        };
        io.emit('trim-add', {
            idx: idx,
            num: 1
        });

        num = 1;
        cln_last = idx;
    });
    socket.on('send-msg', (msg) => {
        if(msg.idx === cln_last)
            num++;
        else
            num = 1;

        io.emit('trim-msg', {
            idx: msg.idx,
            num: num,
            text: msg.text
        });

        cln_last = msg.idx;
        console.log(cln_last);
    });
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});
