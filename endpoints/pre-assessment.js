const fs = require('fs')
const readWriteSheet = require('../read-write-spreadsheet')

module.exports = async (req, res) => {
	console.log('pre-assessment called')
	const settings = JSON.parse(fs.readFileSync(__dirname + '/../state/settings.json'))
	const templates = JSON.parse(fs.readFileSync(__dirname + '/../state/templates.json'))
	const minScore = settings['minimumEligibility']
	const calcAge = row => {
		const months = {
			'January'  : 0,
			'February' : 1,
			'March'    : 2,
			'April'    : 3,
			'May'      : 4,
			'June'     : 5,
			'July'     : 6,
			'August'   : 7,
			'September': 8,
			'October'  : 9,
			'November' : 10,
			'December' : 11 
		}
		const year = row[9]
		const month = row[10]
		const day = row[11]
		// age in years
		return (new Date() - new Date(year, months[month], day))/31536000000
	}
	const calcScore = row => {
		let score = 0
		for(let i = 12; i < 30; i++) {
			let pos = row[i].indexOf('(')
			score += parseInt(row[i][pos+1])
		}
		return score
	}
	const sheet_data = await readWriteSheet.run({
		action: 'read',
		range: 'Form Responses 1',
		spreadsheetId: '13SFdgRF1pkepA7V6AWi1zD0FPK2kNSQNUbH8feaE2ao'
	})
	let i = 1
	for (let row of sheet_data) {
		// header rows. skip
		if (row[31] == 'EmailSent') {
			i++
			continue
		}
		// 31st index is field for EmailSent status
		if (row[31] == '1') {
			i++
			continue
		} else {
			if (calcAge(row) < 18) {
				await readWriteSheet.run({
					action: 'write',
					range: 'Form Responses 1!AF'+i,
					spreadsheetId: '13SFdgRF1pkepA7V6AWi1zD0FPK2kNSQNUbH8feaE2ao',
					value: '1'
				})
				.catch(_ => {return})
				fs.appendFile(
					__dirname + '/../scheduler/outbound',
					"*** await sendEmail.send('care@milleniummedicalassociates.com', `"+templates['ineligible_due_to_age']['subject']+"`, `"+templates['ineligible_due_to_age']['body']+"`, `"+row[2]+"`, `"+row[3]+"`)~"+new Number(new Date().getTime()+parseInt(settings['delay'])*60*1000),
					err => {console.log(err)}
				)
				i++
				console.log('schedule for ',new Number(new Date().getTime()+parseInt(settings['delay'])*60*1000))
				continue
			}
			if (calcScore(row) > minScore) {
				//X write to google sheet field (emailSent: true)
				await readWriteSheet.run({
					action: 'write',
					range: 'Form Responses 1!AF'+i,
					spreadsheetId: '13SFdgRF1pkepA7V6AWi1zD0FPK2kNSQNUbH8feaE2ao',
					value: '1'
				})
				.catch(_ => {return})
				fs.appendFile(
					__dirname + '/../scheduler/outbound',
					"*** await sendEmail.send('care@milleniummedicalassociates.com', `"+templates['eligible_pre_assessment']['subject']+"`, `"+templates['eligible_pre_assessment']['body']+"`, `"+row[2]+"`, `"+row[3]+"`)~"+new Number(new Date().getTime()+parseInt(settings['delay'])*60*1000),
					err => {console.log(err)}
				)
				console.log('schedule for ',new Number(new Date().getTime()+parseInt(settings['delay'])*60*1000))
				i++
				continue
			}
			if (calcScore(row) < minScore) {
				//X write to google sheet field (emailSent: true)
				await readWriteSheet.run({
					action: 'write',
					range: 'Form Responses 1!AF'+i,
					spreadsheetId: '13SFdgRF1pkepA7V6AWi1zD0FPK2kNSQNUbH8feaE2ao',
					value: '1'
				})
				.catch(_ => {return})
				fs.appendFile(
					__dirname + '/../scheduler/outbound',
					"*** await sendEmail.send('care@milleniummedicalassociates.com', `"+templates['ineligible_due_to_score']['subject']+"`, `"+templates['ineligible_due_to_score']['body']+"`, `"+row[2]+"`, `"+row[3]+"`)~"+new Number(new Date().getTime()+parseInt(settings['delay'])*60*1000),
					err => {console.log(err)}
				)
				i++
				console.log('schedule for ',new Number(new Date().getTime()+parseInt(settings['delay'])*60*1000))
				continue
			}
		}
	}
	res.send('ok')
}
