const Roku = require('rokujs');

var roku;

function RokuPlayer(address) {
	roku = new Roku(address);
};

RokuPlayer.classtype = "media";
RokuPlayer.discover = async function (callback) {
	var devices = await Roku.discover();
	callback(devices);
};

RokuPlayer.create = function(address) {
	var rokumate = new RokuPlayer(address);
	return rokumate;
};

RokuPlayer.prototype.details = function(callback) {
	roku.deviceInfo(callback);
};

RokuPlayer.prototype.processCommand = function(key) {
	roku.press(key);
};

module.exports = RokuPlayer;
