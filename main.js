const { app, BrowserWindow } = require('electron')
const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');
let child;

function checkServerIsRunning(callback) {
    http.get('http://localhost:3000/', (res) => {
        // Server is running
        callback(true);
    }).on('error', (err) => {
        // Server isn't running
        callback(false);
    });
}

function isWindows() {
    return process.platform === 'win32';
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 768
    })

    win.loadURL('http://localhost:3000/').then(() => {
        // win.webContents.openDevTools()
    });
}
app.whenReady().then(() => {
    checkServerIsRunning((isRunning) => {
        if (!isRunning) {
            console.log("Starting 'npm dev'...");
            if (isWindows()) {
                child = spawn('npm.cmd', ['run', 'dev']);
            } else {
                child = spawn('npm', ['run', 'dev']);
            }
            child.stdout.on('data', (data) => {
                process.stdout.write(data);
            });

            child.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            child.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
            });
        } else {
            console.log("'http://localhost:3000/' is already active!");
        }

        // Continue with the rest of your app logic here
        console.log("App is running...");
        createWindow();

    });


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
});


app.on('window-all-closed', () => {
    killChild();
    if (process.platform !== 'darwin') app.quit()
});

process.on('exit', function() {
    killChild();
});

function killChild() {
    if (child) {
        if (isWindows()) {
            child.kill();
            spawn("taskkill", ["/pid", child.pid, '/f', '/t']);
            // spawn("taskkill", ["/IM", 'node.exe', '/f', '/t']);
        } else {
            child.kill('SIGKILL');
        }
    }
}
