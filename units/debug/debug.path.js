var async = require('async-chainable');
var asyncExec = require('async-chainable-exec');
var email = require('mfdc-email');
var fs = require('fs');

/**
* Test email sending
* This dispatches the '/units/emails/debug.tmpl.txt' email to the email address stored in app.config.email.from
*/
app.get('/api/debug/test/email', app.middleware.ensure.root, function(req, res) {
	email()
		.to(app.config.email.from)
		.subject('Debug Email')
		.template(app.config.paths.root + '/units/email/debug.email.txt')
		.templateParams({
			config: app.config,
		})
		.send(function(err, emailRes) {
			res.send({
				error: err,
				response: emailRes,
			});
		})
});


/**
* Fetch Git information
* NOTE: This will only execute ONCE per execution cycle to prevent DDOS
*/
var _cachedVersion;
app.get('/api/debug/version', function(req, res) {
	if (_cachedVersion) return res.send(_cachedVersion);

	async()
		.parallel({
			git: function(next) {
				async()
					.use(asyncExec)
					.exec('git', ['git', 'log', '-1', `--pretty=format:%H|%h|%cI|%cn|%s`])
					.then('git', function(next) {
						var gitInfo = this.git[0].split('|');
						next(null, {
							hash: gitInfo[0],
							shortHash: gitInfo[1],
							date: gitInfo[2],
							committer: gitInfo[3],
							subject: gitInfo[4],
						});
					})
					.end(function(err) {
						if (err) return next(err);
						next(null, this.git);
					});
			},
			package: function(next) {
				var packagePath = app.config.paths.root + '/package.json';
				fs.stat(packagePath, function(err, stat) {
					if (err) return next(err);
					next(null, {
						version: require(packagePath).version,
						updated: stat.mtime,
					});
				});
			},
		})
		.end(function(err) {
			if (err) return res.status(400).send(err.toString()).end();
			_cachedVersion = {
				package: this.package,
				git: this.git,
			};
			res.send(_cachedVersion);
		});
});