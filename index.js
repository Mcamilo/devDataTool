const scripts = {
	github: require('./scripts/github.js'),
	metodoPrimeiro: require('./scripts/metodoPrimeiro.js'),
	xmlReader: require('./scripts/xmlReader.js')
}

async function start() {
	
	await scripts.github()
	// await scripts.metodoPrimeiro()
	scripts.xmlReader()
	console.log("\nDone");
}

start()
