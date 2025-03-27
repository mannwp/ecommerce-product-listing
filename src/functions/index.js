// functions/index.js
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

exports.onUserSignUp = functions.auth.user().onCreate(async (user) => {
  const userData = {
    name: user.displayName || 'Anonymous',
    email: user.email || '',
    profilePicture: user.photoURL,
    role: 'user', // Default role
  }

  // Store user details in Firestore
  await admin.firestore().collection('users').doc(user.uid).set(userData)

  // Optionally set custom claims for role-based access
  await admin.auth().setCustomUserClaims(user.uid, { role: 'user' })
})
