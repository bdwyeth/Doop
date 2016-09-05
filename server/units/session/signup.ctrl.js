/**
* Validate the given token to complete a user's signup
*/
app.route('/validate/:token')
	.get(function(req, res) {
		async()
			// Sanity checks {{{
			.then(function(next) {
				if (!req.params.token) return next('No token provided');
				next();
			})
			// }}}
			.then('user', function(next) {
				db.users.findOne({ token: req.params.token }, function(err, user) {
					if (err && err != 'Not found') return next(err);
					if (!user || err == 'Not found') return next('Could not validate token: no users match the provided token');

					user.status = 'active';
					user.token = undefined;

					user.save(next);
				});
			})
			.end(function(err) {
				if (err) return res.status(400).send({ error: err });

				// Redirect to the login page on success
				res.redirect('/login/#/?verify=success');
			});
	});