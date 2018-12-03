const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

const publicDir = path.join(__dirname, '../public');
const buildDir = path.join(__dirname, '../build');

const buildIndexHtml = path.join(__dirname, '../build/index.html');
let indexHtmlContent = fs.readFileSync(buildIndexHtml, { encoding: 'utf8' });
const files = fs.readdirSync(publicDir);

// 不带后缀的 js 文件名
const jsFilesName = files.filter(fileName => /\.js$/.test(fileName));

// 后缀
const suffix = generateSuffix();

// 带后缀的 js 文件名
const jsFilesNameWithSuffix = jsFilesName.map(
  name => name.replace(/\.js/, '') + '.' + suffix + '.js'
);

replaceJsUrlInHtml();
jsFilesCopyCover();

// copy public/*.js to build/*.js and remove old *.js file
function jsFilesCopyCover() {
  // remove old build/*.js file
  const oldJsFilesName = fs.readdirSync(buildDir).filter(name => {
    return (
      name !== 'service-worker.js' &&
      name !== 'es-shim.min.js' &&
      name !== 'orgchart.js' &&
      /\.js$/.test(name)
    );
  });
  oldJsFilesName.forEach(name => {
    fs.removeSync(path.join(buildDir, name));
  });

  // copy public/*.js to build/*.js
  jsFilesName.forEach(name => {
    fs.copyFileSync(path.join(publicDir, name), path.join(buildDir, name));
  });

  // rename
  jsFilesName.forEach((name, index) => {
    if (name === 'es-shim.min.js' || name === 'orgchart.js') {
      return;
    }
    fs.renameSync(
      path.join(buildDir, name),
      path.join(buildDir, jsFilesNameWithSuffix[index])
    );
  });
  console.log(
    chalk.green('copy public/*.js to build/*.js and rename success! ')
  );
}

// 在 index.html 文件中替换 js 文件地址
function replaceJsUrlInHtml() {
  jsFilesName.forEach((name, index) => {
    const newName = name.replace(/\.js/, '');
    const reg = new RegExp(`${newName}\\.\\d*\\.*js`);
    if (name === 'es-shim.min.js' || name === 'orgchart.js') {
      return;
    }
    indexHtmlContent = indexHtmlContent.replace(
      reg,
      jsFilesNameWithSuffix[index]
    );
  });
  fs.writeFileSync(buildIndexHtml, indexHtmlContent);
  console.log(chalk.green('build/index.html js url has changed!'));
}

// 生成 js 文件后缀
function generateSuffix() {
  return Date.now();
}
