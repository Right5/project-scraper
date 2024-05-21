#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read the config file
const configFile = path.join(process.cwd(), '.project-scraper.json');
if (!fs.existsSync(configFile)) {
    console.error('Configuration file .project-scraper.json not found in the current directory.');
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const treeCliPrompt = config.treeCliPrompt;
const paths = config.paths;
const outputFile = config.outputFile;
const platform = config.platform || 'linux';

// Function to get the content of the specified files and folders
const getFileContents = (paths) => {
    let filesToRead = [];

    paths.forEach(p => {
        if (fs.lstatSync(p).isDirectory()) {
            // Recursively get all files in the directory
            const getAllFiles = (dirPath, arrayOfFiles) => {
                const files = fs.readdirSync(dirPath);

                files.forEach(file => {
                    const fullPath = path.join(dirPath, file);
                    if (fs.lstatSync(fullPath).isDirectory()) {
                        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                    } else {
                        arrayOfFiles.push(fullPath);
                    }
                });

                return arrayOfFiles;
            };

            filesToRead = getAllFiles(p, filesToRead);
        } else {
            filesToRead.push(p);
        }
    });

    return filesToRead.map(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            return { path: file, content: content };
        } catch (err) {
            return { path: file, content: `Error reading file: ${err.message}` };
        }
    });
};

// Function to normalize path according to platform
const normalizePath = (filePath) => {
    return platform === 'windows' ? filePath.replace(/\//g, '\\') : filePath.replace(/\\/g, '/');
};

// Function to normalize end-of-line characters according to platform
const normalizeEOL = (content) => {
    return platform === 'windows' ? content.replace(/\n/g, '\r\n') : content.replace(/\r\n/g, '\n');
};

// Function to create directories if they don't exist
const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
};

// Ensure the output directory exists
ensureDirectoryExistence(outputFile);

// Execute the tree-cli command
exec(treeCliPrompt, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error executing tree-cli: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`tree-cli stderr: ${stderr}`);
        return;
    }

    // Remove ANSI escape codes from the project structure output
    const ansiEscapeCodePattern = new RegExp('[\u001B\u009B][[\\]()#;?]*((?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\u0007|(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~])', 'g');
    const projectStructure = stdout.replace(ansiEscapeCodePattern, '').trim();

    // Generate file contents
    const fileContents = getFileContents(paths);

    // Create the output content
    let outputContent = `## PROJECT STRUCTURE ##\n\n${normalizeEOL(projectStructure)}\n\n## FILES ##\n\n`;

    fileContents.forEach(file => {
        const filePath = normalizePath(file.path);
        const fileContent = normalizeEOL(file.content);
        outputContent += `// ${filePath}\n${fileContent}\n\n`;
    });

    // Write the output content to a file
    fs.writeFileSync(outputFile, outputContent, 'utf8');
    console.log(`Project report generated successfully at ${outputFile}`);
});
