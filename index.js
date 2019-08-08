'use strict'
const express = require('express')
const bodyParser = require('body-parser')
const app = express().use(bodyParser.json())
const request = require('request')
// function handeMessage (sender_psid, received_message) {
//   let response
//   if (received_message.text) {
//     response = {
//       'text': `you sent the message: ${received_message.text}.Now send me an image!`
//     }
//   } else if (received_message.attachments) {
//     let attachment_url = received_message.attachments[0].payload.url
//     response = {
//       "attachement": {
//         "type": "template",
//         "payload": {
//           "template_type": "generic",
//           "elements": [{
//             "title": "Is this the right picture?",
//             "subtitle": "Tap a button to answer",
//             "image_url": attachment_url,
//             "buttons": [
//               {
//                 "type": "postback",
//                 "title": "Yes",
//                 "payload": "yes"
//               },
//               {
//                 "type": "postback",
//                 "title": "No!",
//                 "payload": "no",
//               }
//             ],
//           }]
//         }
//       }
//     }
//   }
//   callSendAPI(sender_psid, response)
// }
function handleMessage(sender_psid, received_message) {
  let response;
    
    // Checks if the message contains text
    if (received_message.text) {    
      // Create the payload for a basic text message, which
      // will be added to the body of our request to the Send API
      response = {
        "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
      }
    } else if (received_message.attachments) {
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Is this the right picture?",
              "subtitle": "Tap a button to answer.",
              "image_url": attachment_url,
              "buttons": [
                {
                  "type": "postback",
                  "title": "Yes!",
                  "payload": "yes",
                },
                {
                  "type": "postback",
                  "title": "No!",
                  "payload": "no",
                }
              ],
            }]
          }
        }
      }
    } 
    
    // Send the response message
    callSendAPI(sender_psid, response);    
  }
  
function handlePostback (sender_psid, received_postback) {
  let response
  let payload = received_postback.payload
  if (payload === 'yes') {
    response = { 'text': 'Thanks!' }
  } else if (payload === 'no') {
    response = { 'text': 'Oops, try sending another image.' }
  }
  callSendAPI(sender_psid, response)
}
function callSendAPI (sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
//   console.log(response, '<<<<<<<<<<<<<<<<<<<response')
  console.log(request_body, '<<<<<<< req_body')
  request({
    // 'qs': 'EAAJN50qr7CYBABLUgugbgpXb8cYPjkZAjF1arcWDbjJF8QEmGOOyQvGJUyfPrKGBfHVPUKBZC3UyzpDGtaZBXKhtpcDUFdNZCigZBq6N3XYXIiAs5PdKdZAWBmy5WF5eZCMavpPmDGRT9CxfN7DLtwFTAAnxngDJ7wkD6Iy35ZBHVAZDZD',
    // 'qs': {'access_token': process.env.PAGE_ACCESS_TOKEN},
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {"access_token": },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent')
    } else {
      console.error('unable to send message' + err)
    }
  })
}
app.post('/webhook', (req, res) => {
  let body = req.body
  if (body.object === 'page') {
    body.entry.forEach(function (entry) {
      let webhook_event = entry.messaging[0]
      console.log(webhook_event)
      let sender_psid = webhook_event.sender.id
    //   console.log('Sender PSID ' + sender_psid)
      
      let receiver_psid = webhook_event.recipient.id
    //   console.log('Receiver PSID ', receiver_psid)
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message)
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback)
      }
    })
    res.status(200).send('Event received')
  } else {
    res.sendStatus(404)
  }
})
app.get('/webhook', (req, res) => {
//   let VERIFY_TOKEN = process.env.VERIFY_TOKEN
  let VERIFY_TOKEN = ''
  let mode = req.query['hub.mode']
  let token = req.query['hub.verify_token']
  let challenge = req.query['hub.challenge']
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified')
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
  } else {
    res.sendStatus(404)
  }
})
const PORT = 1337;
app.listen(PORT, () => console.log(`webhook is listening on ${PORT}`))
