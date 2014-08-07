var app = require('app');
var BrowserWindow = require('browser-window');

var mainWindow = null;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    'use-content-size': true,
  });

  mainWindow.loadUrl('file://' + __dirname + '/index.html');
});
