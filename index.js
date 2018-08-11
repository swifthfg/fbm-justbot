const
	request = require('request'),
	express = require('express'),
	body_parser = require('body-parser'),
	app = express().use(body_parser.json());
	require('dotenv').config()

app.listen(process.env.PORT || 1337, () => console.log('Webhook is up'));

app.post('/webhook', (req, res) => {
	let body = req.body;

	// Check the webhook event is from a Page subscription
	if (body.object === 'page') {
		let messagingEvents = req.body.entry[0].messaging
		for (let i = 0; i < messagingEvents.length; i++) {
			let mEvent = messagingEvents[0]
			let sender = mEvent.sender.id
			if (mEvent.message && mEvent.message.text) {
				let text = mEvent.message.text
				sendText(sender, "Echo: " + text)
			}
		}
		res.sendStatus(200)


		/*
		// Iterate over each entry - there may be multiple if batched
		body.entry.forEach(function(entry) {

			// Get the webhook event. entry.messaging is an array, but
			// will only ever contain one event, so we get index 0
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);
		});

		// Return a '200 OK' response to all events
		res.status(200).send('EVENT_RECEIVED');
		*/


	} else {
		res.sendStatus(404);
	}

});

function sendText(sender, textMessage) {
	let messageData = {text: textMessage}
	let receiptData = {id: sender}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs: {access_token: process.env.TOKEN},
		method: "POST",
		json: {
			receipt: receiptData,
			message: messageData
		}
	}, function(error, response, body) {
		if (error) {
			console.log("error occured");
		} else if (response.body.error) {
			console.log("response body error occured");
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
