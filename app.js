const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '**filename.type');
const readLine = require('readline-sync');

// User testing constants
const CLIENT_ID = '**insert here';
const CLIENT_SECRET = '**insert here';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
// Refresh this each time you test
// Check README.md for how to test
const REFRESH_TOKEN = '**insert here';

// OAuth2Client SetUp
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
);

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

// Drive Mock SetUp
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});


// Menu
console.log('What would you like to do? ');
var answer = readLine.question("(U) Upload a file, (DE) delete a file, (VF) view a list of files, (D) download a file, (L) list users with access to a file, or (Q) Quit? ");
answer = answer.toUpperCase();

while (answer !== "Q") {
    if(answer === "U") { uploadFile(); } 
    else if (answer === "DE") { deleteFile(); } 
    else if (answer === "VF") { listFiles(); } 
    else if (answer === "D") { downloadFiles(); } 
    else if (answer === "L") { listUsers(); } 
    else { console.log("Invalid choice. Try again. "); }
}


// Uploads a file within the application to the testing user's Google Drive
// Logs an error message if there is an error
async function uploadFile() {
    try {
        const response = await drive.files.create({
            // Add user interaction for file name and mimeType
            requestBody: {
                name: '**filename.type',
                mimeType: '**ex:image/png',
            },
            media: {
                mimeType: '**ex:image/png',
                body: fs.createReadStream(filePath),
            },
        });
        console.log(response.data);
    } catch (error) {
        console.log(error.message);
    }

}


// Lists the files' names and IDs within the testing user's Google Drive
// Logs an error message if there is an error
async function listFiles() {
    try {
        const response = await drive.files.list({
            fields: 'files(id, name)',
        });
        const files = response.data.files;
        console.log("Files present in your Drive: ");
        var index = 1;
        for(const file of files) {
            console.log(index + ": " + file.name);
            console.log("ID: " + file.id);
            index++;
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Lists the files' names within the testing user's Google Drive
// and lists the users with access to each file
// Logs an error message if there is an error
async function listUsers() {
    try {
        const response = await drive.files.list({
            fields: 'files(id, name)',
        });
        const files = response.data.files;
        for(const file of files) {
            console.log("File examined: " + file.name);

            const permissionsResponse = await drive.permissions.list({
                fileId: file.id,
                fields: 'permissions(id, emailAddress, role)',
            });
            
            const permissions = permissionsResponse.data.permissions;
            console.log("Users with access:");
            for (const permission of permissions) {
                console.log(`User: ${permission.emailAddress}, Role: ${permission.role}`);
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Downloads the specified file to a specified directory
// Logs an error message if there is an error
async function downloadFiles() {
    try {
        const response = await drive.files.list({
            fields: 'files(id, name)',
        })

        // var fileDest = readLine.question('Where do you want to download this file to? You must be very specific with the path name. ');
        // add user interaction bit
        // "where do you want to download this file to? "
        const downloadDir = path.resolve('**exact/path/where/file/should/be/placed');
        const files = response.data.files;
        for(const file of files) {
            const fileId = file.id;
            const fileName = file.name;
            const dest = fs.createWriteStream(path.join(downloadDir, fileName));
            const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
            res.data.pipe(dest);
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Deletes a file within the testing user's Google Drive when given the file id
// Logs an error message if there is an error
async function deleteFile() {
    try {
        listFiles();
        var fileToDelete = readLine.question('Which file would you like to delete? Copy and paste the ID. ');
        const response = await drive.files.delete({
            fileId: fileToDelete,
        });
    } catch (error) {
        console.log(error.message);
    }
}
