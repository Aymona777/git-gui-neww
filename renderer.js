const { ipcRenderer } = require('electron');
const path = require('path');

// Handle button click for folder selection
document.getElementById('selectFileBtn')?.addEventListener('click', () => {
    ipcRenderer.send('select-folder'); // Send request to main process
});

// Listen for the folder and files selected from the main process
ipcRenderer.on('folder-selected', (event, data) => {
    const { folderPath, files } = data;

    if (folderPath) {
        // Normalize the folder path for consistency
        const globalFolderPath = path.resolve(folderPath).replace(/\\/g, "/");

        // Update the UI with the selected folder path
        document.getElementById('statusMessage').innerText = `Selected Folder: ${globalFolderPath}`;
        document.getElementById("folderPath").value = globalFolderPath;

        // Populate the file list with the actual files
        const fileListElement = document.querySelector('.file-list ul');
        fileListElement.innerHTML = ''; // Clear existing list

        files.forEach(file => {
            const listItem = document.createElement('li');
            listItem.textContent = file;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.addEventListener('click', () => {
                listItem.remove(); // Remove the file from the list
            });

            listItem.appendChild(deleteButton);
            fileListElement.appendChild(listItem);
        });

        console.log(`Global Folder Path: ${globalFolderPath}`); // Log the global variable
    } else {
        console.error("No folder path received or an error occurred.");
    }
});

// Listen for the command execution result
ipcRenderer.on('command-result', (event, result) => {
    document.getElementById('statusMessage').innerText += `\n${result}`;
});

// Handle button click for adding files
document.getElementById('addBtn')?.addEventListener('click', () => {
    const folderPath = document.getElementById("folderPath").value;
    if (folderPath) {
        ipcRenderer.send('add-files', folderPath); // Send request to main process with folder path
    } else {
        console.error("No folder path selected.");
    }
});

document.getElementById('addBtn')?.addEventListener('click', () => {
    ipcRenderer.send('select-file'); // Send request to main process to select a file
});

// Listen for the selected file path from the main process
ipcRenderer.on('file-selected', (event, filePath) => {
    if (filePath) {
        // Update the UI with the selected file path
        document.getElementById('statusMessage').innerText = `Selected File: ${filePath}`;
        document.getElementById("filePath").value = filePath;

        // Add the selected file to the file list
        const fileListElement = document.querySelector('.file-list ul');
        const listItem = document.createElement('li');
        listItem.textContent = filePath;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => {
            listItem.remove(); // Remove the file from the list
        });

        listItem.appendChild(deleteButton);
        fileListElement.appendChild(listItem);

        console.log(`Selected File Path: ${filePath}`); // Log the selected file path
    } else {
        console.error("No file path received or an error occurred.");
    }
});

// Listen for the staged files from the main process
ipcRenderer.on('file-staged', (event, stagedFiles) => {
    const fileListElement = document.querySelector('.file-list ul');
    fileListElement.innerHTML = ''; // Clear the current list

    stagedFiles.forEach((file) => {
        const listItem = document.createElement('li');
        listItem.textContent = file;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => {
            listItem.remove(); // Remove the file from the list (UI only)
        });

        listItem.appendChild(deleteButton);
        fileListElement.appendChild(listItem);
    });
});

// Listen for the branches from the main process
ipcRenderer.on('branches', (event, branches) => {
    const branchSelect = document.getElementById('branchSelect');
    branchSelect.innerHTML = ''; // Clear the current list

    branches.forEach((branch) => {
        const option = document.createElement('option');
        option.value = branch;
        option.textContent = branch;
        branchSelect.appendChild(option);
    });
});