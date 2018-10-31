const fs = require('fs');
const util = require('util')
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';

const send = (to, subject, body, firstName, lastName) => {
	return new Promise(resolve => {
		util.promisify(fs.readFile)(__dirname + '/credentials.json')
			.then(data => {
				// Authorize a client with credentials, then call the Gmail API.
				authorize(JSON.parse(data), sendEmail, resolve, to, subject, body, firstName, lastName);
		})
	})
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, resolve, to, subject, body, firstName, lastName) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, resolve, to, subject, body, firstName, lastName);
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
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function sendEmail(auth, resolve, to, subject, body, firstName, lastName) {
  const gmail = google.gmail({version: 'v1', auth});
	let lines = new Array()
  lines.push("From: care@millenniummedicalassociates.com");
  lines.push("To: "+to);
  lines.push('Content-Type:text/html; charset=UTF-8');
	subject = subject.replace('{firstName}', firstName)
	subject = subject.replace('{lastName}', lastName)
  lines.push("Subject: "+subject+"\r\n");
	body = body.replace('{firstName}', firstName)
	body = body.replace('{lastName}', lastName)
  lines.push(body);
	const email = lines.join('\r\n')
	let data = Buffer.from(email).toString('base64')
	data = data.replace(/\//g,'_').replace(/\+/g,'-')
	gmail.users.messages.send({userId:'me', resource:{raw: data}})	
	resolve('sent')
}

exports.send = send
