const RokuPlayer = require('./rokuplayer');
const mqtt = require('mqtt');
const api = require('./api');

const config = require('./config.json');

const mqttServerUrl = config.mqttServerUrl;

const rokuDevices = [];

// setup mqtt
let mqttOptions;
if (mqttServerUrl.indexOf('mqtts') > -1) {
	mqttOptions = { key: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.key')),
		cert: fs.readFileSync(path.join(__dirname, 'mqttclient', '/client.cert')),
		ca: fs.readFileSync(path.join(__dirname, 'mqttclient', '/ca.cert')),
		checkServerIdentity: function() { return undefined }
	}
}

console.log("Connecting to " + mqttServerUrl);
let mqttClient = mqtt.connect(mqttServerUrl, mqttOptions);
mqttClient.on('connect', function() {
	console.log("Connected to " + mqttServerUrl);
	discoverDevices(rokuplayer => {
		registerRokuDevice(rokuplayer);
	});
});

mqttClient.on('message', function(topic, message) {
	console.log("Message recieved on " + topic);
	let ruko = rokuDevices[topic];
	let command = message.toString();
	ruko.processCommand(command);
	mqttClient.publish(ruko.statusTopic, "OK");
});

//add timer task to discover devices added to the network
// setInterval(() => {discoverDevices(rokuplayer => {
// 				registerRokuDevice(rokuplayer);
// 			})}, 5*60*1000);

function registerRokuDevice(rokuplayer){
		console.log("Subscribing to " + rokuplayer.commandTopic);
		mqttClient.subscribe(rokuplayer.commandTopic);
		rokuDevices[rokuplayer.commandTopic] = rokuplayer;
}

//discover devices
function discoverDevices(callback) {
	console.log("Looking for Roku devices...");
	RokuPlayer.discover(devices => {
		devices.forEach(d => {
			console.log("Found Roku at " + d.address);
			let rokuplayer = RokuPlayer.create(d.address);
			rokuplayer.details(function(info) {
				let deviceConfig = config[info.udn];
				if (deviceConfig == undefined) {
					console.log("Unknown Roku device, please add the following to config.json");

					let sampleConfig = {};
					smapleConfig[info.udn] = {
						"commandTopic":"/house/[location]/[name]/command",
						"statusTopic":"/house/[location]/[name]/status"
					};
					console.log(smapleConfig);
				}
				rokuplayer.commandTopic = deviceConfig.commandTopic;
				rokuplayer.statusTopic = deviceConfig.statusTopic;
				callback(rokuplayer);
			});
		})
	});
};


