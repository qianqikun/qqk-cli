const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs')
const ejs = require('ejs')
const chalk = require('chalk')

function readFileList(dir, filesList = []) {
  const baseDir = dir
  const files = fs.readdirSync(dir)
  files.forEach((item) => {
    var fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList) //递归读取文件
    } else {
      filesList.push(fullPath)
    }
  })
  return filesList
}

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Your project name',
      default: this.appname, //appname 为项目文件夹名字
    },
    {
      type: 'checkbox',
      name: 'depend',
      message: 'Choose your dependencies',
      choices: ['vuex', 'axios', 'element-ui'],
    },
  ])
  .then((anwser) => {
    console.log(anwser)
    const tmplDir = path.join(__dirname, '../templates')
    const destDir = process.cwd()
    let fileList = readFileList(tmplDir)
    // console.log(fileList)
    const vuexFiles = 'store/index.js'
    fileList.forEach((file) => {
      console.log(file)
      if (!anwser.depend.includes('vuex') && file.includes(vuexFiles)) {
        return true
      }
      ejs.renderFile(file, anwser, (err, result) => {
        if (err) throw err
        const writeFilePath = path.join(destDir, path.relative(tmplDir, file))
        const exist = fs.existsSync(path.resolve(writeFilePath, '../'))

        if (!exist) {
          fs.mkdirSync(path.resolve(writeFilePath, '../'), { recursive: true })
        }
        // if (path.basename(file) === 'package.json') {
        //   result = JSON.stringify(JSON.parse(result))
        // }
        fs.writeFileSync(
          path.join(destDir, path.relative(tmplDir, file)),
          result
        )
        console.log('write over', file)
      })
    })
    console.log(chalk.green('project init successfully!'))
    console.log(`
            ${chalk.bgWhite.black('   Run Application  ')}
            ${chalk.yellow('npm install')}
            ${chalk.yellow('npm run dev')}
          `)
  })
