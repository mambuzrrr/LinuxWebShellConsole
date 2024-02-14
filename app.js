const express = require('express');
const http = require('http');
const { exec } = require('child_process');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

// Remember the original working directory
const originalCwd = process.cwd();

app.get('/', (req, res) => {
  // Path for the HTML File...
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user has connected.');

  socket.on('command', (data) => {
    console.log('Command received: ' + data);

    // FIX for the "cd" command in the web terminal, not the solution i wanted tho.
    // Check if the command is a 'cd' command
    if (data.startsWith('cd ')) {
      // Extract the target directory from the command
      const targetDirectory = data.substring(3);
      // Change the working directory accordingly
      process.chdir(targetDirectory);
      // Confirm the change of the working directory
      socket.emit('output', `Changed directory to: ${process.cwd()}`);
    } else {
      // Execute the command in the current working directory
      exec(data, (error, stdout, stderr) => {
        if (error) {
          socket.emit('output', error.message);
          return;
        }
        if (stderr) {
          socket.emit('output', stderr);
          return;
        }
        socket.emit('output', stdout);
      });
    }
  });
});

// Server start and Port (3000 is the port, you can modify it as u wish)
server.listen(3000, () => {
  console.log('Server runs on: http://localhost:3000');
});
