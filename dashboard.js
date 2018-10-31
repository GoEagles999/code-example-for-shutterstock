function loadPageContent(page) {
  var pageContent = document.getElementById('pageContent')
  var settings = document.getElementById('settings')
  var templates = document.getElementById('templates')
  if (page == 'settings') {
    settings.classList.remove('hide')
    templates.classList.remove('show')
    settings.classList.add('show')
    templates.classList.add('hide')
  }
  if (page == 'templates') {
    templates.classList.remove('hide')
    settings.classList.remove('show')
    templates.classList.add('show')
    settings.classList.add('hide')
  }
}

window.onload = function() {
  fetch('/millenium/state/templates')
  	.then(data => data.json())
		.then(data => {
			document.getElementById('eligible_phase_1_subject').value = data.eligible_pre_assessment.subject
			document.getElementById('eligible_phase_1_body').value = data.eligible_pre_assessment.body
			document.getElementById('eligible_phase_2_subject').value = data.eligible_questionnaire.subject
			document.getElementById('eligible_phase_2_body').value = data.eligible_questionnaire.body
			document.getElementById('ineligible_due_to_age_subject').value = data.ineligible_due_to_age.subject
			document.getElementById('ineligible_due_to_age_body').value = data.ineligible_due_to_age.body
			document.getElementById('ineligible_due_to_score_subject').value = data.ineligible_due_to_score.subject
			document.getElementById('ineligible_due_to_score_body').value = data.ineligible_due_to_score.body
			document.getElementById('ineligible_due_to_medical_subject').value = data.ineligible_due_to_medical.subject
			document.getElementById('ineligible_due_to_medical_body').value = data.ineligible_due_to_medical.body
			document.getElementById('ineligible_due_to_medication_subject').value = data.ineligible_due_to_medication.subject
			document.getElementById('ineligible_due_to_medication_body').value = data.ineligible_due_to_medication.body
		})
  fetch('/millenium/state/settings')
  	.then(data => data.json())
		.then(data => {
			document.getElementById('businessHours').value = data.businessHours
			document.getElementById('disqualifiers').value = data.disqualifiers
			document.getElementById('minimumEligibility').value = data.minimumEligibility
			document.getElementById('delay').value = data.delay
		})
	document.getElementById('submitSettings').onclick = function() {
		var biz = document.getElementById('businessHours').value 
		var dis = document.getElementById('disqualifiers').value 
		var min = document.getElementById('minimumEligibility').value 
		var del = document.getElementById('delay').value 
		fetch('/millenium/state/settings', {
			method:'POST',
			body: JSON.stringify({minimumEligibility: min, businessHours: biz, delay: del, disqualifiers: dis}),
			headers: new Headers({'Content-Type':'application/json'})
		})
			.then(data => {
				if (data.status == 200) {
					alert('success')
				} else {
					alert('failure')
				}
			})
	}	
	document.getElementById('submitTemplates').onclick = function() {
		var el_sub_phase_1 = document.getElementById('eligible_phase_1_subject').value 
		var el_body_phase_1 = document.getElementById('eligible_phase_1_body').value 
		var el_sub_phase_2 = document.getElementById('eligible_phase_2_subject').value 
		var el_body_phase_2 = document.getElementById('eligible_phase_2_body').value 
		var inel_age_sub = document.getElementById('ineligible_due_to_age_subject').value
		var inel_age_body = document.getElementById('ineligible_due_to_age_body').value 
		var inel_score_sub = document.getElementById('ineligible_due_to_score_subject').value 
		var inel_score_body = document.getElementById('ineligible_due_to_score_body').value 
		var inel_medical_sub = document.getElementById('ineligible_due_to_medical_subject').value 
		var inel_medical_body = document.getElementById('ineligible_due_to_medical_body').value 
		var inel_medication_sub = document.getElementById('ineligible_due_to_medication_subject').value 
		var inel_medication_body = document.getElementById('ineligible_due_to_medication_body').value 
		fetch('/millenium/state/templates', {
			method:'POST',
			body: JSON.stringify({
				ineligible_due_to_score: {
					subject: inel_score_sub,
					body: inel_score_body
				},
				ineligible_due_to_age: {
					subject: inel_age_sub,
					body: inel_age_body
				},
				ineligible_due_to_medical: {
					subject: inel_medical_sub,
					body: inel_medical_body
				},
				ineligible_due_to_medication: {
					subject: inel_medication_sub,
					body: inel_medication_body
				},
				eligible_pre_assessment: {
					subject: el_sub_phase_1,
					body: el_body_phase_1
				},
				eligible_questionnaire: {
					subject: el_sub_phase_2,
					body: el_body_phase_2
				}
			}),
			headers: new Headers({'Content-Type':'application/json'})
		})
			.then(data => {
				if (data.status == 200) {
					alert('success')
				} else {
					alert('failure')
				}
			})
	}	
}
