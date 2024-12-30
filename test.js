// Simulating the statusStdout content
const statusStdout = `
=== Staged Files ===
file1.txt
file2.js
file3.html
===
=== Unstaged Files ===
file4.css
file5.png
`;

// Initialize an array to hold staged files
const stagedFiles = [];

// Split the statusStdout into lines
const lines = statusStdout.split('\n');

// Flag to track whether we are inside the "Staged Files" section
let inStagedFilesSection = false;

// Iterate through each line
for (const line of lines) {
  // Check if we are entering the "Staged Files" section
  if (line.includes("=== Staged Files ===")) {
    inStagedFilesSection = true;
    continue;
  }

  // Check if we are exiting the "Staged Files" section
  if (line.includes("===") && inStagedFilesSection) {
    inStagedFilesSection = false;
    break;
  }

  // If inside the "Staged Files" section, add the file to the array
  if (inStagedFilesSection && line.trim() !== "") {
    stagedFiles.push(line.trim());
  }
}

// Output the staged files
console.log("Staged Files:", stagedFiles);
