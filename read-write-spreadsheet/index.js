const fs = require('fs');
const util = require('util')
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = __dirname + '/token.json';

// Load client secrets from a local file.
const run = action => {
	return new Promise((resolve, reject) => {
		util.promisify(fs.readFile)(__dirname + '/credentials.json')
			.then(data => {
			// Authorize a client with credentials, then call the Google Sheets API.
			authorize(JSON.parse(data), entrypoint, action, resolve, reject);
		})
	})
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, action, resolve, reject) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, action, resolve, reject);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function entrypoint(auth, action, resolve, reject) {
	const sheets = google.sheets({version: 'v4', auth});
	const read = () => {
		const data = sheets.spreadsheets.values.get({
			spreadsheetId: action.spreadsheetId,
			range: action.range,
		},
		(err, res) => {
			if (err) reject(err)
			const rows = res.data.values;
			resolve(rows)
		});
	}
	const write = () => {
		const data = sheets.spreadsheets.values.update({
			spreadsheetId: action.spreadsheetId,
			range: action.range,
			valueInputOption: 'RAW',
			resource: {
				values: [[action.value]]
			}
		},
		(err, res) => {
			if (err) reject(err)
			resolve(res)
		});
	}
	switch(action.action) {
		case 'read':
			read()
			break
		case 'write':
			write()
			break
	}
}

exports.run = run
