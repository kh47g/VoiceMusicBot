"use strict";



if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is undefined!");



const PORT = process.env.PORT || 9989;

const BOT_TOKEN = process.env.BOT_TOKEN;

const GUIDE_MSG = "Send me audio file and\n" +
	"I'll send you voice message back!";

const HI_MSG = "Hi, nice to meet you!\n" + GUIDE_MSG;

const IDK_MSG = "I don't understand you!\n" + GUIDE_MSG;



let http = require("http");
let https = require("https");
let url = require("url");



let parseBody = function(cont) {
	return new Promise((resolve, reject) => {
		let body = [];

		cont.on("data", (chunk) => {
			body.push(chunk);
		}).on("end", () => {
			resolve(Buffer.concat(body).toString());
		});
	});
}


let apiTelegram = function(method, dataStr) {
	let httpsOptions = {
		hostname: "api.telegram.org",
		port: 443,
		path: `/bot${BOT_TOKEN}/${method}`,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(dataStr)
		},
	};

	return (new Promise((resolve, reject) => {
		let req = https.request(httpsOptions, res => {
			parseBody(res).then(resolve);
		});

		req.on("error", err => reject("ERROR:\n" + err));

		req.write(dataStr);
		req.end();
	})).catch(err => console.log(err)); // XXX

}


let onCommand = function(telegramMessageStr) {
	let { message } = JSON.parse(telegramMessageStr);

	console.log(message); // XXX

	if (message.hasOwnProperty("text") && message.text === "/start") {
		console.log("1:"); // XXX
		apiTelegram("sendMessage", JSON.stringify({
			"message": {
				"chat_id": message.from.id,
				"text": HI_MSG,
			},
		})).then(console.log); // XXX
	} else if (message.hasOwnProperty("audio")) {
		console.log("2:"); // XXX
		apiTelegram("sendVoice", JSON.stringify({
			"message": {
				"chat_id": message.from.id,
				"voice": message.audio.file_id,
			},
		})).then(console.log); // XXX
	} else {
		console.log("3:"); // XXX
		apiTelegram("sendMessage", JSON.stringify({
			"message": {
				"chat_id": message.from.id,
				"text": IDK_MSG,
			},
		})).then(console.log); // XXX
	}
}


let onRequest = function(req, res) {
	// telegram sends only POST requests
	if (req.method != "POST") {
		console.log("Non-Post request!")
		console.log(`${req.method} ${req.url} HTTP/${req.httpVersion}`);
		res.end();
		return;
	}

	let pathname = url.parse(req.url).pathname;

	// telegram sends request to host/<BOT_TOKEN>
	if (!pathname.startsWith("/" + BOT_TOKEN)) {
		console.log("Non-Telegram request")
		console.log(`${req.method} ${req.url} HTTP/${req.httpVersion}`);
		res.end();
		return;
	}

	parseBody(req).then(resolve => {
		console.log(body);
		onCommand(body);
		res.statusCode = 200;
		res.end();
	});
}


let onServerStart = function() {
	console.log("Server started!");
	console.log("PORT: " + PORT);
}



let server = http.createServer(onRequest);


server.listen(PORT, onServerStart);

