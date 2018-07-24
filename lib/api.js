const RokuPlayer = require('./rokuplayer');
const express = require('express')
const app = express()


app.disable('etag');
app.use(express.static('html'));

app.get('/roku', (req, res) => {
	RokuPlayer.discover(devices => {
		res.send(devices);
	});
})

app.get('/roku/:rokuip', (req, res) => {
	var rokumate = RokuPlayer.create(req.params['rokuip']);
		rokumate.details(function(info) {
			var deviceConfig = registeredDevices[info.udn];
			info.name = deviceConfig.name;
			info.location = deviceConfig.location;
			info.address = req.params['rokuip']
			info.isConfigured = true;
		
		res.send(info);
	});
})

app.listen(3000, () => console.log('Ruko API on port 3000!'))

module.exports = app;
