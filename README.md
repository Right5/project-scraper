#Project Scraper
A script to generate a project structure report and collect file contents.

## Project Overview
This project aims to automate the process of generating a structured report of your project directory, including the contents of specified files. This can be useful for LLMs.

## Installation
To install the package, run:
```
npm install --save-dev project-scraper
```

## Usage
To generate the project report, use the following command:
```
project-scraper
```

## Configuration
The configuration for the script is specified in the .project-scraper.json file. Below is an example configuration:
```
{
    "treeCliPrompt": "npx tree --ignore node_modules/, .git/, .gitignore -l 3",
    "outputFile": "_generated/project-scraper-report.txt",
    "platform": "linux",
    "paths": [
        ".project-scraper.json",
        "package.json",
        "bin"
    ]
}
```
### Configuration Fields
```
treeCliPrompt: Command to generate the project tree structure.
outputFile: Path to the output file where the report will be saved.
platform: The operating system platform [linux | windows] (default is "linux").
paths: An array of file and directory paths to include in the report.
```

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

## Author
Martin Dedik
# project-scraper
# project-scraper
