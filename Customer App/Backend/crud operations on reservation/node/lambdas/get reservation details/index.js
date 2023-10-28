/**
 * get reservation details
*/

const admin = require('firebase-admin');

// Initializing Firebase Admin SDK with service account credentials
const serviceAccount = require('./serviceAccountKey.json'); // file path for service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://serverless-term-assignment.firebaseio.com', // Firebase project URL
});

// to test it locally
/*
 const event = {
  user_id: 777
};
const context = {};
*/

exports.handler = async (event, context) => {
  try {
    // Initialize Firestore

    console.log("====",event,event.queryStringParameters)
    const db = admin.firestore();
    user_id = event['queryStringParameters']['user_id'] 

    // Reference to the Firestore collection
    const collectionRef = db.collection('Customer-Reservation'); // collection name
    
    // getting the document 
    const docRef = await collectionRef.where('user_id','==', parseInt(user_id)).get();
    
    if (docRef.empty) {
      console.log('No matching documents.');
    return;
    }  

    docRef.forEach(doc => {
    console.log("doc_id : "+ doc.id )
    console.log(doc.id, '=>', doc.data());
    });

    // success reponse message
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      isBase64Encoded: false,
      body: JSON.stringify({
        message: 'Document retreived successfully',
        document: docRef.docs.map(doc => doc.data()),
      }),
    };
  } catch (error) {
    // error reponse message
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      isBase64Encoded: false,
      body: JSON.stringify({
        error: 'Failed to retreive document',
        message: error.message,
      }),
    };
  }
};

//to test it locally
//const result = exports.handler(event, context);
//console.log(result);