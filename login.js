window.onload = function() {
	var pwhandler = function () {
		document.cookie = 'password='+document.getElementById('password').value+';max-age=86400;path=/'
		window.location.href = 'https://mma-onboarding.dysontechsolutions.com/millenium/dashboard'
	}

	document.getElementById('login').onclick = pwhandler
}
