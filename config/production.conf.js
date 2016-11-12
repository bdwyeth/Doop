var colors = require('chalk');

console.log(colors.bold.red('RUNNING IN PRODUCTION MODE'));

module.exports = {
	isProduction: true,
	gulp: {
		debugJS: false,
		minifyJS: true,
		debugCSS: false,
		minifyCSS: true,
	},
	newrelic: {
		enabled: true,
	},
};
