/* eslint-disable no-console */
const ioHook = require('iohook');
const http = require('http');
const socketIo = require('socket.io');
const socketIoClient = require('socket.io-client');
const osVolControl = require('os-volume-controll');

// Params
const args = process.argv.slice(2);
const isMaster = args[0] === 'master';

// Action
let clearedExit;

if (isMaster) {
  // Start server
  const server = http.createServer();
  const io = socketIo(server);

  io.on('connection', (client) => {
    console.log('Client connected!');

    client.on('cmd', (data) => {
      console.log('Data received', data);
    });

    client.on('disconnect', () => {
      console.log('A client was disconnected');
    });
  });

  server.listen(8692);
  console.log('Listening on port 8692');

  // Listen to keys
  const volDown = ioHook.registerShortcut([57390], () => {
    console.log('- down');
    io.emit('cmd', 'decVol');
  });

  const volUp = ioHook.registerShortcut([57392], () => {
    console.log('up +');
    io.emit('cmd', 'incVol');
  });

  // Register and start hook
  ioHook.start();

  // Clear
  clearedExit = (opt) => {
    ioHook.unregisterShortcut(volUp);
    ioHook.unregisterShortcut(volDown);

    if (opt.exit) {
      console.log('All good. Bye bye!');
      process.exit();
    }
  };
} else {
  // slave
  const io = socketIoClient(`http://${args[0]}:8692`);
  io.on('connect', () => {
    console.log('Connected!');
  });

  io.on('cmd', (data) => {
    console.log('Event:', data);

    if (/^(decVol|incVol|mute|unmute)$/.test(data)) {
      osVolControl[data]();
    }
  });

  io.on('disconnect', () => {
    console.log('Disconnected! Bye.');
  });

  clearedExit = () => {
    console.log('Bye bye!');
    process.exit();
  };
}

process.on('exit', clearedExit.bind(null, {
  cleanup: true,
}));

// catches ctrl+c event
process.on('SIGINT', clearedExit.bind(null, {
  exit: true,
}));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', clearedExit.bind(null, {
  exit: true,
}));
process.on('SIGUSR2', clearedExit.bind(null, {
  exit: true,
}));

// catches uncaught exceptions
process.on('uncaughtException', clearedExit.bind(null, {
  exit: true,
}));
