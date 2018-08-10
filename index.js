

const
	request = require('request'),
	express = require('express'),
	body_parser = require('body-parser'),
	app = express().use(body_parser.json());
	require('dotenv').config()

app.listen(process.env.PORT || 1337, () => console.log('Webhook is listening'));

app.post('/webhook', (req, res) => {

	// Parse the request body from the POST
	let body = req.body;

	// Check the webhook event is from a Page subscription
	if (body.object === 'page') {

		// Iterate over each entry - there may be multiple if batched
		body.entry.forEach(function(entry) {

			// Get the webhook event. entry.messaging is an array, but
			// will only ever contain one event, so we get index 0
			let webhook_event = entry.messaging[0];
			console.log(webhook_event);
	});

	// Return a '200 OK' response to all events
	res.status(200).send('EVENT_RECEIVED');

	} else {
		// Return a '404 Not Found' if event is not from a page subscription
		res.sendStatus(404);
	}

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

	const VERIFY_TOKEN = process.env.TOKEN;

	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];

	// Check if a token and mode were sent
	if (mode && token) {
		// Check the mode and token sent are correct
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {

			// Respond with 200 OK and challenge token from the request
			console.log('WEBHOOK_VERIFIED');
			res.status(200).send(challenge);

		} else {
			// Responds with '403 Forbidden' if verify tokens do not match
			res.sendStatus(403);
		}
	}
});
