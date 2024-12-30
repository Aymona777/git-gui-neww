const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;
let selectedFolder;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');
});

ipcMain.on('select-folder', async (event) => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
        });

        if (!result.canceled && result.filePaths.length > 0) {
            selectedFolder = result.filePaths[0];
            console.log('Selected Folder:', selectedFolder);

            fs.readdir(selectedFolder, (err, files) => {
                if (err) {
                    console.error('Error reading folder:', err);
                    event.reply('folder-selected', {
                        folderPath: selectedFolder,
                        error: err.message,
                        files: [],
                    });
                } else {
                    console.log('Files in folder:', files);
                    event.reply('folder-selected', {
                        folderPath: selectedFolder,
                        files: files,
                    });

                    const command = `cmd.exe /c java -cp "D:\\Electr" gitlet.Main init "${selectedFolder}"`;
                    console.log(`Executing command: ${command}`);

                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error: ${error.message}`);
                            event.reply('command-result', `Error: ${error.message}`);
                            return;
                        }

                        if (stderr) {
                            console.warn(`Stderr: ${stderr}`);
                            event.reply('command-result', `Warning: ${stderr}`);
                        }

                        if (stdout) {
                            console.log(`Files in folder:\n${stdout}`);
                            event.reply('command-result', `Files:\n${stdout}`);
                        } else {
                            console.log("No output received from the command.");
                            event.reply('command-result', "No output received.");
                        }
                    });
                }
            });

            console.log('Waiting for 3 seconds before loading the main page...');
            setTimeout(() => {
                mainWindow.loadFile('main.html').catch((err) => {
                    console.error('Failed to load main.html:', err);
                });
            }, 3000);
        } else {
            console.log('Folder selection was canceled by the user.');
        }
    } catch (error) {
        console.error('Error occurred during folder selection:', error);
    }
});

ipcMain.on('select-file', async (event) => {
    try {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
        });

        if (!result.canceled && result.filePaths.length > 0) {
            const selectedFilePath = result.filePaths[0];
            const selectedFile = path.basename(selectedFilePath);
            console.log('Selected File:', selectedFile);

            const addCommand = `cmd.exe /c java -cp "D:\\Electr" gitlet.Main add "${selectedFile}" "${selectedFolder}"`;
            console.log(`Executing command: ${addCommand}`);

            exec(addCommand, (addError, addStdout, addStderr) => {
                if (addError) {
                    console.error(`Error adding file: ${addError.message}`);
                    event.reply('command-result', `Error: ${addError.message}`);
                    return;
                }

                if (addStderr) {
                    console.warn(`Stderr: ${addStderr}`);
                    event.reply('command-result', `Warning: ${addStderr}`);
                }

                const statusCommand = `cmd.exe /c java -cp "D:\\Electr" gitlet.Main status "${selectedFolder}"`;
                console.log(`Executing status command: ${statusCommand}`);

                exec(statusCommand, (statusError, statusStdout, statusStderr) => {
                    if (statusError) {
                        console.error(`Error fetching status: ${statusError.message}`);
                        event.reply('command-result', `Error: ${statusError.message}`);
                        return;
                    }

                    if (statusStderr) {
                        console.warn(`Stderr: ${statusStderr}`);
                        event.reply('command-result', `Warning: ${statusStderr}`);
                    }

                    console.log(`Status Output:\n${statusStdout}`);

                    const stagedFiles = [];
                    const branches = [];
                    const lines = statusStdout.split('\n');
                    let inStagedFilesSection = false;
                    let inBranchesSection = false;

                    for (const line of lines) {
                        if (line.includes("=== Staged Files ===")) {
                            inStagedFilesSection = true;
                            continue;
                        }
                        if (line.includes("=== Branches ===")) {
                            inBranchesSection = true;
                            continue;
                        }
                        if (line.includes("===") && inStagedFilesSection) {
                            inStagedFilesSection = false;
                            break;
                        }
                        if (line.includes("===") && inBranchesSection) {
                            inBranchesSection = false;
                            break;
                        }
                        if (inStagedFilesSection && line.trim() !== "") {
                            stagedFiles.push(line.trim());
                        }
                        if (inBranchesSection && line.trim() !== "") {
                            branches.push(line.trim());
                        }
                    }

                    event.reply('file-staged', stagedFiles);
                    event.reply('branches', branches);
                });
            });
        } else {
            console.log('File selection was canceled by the user.');
        }
    } catch (error) {
        console.error('Error occurred during file selection:', error);
    }
});

ipcMain.on('commit', (event, message) => {
    const commitCommand = `cmd.exe /c java -cp "D:\\Electr" gitlet.Main commit "${message}" "${selectedFolder}"`;
    console.log(`Executing commit command: ${commitCommand}`);

    exec(commitCommand, (commitError, commitStdout, commitStderr) => {
        if (commitError) {
            console.error(`Error committing: ${commitError.message}`);
            event.reply('command-result', `Error: ${commitError.message}`);
            return;
        }

        if (commitStderr) {
            console.warn(`Stderr: ${commitStderr}`);
            event.reply('command-result', `Warning: ${commitStderr}`);
        }

        console.log(`Commit Output:\n${commitStdout}`);
        event.reply('command-result', `Commit successful:\n${commitStdout}`);
    });

});