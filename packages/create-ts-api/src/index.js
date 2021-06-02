#!/usr/bin/env node

const commander = require('commander');
const chalk = require('chalk');
const execSync = require('child_process').execSync;
const packageJson = require('../package.json');
const fs = require('fs-extra');
const path = require('path');

let projectName;

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')}`)
  .action((name) => {
    projectName = name;
  })
  .parse(process.argv);

if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-ts-api')}`);
  process.exit(1);
}

const projectDestination = path.join(process.cwd(), projectName);

if (fs.existsSync(projectDestination)) {
  console.log(`The directory ${chalk.green(projectName)} already exists.`);
  process.exit(1);
}

fs.copySync(path.join(__dirname, '..', '../templates/main'), projectName);

function shouldUseYarn() {
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

process.chdir(projectDestination);

fs.writeFileSync(
  '.gitignore',
  `node_modules
dist
.env
database.sqlite`
);

if (shouldUseYarn()) {
  execSync('yarn install', { stdio: [0, 1, 2] });
} else {
  execSync('npm install', { stdio: [0, 1, 2] });
}
