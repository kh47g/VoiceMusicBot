"use strict";



if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is undefined!");



const PORT = process.env.PORT || 9989;

const BOT_TOKEN = "/" + process.env.BOT_TOKEN;



let http = require("http");
let url = require("url");



let parseBody = function(req) {
	return new Promise((resolve, reject) => {
		let body = [];

		req.on("data", (chunk) => {
			body.push(chunk);
		}).on("end", () => {
			resolve(Buffer.concat(body).toString());
		});
	});
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

	if (!pathname.startsWith(BOT_TOKEN)) {
		console.log("Non-Telegram request")
		console.log(`${req.method} ${req.url} HTTP/${req.httpVersion}`);
		res.end();
		return;
	}

	parseBody(req).then(body => {
		console.log(body);
	});

	res.statusCode = 200;
	res.end();
}


let onServerStart = function() {
	console.log("Server started!");
	console.log("PORT: " + PORT);
}



let server = http.createServer(onRequest);


server.listen(PORT, onServerStart);

