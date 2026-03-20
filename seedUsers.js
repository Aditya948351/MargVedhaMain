const admin = require('firebase-admin');
const serviceAccount = require('./traffic-optimization-1e1bd-firebase-adminsdk-fbsvc-d55a57e4aa.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const createUsers = async () => {
  const users = [
    { email: 'admin@nashikcity.gov.in', password: 'AdminPassword@123', displayName: 'City Authority' }
  ];

  for (let i = 1; i <= 20; i++) {
    users.push({
      email: `police${i}@nashikcity.gov.in`,
      password: 'PolicePassword@123',
      displayName: `Junction ${i} Police`
    });
  }

  console.log('Starting user creation process...');

  for (const user of users) {
    try {
      await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
      });
      console.log(`Successfully created: ${user.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`User already exists: ${user.email}`);
      } else {
        console.error(`Error creating user ${user.email}:`, error.message);
      }
    }
  }

  console.log('Finished user creation process.');
  process.exit(0);
};

createUsers();
