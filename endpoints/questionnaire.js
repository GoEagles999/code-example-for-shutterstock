const fs = require('fs')
const readWriteSheet = require('../read-write-spreadsheet')

module.exports = async (req, res) => {
	console.log('questionnaire called')
	const settings = JSON.parse(fs.readFileSync(__dirname + '/../state/settings.json'))
	const templates = JSON.parse(fs.readFileSync(__dirname + '/../state/templates.json'))
	const disqualis = settings['disqualifiers']
	const sheet_data = await readWriteSheet.run({
		action: 'read',
		range: 'Form Responses 1',
		spreadsheetId: '1CEEt21buewXyOUbaQlJNokeHhjrW9OCv8wa5iVKlf9o'
	})
	let i = 1
	for (let row of sheet_data) {
		// header rows. skip
		if (row[33] == 'EmailSent') {
			i++
			continue
		}
		// 33rd index is field for EmailSent status
		if (row[33] == '1') {
			i++
			continue
		} else {
			const taken = row[25]
			const depression = row[29]
			if (depression == 'Yes') {
				//row[3]
				await readWriteSheet.run({
					action: 'write',
					range: 'Form Responses 1!AH'+i,
					spreadsheetId: '1CEEt21buewXyOUbaQlJNokeHhjrW9OCv8wa5iVKlf9o',
					value: '1'
				})
				.catch(_ => {return})
				fs.appendFile(
					__dirname + '/../scheduler/outbound',
					"*** await sendEmail.send('care@millenniummedicalassociates.com', `"+templates['ineligible_due_to_medical']['subject']+"`, `"+templates['ineligible_due_to_medical']['body']+"`, `"+row[1]+"`, `"+row[2]+"`)~"+new Date().getTime()+parseInt(settings['delay'])*60*1000,
					err => {console.log(err)}
				)
				i++
				console.log('schedule for ',new Number(new Date().getTime()+parseInt(settings['delay'])*60*1000))
				continue
			}
			for (let medication of taken.split(',')) {
				for (let forbidden of disqualis.split(',')) {
					if (medication.trim().toLowerCase() == forbidden.trim().toLowerCase()) {
						await readWriteSheet.run({
							action: 'write',
							range: 'Form Responses 1!AH'+i,
							spreadsheetId: '1CEEt21buewXyOUbaQlJNokeHhjrW9OCv8wa5iVKlf9o',
							value: '1'
						})
						.catch(_ => {return})
						fs.appendFile(
							__dirname + '/../scheduler/outbound',
							"*** await sendEmail.send('care@millenniummedicalassociates.com', `"+templates['ineligible_due_to_medication']['subject']+"`, `"+templates['ineligible_due_to_medication']['body']+"`, `"+row[1]+"`, `"+row[2]+"`)~"+new Date().getTime()+parseInt(settings['delay'])*60*1000,
							err => {console.log(err)}
						)
						i++
						console.log('schedule for ',new Number(new Date().getTime()+parseInt(settings['delay'])*60*1000))
						continue
					}	
				}
			}
			await readWriteSheet.run({
				action: 'write',
				range: 'Form Responses 1!AH'+i,
				spreadsheetId: '1CEEt21buewXyOUbaQlJNokeHhjrW9OCv8wa5iVKlf9o',
				value: '1'
			})
			.catch(_ => {return})
			fs.appendFile(
				__dirname + '/../scheduler/outbound',
				"*** await sendEmail.send('care@millenniummedicalassociates.com', `"+templates['eligible_questionnaire']['subject']+"`, `"+templates['eligible_questionnaire']['body']+"`, `"+row[1]+"`, `"+row[2]+"`)~"+new Date().getTime()+parseInt(settings['delay'])*60*1000,
				err => {console.log(err)}
			)
			i++
			console.log('schedule for ',new Number(new Date().getTime()+parseInt(settings['delay'])*60*1000))
		}
	}
	res.send('ok')
}
