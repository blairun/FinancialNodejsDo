// require modules
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

exports.archive = function () {
  // register format for archiver
  // note: only do it once per Node.js process/application, as duplicate registration will throw an error
  archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'))

  // zip encrypt database before backup
  // another option might be sqlcipher or sequelize might have a solution ?
  // create archive and specify method of encryption and password
  let archive = archiver.create('zip-encrypted', {
    zlib: { level: 8 },
    encryptionMethod: 'aes256',
    password: process.env.DB_PASS,
  })
  // ... add contents to archive as usual using archiver

  var output = fs.createWriteStream(
    path.join(__dirname, '../financial_vue.zip')
  )
  // var archive = archiver('zip');

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes')
    console.log(
      'archiver has been finalized and the output file descriptor has closed.'
    )
  })

  archive.on('error', function (err) {
    throw err
  })

  archive.pipe(output)

  var file1 = path.join(__dirname, '../dbLive.sqlite')
  // var file2 = __dirname + '/test/file2.txt';

  archive
    .append(fs.createReadStream(file1), { name: 'dbLive.sqlite' })
    // .append(fs.createReadStream(file2), { name: 'file2.txt' })
    .finalize()
}
