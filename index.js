const
	constants = require("./constants");
	request = require('request'),
	rp = require('request-promise')
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
			getSenderName(sender).then(function(response) {
				if (mEvent.message && mEvent.message.text) {
					let text = mEvent.message.text
					if (doesItExistInArray(constants.hiWordsTR_customer, text.split())) {
						sendText(sender, "Merhaba " + response.name + ", nasıl yardımcı olabilirim?")
					} else {
						sendText(sender, "Nasıl gidiyor hayat?")
						sendPostbackMessage(sender, null)
					}
				}
				else if (mEvent.postback) {
					sendText(sender, "Postbacklediniz!")
				}
			})
			.catch(function(error) {
				console.log('error occured while fetching user name')
				console.error(error)
				res.sendStatus(422)
			})
		}
		res.sendStatus(200)
	} else {
		res.sendStatus(404)
	}
});

function sendPostbackMessage(sender, messageData=null) {
	if (messageData) {
		// TODO directly send messageData as message
	} else {
		var genericMessageData = {
			'attachment': {
				'type': 'template',
				'payload': {
					'template_type': 'generic',
					'elements': [{
						'title': 'Nasıl yardımcı olabilirim?',
						'subtitle': 'Size sağlayabileceğim hizmetlere göz atın.',
						'image_url': 'https://pbs.twimg.com/profile_images/830523441660968960/YozH1XXi_400x400.jpg',
						'buttons': [{
							'type': 'postback',
							'title': 'Justbot hakkında bilgi alabilir miyim?',
							'payload': 'İnsan değilim. İnsanlarla konuşmayı ve bilgi alışverişinde bulunmayı severim.',
						}, {
							'type': 'postback',
							'title': 'Hizmet verdiğiniz lokasyonları öğrenebilir miyim?',
							'payload': 'Biz her yerde hizmet vermekteyiz',
						}]
					}]
				}
			}
		}
		sendMessage(sender, genericMessageData)
	}
}

function sendText(sender, textMessage) {
	let messageData = {text: textMessage}
	sendMessage(sender, messageData)
}

function sendMessage(sender, messageData) {
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
	})
}

function getSenderName(senderId) {
	var options = {
		url: constants.graphURL + senderId,
		qs: {fields: 'name,birthday', access_token: process.env.TOKEN},
		method: "GET",
		json: true
	}
	return rp(options)
}
