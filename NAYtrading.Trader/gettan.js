const readline = require('readline');
const tan_store = require('./app/stores/tan_store');

setTimeout(() => {

	const rl = readline.createInterface({
	  input: process.stdin,
	  output: process.stdout
	});

	rl.question('NAYtrading username: ', function (username) {
	  rl.question('Tan password: ', function (password) {
		rl.question('Tan challenge: ', function (challenge) {
			const split = challenge.split(' ');
			tan_store.setPassword(username, password)
			.then(() => {
				tan_store.getTan(username, {TanChallenge1:split[0], TanChallenge2:split[1], TanChallenge3:split[2]})
				.then(tan =>  {
					console.log(tan);
					rl.close();
				});
			});
		});
	  });
	});

	rl.on('close', function () {
	  console.log('\nBYE BYE !!!');
	  process.exit(0);
	});

}, 1);
