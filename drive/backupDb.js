require('dotenv').config()
const fs = require('fs')
const path = require('path')
const dayjs = require('dayjs')
const date = dayjs().format('MM-DD-YYYY')
const oAuth2Client = require('./googleClient')
const { google } = require('googleapis')

oAuth2Client.setCredentials({
  access_token: process.env.DRIVE_ACCESS_TOKEN,
  refresh_token: process.env.DRIVE_REFRESH_TOKEN,
  scope: process.env.DRIVE_SCOPE,
  token_type: process.env.DRIVE_TOKEN_TYPE,
  expiry_date: process.env.DRIVE_EXPIRY_DATE,
})

const drive = google.drive({
  version: 'v3',
  auth: oAuth2Client,
})

exports.backup = async function () {
  // (async () => {
  // updates drive file with local file
  var media = {
    mimeType: 'application/zip',
    body: fs.createReadStream(path.join(__dirname, '../', 'financial_vue.zip')),
  }

  // auto backup finances db (zip encrypt it and save to google drive)
  // overwrite same file each day with latest data
  // Drive saves file versions and deletes files after 30 days or when > 100 versions are stored.
  // To avoid deletion, select Keep forever in the file's context menu.
  const res = await drive.files.update({
    fileId: process.env.DRIVE_DB_FILE_ID,
    media: media,
    requestBody: {
      name: `financial_vue_${date}.zip`,
    },
  })
  console.log(res.data)

  // create new files each day
  // drive.files.create(
  //   {
  //     media: media,
  //     requestBody: {
  //       name: `financial_vue_${date}.zip`,
  //       parents: [process.env.DRIVE_ARCHIVE_FOLDER_ID]
  //     },
  //   },
  //   function (err, file) {
  //     if (err) {
  //       // Handle error
  //       console.error(err);
  //     } else {
  //       console.log("File Id: ", file);
  //     }
  //   }
  // );
  // })();
}
