(function () {
	function done(res) {
		var result = document.getElementById('apitest-commit-result');
		result.innerHTML = res;

		var time = document.getElementById('apitest-commit-time');
		time.innerHTML = microtime(true) - elapsedTime;
	}

	var elapsedTime = microtime(true);

	var GHAuth = new GithubAuth();

	GHAuth.init();

	var token = GHAuth.loadTokenFromCookies();
	var now = new Date();
	var url = 'https://raw.github.com/JPalounek/Guntest/master/tests.log';
	var data = now;

	GHAuth.sendCommitRequest(data, token, url, function (res) {
		if(res == 'success') {
			done('Succeeded');
		} else {
			if(res != 'failed') {
				done('API error');
			} else {
				done('Failed');
			}
		}
	});
}(document));