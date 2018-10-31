const Cron = require('cron').CronJob
const scheduler = require('./scheduler')
const preassessment = require('./endpoints/pre-assessment')
const questionnaire = require('./endpoints/questionnaire')
const server = require('express')()
const bodyparser = require('body-parser')
const fs = require('fs')
const settings = JSON.parse(fs.readFileSync(__dirname + '/state/settings.json'))
process.env.TZ = 'UTC' 
const auth = (req, res, next) => {
	try { 
		// password
		if (req.headers.cookie.split('=')[1] == '[UK}5cw]gBbzEnh:') {
			next()
		} else {
  		res.redirect('/millenium/login')
		}
	} 
	catch(err) {
  		res.redirect('/millenium/login')
	}
}
new Cron(
	//'* * * * * *', 
	'0 */1 '+settings['businessHours']+' * * 1-5', 
	() => {
		scheduler.run()
	},
	null,
	true,
	'UTC'
)
server.use(bodyparser.json())
server.use('/millenium/dashboard', require('express').static(__dirname))
server.use('/millenium/login', require('express').static(__dirname))
server.post('/pre-live/millennium/pre-assessment', preassessment)
server.post('/pre-live/millennium/questionnaire', questionnaire)
server.post('/millenium/state/settings', (req, res) => {
  fs.writeFile(__dirname + '/state/settings.json', JSON.stringify(req.body), err => {
		if (err) res.status(500).send('err')
		res.status(200).send('ok')
	})
})
server.post('/millenium/state/templates', (req, res) => {
  fs.writeFile(__dirname + '/state/templates.json', JSON.stringify(req.body), err => {
		if (err) res.status(500).send('err')
		res.status(200).send('ok')
	})
})
server.get('/millenium/state/settings', (req, res) => {
  res.sendFile(__dirname + '/state/settings.json')
})
server.get('/millenium/state/templates', (req, res) => {
  res.sendFile(__dirname + '/state/templates.json')
})
server.get('/millenium/dashboard', auth, (req, res) => {
  res.sendFile(__dirname + '/dashboard.html')
})
server.get('/millenium/login', (req, res) => {
	try { 
		// password
		if (req.headers.cookie.split('=')[1] == '[UK}5cw]gBbzEnh:') {
			res.redirect('/millenium/dashboard')
		} else {
  		res.sendFile(__dirname + '/login.html')
		}
	} 
	catch(err) {
  	res.sendFile(__dirname + '/login.html')
	}
})


server.listen(80, () => {console.log('http server running')})
