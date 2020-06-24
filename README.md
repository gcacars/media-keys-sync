# Sync volume media key between devices

Ultra-simple project for personal use.

## Server (device where buttons are pressed)
````
node index.js master
````

## Client
````
node index.js [Server IP]
````

example: `node index.js 192.168.15.38`

## Discover IP
### Windows
Check for IPv4 Address in command line `ipconfig`
