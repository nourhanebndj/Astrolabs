const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const jwt = require("jsonwebtoken");
admin.initializeApp();

const PAYPAL_API = "https://api-m.sandbox.paypal.com";

const ZOOM_API_KEY = functions.config().zoom.api_key;
const ZOOM_API_SECRET = functions.config().zoom.api_secret;

// Function to generate JWT
const generateZoomJWT = () => {
  return jwt.sign(
      { iss: ZOOM_API_KEY, exp: Math.floor(Date.now() / 1000) + 3600 },
      ZOOM_API_SECRET
  );
};

exports.createZoomMeeting = functions.https.onCall(async (data) => {
  const token = generateZoomJWT();
  const config = {
      headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
      },
  };

  const body = {
      topic: data.topic,
      type: 2,
      start_time: data.start_time,
      duration: data.duration,
      timezone: "Asia/Riyadh",
      settings: {
          host_video: true,
          participant_video: true,
      },
  };

  try {
      const response = await axios.post("https://api.zoom.us/v2/users/me/meetings", body, config);
      return response.data;
  } catch (error) {
      console.error("Failed to create Zoom meeting:", error.response ? JSON.stringify(error.response.data) : "No response data");
      console.error("Status code:", error.response ? error.response.status : "No status code");
      console.error("Headers:", JSON.stringify(error.response ? error.response.headers : "No headers"));
      throw new functions.https.HttpsError("internal", "Failed to create Zoom meeting", JSON.stringify(error.response.data));
  }
});


const getAccessToken = async () => {
  const client = functions.config().paypal.client;
  const secret = functions.config().paypal.secret;

  try {
    const response = await axios({
      url: `${PAYPAL_API}/v1/oauth2/token`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${client}:${secret}`).toString(
            "base64",
        )}`,
      },
      data: "grant_type=client_credentials",
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
};

exports.createPayment = functions.https.onRequest(async (req, res) => {
  try {
    const {price} = req.body;
    console.log(`Received price: ${price}`);

    if (!price || isNaN(price)) {
      console.error("Invalid price received:", price);
      return res.status(400).send("Invalid price");
    }

    const accessToken = await getAccessToken();
    const response = await axios({
      url: `${PAYPAL_API}/v1/payments/payment`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      data: {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        transactions: [
          {
            amount: {
              total: price.toFixed(2),
              currency: "USD",
            },
          },
        ],
        redirect_urls: {
          return_url: "https://astrolabs-1a622.firebaseapp.com/paypal/execute",
          cancel_url: "https://astrolabs-1a622.firebaseapp.com/paypal/cancel",
        },
      },
    });

    console.log("Payment creation response:", response.data);
    res.status(200).send(response.data);
  } catch (error) {
    console.error("Error creating payment:", error);
    if (error.response) {
      console.error("PayPal API response:", error.response.data);
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send("Error creating payment");
    }
  }
});


exports.executePayment = functions.https.onRequest(async (req, res) => {
  const {paymentId, payerId} = req.query;
  try {
    const accessToken = await getAccessToken();
    const response = await axios({
      url: `${PAYPAL_API}/v1/payments/payment/${paymentId}/execute`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      data: {
        payer_id: payerId,
      },
    });
    console.log("Payment execution response:", response.data);
    res.status(200).send(response.data);
  } catch (error) {
    console.error("Error executing payment:",
       error.response ? error.response.data : error.message);
    res.status(500).send("Error executing payment");
  }
});
// Notification for new messages
exports.sendMessageNotification = functions.firestore
  .document('Messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const { receiverId, senderId, message: messageText } = message;

    const payload = {
      notification: {
        title: 'New Message',
        body: messageText,
        sound: 'default',
      },
      data: {
        senderId,
        messageId: context.params.messageId,
      },
    };

    // Get the receiver's FCM token from the Firestore users collection
    const userDoc = await admin.firestore().collection('users').doc(receiverId).get();
    const user = userDoc.data();
    const fcmToken = user.fcmToken;

    // Send notification
    if (fcmToken) {
      admin.messaging().sendToDevice(fcmToken, payload)
        .then(response => {
          console.log('Notification sent successfully:', response);
        })
        .catch(error => {
          console.error('Error sending notification:', error);
        });
    } else {
      console.log('No FCM token for receiver:', receiverId);
    }
  });