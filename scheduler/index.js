const fs = require('fs')
const vm = require('vm')
const sendEmail = require('../send-gmail/')
const sandbox = {sendEmail: sendEmail}

const run = () => {
	console.log('scheduler running at '+new Date().toString())
	fs.readFile(__dirname + '/outbound', (err, data) => {
		data = data.toString()
		const stringed = data.split('***')
		if (data.charAt(0) == '*') {
			let temp = data.trim().slice(3)
			fs.writeFileSync(__dirname + '/outbound', temp, 'utf8')
		}
		stringed.forEach((email, index) => {
			const scheduledAt = email.substr(email.indexOf('~')+1, 13)
			if (Math.sign(new Date().getTime() - scheduledAt) == 1) {
				const copy = email.substring(0, email.indexOf('~'))
				const script = new vm.Script('(async () => {'+copy+'})()')
				const context = vm.createContext(sandbox)
				console.log(script.runInContext(context, {displayErrors:true}))
				let result = data.replace('***'+email, '').trim()
				if (stringed.length == 1) {
					result = data.replace(email, '').trim()
				}
				fs.writeFileSync(__dirname + '/outbound', result, 'utf8');
			}
		})
	})
}

exports.run = run
