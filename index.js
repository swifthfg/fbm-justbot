const
	constants = require("./constants");
	request = require('request'),
	express = require('express'),
	body_parser = require('body-parser'),
	app = express().use(body_parser.json());
	require('dotenv').config()

app.listen(process.env.PORT || 1337, () => console.log('Webhook is up'));

app.get('/', function (req, res) {
	res.send('Welcome to JUSTBOT')
})

// Receives message and respond with proper text or postback options
app.post('/webhook', (req, res) => {
	let body = req.body;

	// Check the webhook event is from a Page subscription
	if (body.object === 'page') {
		let messagingEvents = req.body.entry[0].messaging
		for (let i = 0; i < messagingEvents.length; i++) {
			let mEvent = messagingEvents[i]
			let sender = mEvent.sender.id

			console.log("sender: " + sender);

			if (mEvent.message && mEvent.message.text) {
				let text = mEvent.message.text
				if (doesItExistInArray(constants.hiWordsTR_customer, text.split())) {
					sendText(sender, "Merhaba Faruk, nasıl yardımcı olabilirim?")
				} else {
					sendText(sender, "Nasıl gidiyor hayat?")
				}
			}
		}
		res.sendStatus(200)
	} else {
		res.sendStatus(404)
	}
});

function sendText(sender, textMessage) {
	let messageData = {text: textMessage}
	let recipientData = {id: sender}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token: process.env.TOKEN},
		method: "POST",
		json: {
			recipient: recipientData,
			message: messageData
		}
	}, function(error, response, body) {
		if (error) {
			console.log("error occured");
			console.error(error);
		} else if (response.body.error) {
			console.log("response body error occured");
			console.error(response.body.error);
		}
	})
}

app.get('/webhook', (req, res) => {
	const VERIFY_TOKEN = process.env.TOKEN;

	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];

	if (mode && token) {
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);
		} else {
			res.sendStatus(403);
		}
	}
});


/* ############################################################ UTILS ############################################################ */

function doesItExistInArray(haystack, arr) {
	return arr.some(function (v) {
		return haystack.indexOf(v) >= 0;
	});
};
