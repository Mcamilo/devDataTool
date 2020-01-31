const fs = require('fs')
const contentFilePath = './content.json'

function save(content) {
  const contentString = JSON.stringify(content)
  return fs.writeFileSync(contentFilePath, contentString)
}

function load() {
  try {
    return read()
  } catch (e) {
    if (e.code === 'ENOENT') {
      const writeFile = util.promisify(fs.writeFile);
      writeFile('./content.json', '[]', 'binary');
      return read()
    }
  }
  return contentJson
}


function read() {
  const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
  const contentJson = JSON.parse(fileBuffer)
  return contentJson
}
module.exports = {save,load}
