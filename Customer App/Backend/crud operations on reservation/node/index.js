const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require('./serviceAccountKey.json'); // Update with your file path
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://serverless-term-assignment.firebaseio.com', // Replace with your Firebase project URL
});

exports.handler = async (event, context) => {
  try {
    // Initialize Firestore
    const db = admin.firestore();
   
    // Data to be added to the Firestore document
    const dataToStore = {
      user_id: event.user_id, // Replace with the actual data you want to store
      restaurant_id: event.restaurant_id,
      no_of_people: event.no_of_people,
      //timestamp: new Date().toISOString(),
      // Add other data fields as needed
    };

    // Reference to the Firestore collection
    const collectionRef = db.collection('Customer-Reservation'); // Replace with your collection name
    
    // Add a new document with a generated ID
    const docRef = await collectionRef.add(dataToStore);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Document added successfully',
        document_id: docRef.id,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to add document',
        message: error.message,
      }),
    };
  }
};
