/* global Module */

/* Magic Mirror
 * Module: MMM-messages
 *
 * By Paul-Vincent Roll http://paulvincentroll.com
 * MIT Licensed.
 */

Module.register('MMM-messages',{

	messages: [],

	defaults: {
		max: 5,
		format: false,
		types: {
			INFO: "normal",
			WARNING: "normal",
			ERROR: "bright"
		},
		icons: {
			INFO: "info",
			WARNING: "exclamation",
			ERROR: "exclamation-triangle"
		},
		shortenMessage: false
	},

	getStyles: function () {
		return ["font-awesome.css"];
	},

	getScripts: function() {
		return ["moment.js"];
	},

	start: function() {
		this.sendSocketNotification("CONNECT", {max: this.config.max, logFile: this.file('logs.json')});
		Log.info("Starting module: " + this.name);
		moment.locale(config.language);

		//Update DOM every minute so that the time of the call updates and calls get removed after a certain time
		setInterval(() => {
			this.updateDom();
		}, 60000);
	 },

	socketNotificationReceived: function(notification, payload) {


		if(notification === "NEW_MESSAGE"){
				if (payload.type == "VIDEO" ){
					var vidMessage = "<video  height='250' autoplay loop> <source src='" + payload.message + "' type='video/mp4'></video>"
					this.sendNotification("SHOW_ALERT", {type: "notification", title: payload.type, message: vidMessage});
				} else if (payload.type == "PHOTO" ) {
					var imgMessage = "<img src='" + payload.message + "' height='200'>"
					this.sendNotification("SHOW_ALERT", {type: "notification", title: payload.type, message: imgMessage});
				} else {
					var textMessage = "<div style='width:302px;'>" + payload.message + "</div>"
					this.sendNotification("SHOW_ALERT", {type: "notification", title: payload.type, message: textMessage});
				}

			this.messages.push(payload);
			while(this.messages.length > this.config.max){
				this.messages.shift();
			}
			this.updateDom(3000);
		}
	 },

	getDom: function() {

		var wrapper = document.createElement("div");
		if(this.config.title !== false){
			var title = document.createElement("header");
			title.innerHTML = this.config.title || "Messages";
			title.style.textAlign = "left";
			wrapper.appendChild(title);
		}


		//Show log messages
		var logs = document.createElement("table");

		for (var i = this.messages.length - 1; i >= 0; i--) {
			//Create callWrapper


			var message = this.messages[i].message;
			var type = this.messages[i].type;

			if (type == "TEXT"){
				var callWrapper = document.createElement("tr");
				callWrapper.classList.add("normal");

				if(this.config.shortenMessage && message.length > this.config.shortenMessage){
					message = message.slice(0, this.config.shortenMessage) + "&#8230;";
				}
				//Set caller of row
				var caller =  document.createElement("td");
				caller.style.width = "350px";
				caller.innerHTML = " " + message;
				caller.classList.add("title", "small", "align-left");
				if(this.config.types.hasOwnProperty(this.messages[i].type)){
					caller.classList.add(this.config.types[this.messages[i].type]);
				}
				callWrapper.appendChild(caller);
				//Set time of row
				var time =  document.createElement("td");
				time.innerHTML = this.config.format ? moment(this.messages[i].timestamp).format(this.config.format) : moment(this.messages[i].timestamp).fromNow();
				time.classList.add("time", "light", "xsmall");
				callWrapper.appendChild(time);

				//Add to logs
				logs.appendChild(callWrapper);

			} else {
				//Do Nothing
			}


		}

		wrapper.appendChild(logs);

		// show first image
		for (var i = this.messages.length - 1; i >= 0; i--) {
			var newMessage = this.messages[i].message
			var type = this.messages[i].type
			if (type == "VIDEO"){
				var video = document.createElement("video");
				video.src = newMessage;
				video.autoplay = true;
				video.type = "video/mp4";
				video.loop = true;
				video.style.height = "250px";

				wrapper.appendChild(video);
				i = -1;

			} else if (type == "PHOTO") {
				var image = document.createElement("img");

				image.src = newMessage;
				image.style.height = "250px";

				wrapper.appendChild(image);
				i = -1;
			}
		}
		return wrapper;
	}
});
