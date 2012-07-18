(function () {
	var GHAuth = new GithubAuth();

	GHAuth.init();

	var token = GHAuth.loadTokenFromCookies();
	var now = new Date();
	var url = 'https://raw.github.com/JPalounek/Guntest/master/tests.log';
	var data = now;

	var result = document.getElementById('apitest-commit-result');

	GHAuth.sendCommitRequest(data, token, url, function (res) {
		if(res == 'success') {
			result.innerHTML = 'Succeeded';
		} else {
			if(res != 'failed') {
				result.innerHTML = 'API error';
			} else {
				result.innerHTML = 'Failed';
			}
		}
});

}(document));