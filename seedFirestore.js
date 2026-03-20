const admin = require('firebase-admin');
const serviceAccount = require('./traffic-optimization-1e1bd-firebase-adminsdk-fbsvc-d55a57e4aa.json');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const nashikJunctions = [
  { id: 1, name: "CBS Circle" },
  { id: 2, name: "Ashok Stambh" },
  { id: 3, name: "Raviwar Karanja" },
  { id: 4, name: "Panchavati Karanja" },
  { id: 5, name: "Dwarka Circle" },
  { id: 6, name: "Mumbai Naka" },
  { id: 7, name: "City Centre Mall Signal" },
  { id: 8, name: "Trimbak Naka" },
  { id: 9, name: "Bapu Pool" },
  { id: 10, name: "Upnagar Naka" },
  { id: 11, name: "Bytco Point" },
  { id: 12, name: "Satpur Garware Point" },
  { id: 13, name: "ITI Signal" },
  { id: 14, name: "Pappu Samosa Signal" },
  { id: 15, name: "Govind Nagar Square" },
  { id: 16, name: "Indira Nagar Jogging Track" },
  { id: 17, name: "Pathardi Phata" },
  { id: 18, name: "Makhmalabad Naka" },
  { id: 19, name: "Mhasrul Naka" },
  { id: 20, name: "Adgaon Naka" }
];

const seedFirestore = async () => {
  console.log('Starting Firestore seeding process for traffic_police collection...');

  for (let i = 0; i < nashikJunctions.length; i++) {
    const junction = nashikJunctions[i];
    const email = `police${junction.id}@nashikcity.gov.in`;
    
    // Generate some random initial live counts to demonstrate activity
    const randomCount = Math.floor(Math.random() * 150) + 10;
    
    // Status logic based on count
    let status = "Active";
    if (randomCount > 100) status = "Congested";
    if (randomCount < 30) status = "Clear";

    const docRef = db.collection('traffic_police').doc(`Junction_${junction.id}`);

    try {
      await docRef.set({
        email: email,
        junctionId: junction.id,
        junctionName: junction.name,
        officerName: `Officer Rank ${junction.id}`,
        liveVehicleCount: randomCount,
        status: status,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Successfully seeded junction: ${junction.name} (${email})`);
    } catch (error) {
      console.error(`Error seeding junction ${junction.name}:`, error.message);
    }
  }

  // Also create a master Admin profile doc just in case we need it later
  try {
    await db.collection('admin_profiles').doc('master_admin').set({
      email: 'admin@nashikcity.gov.in',
      role: 'City Authority',
      name: 'Nashik Main Branch',
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Successfully seeded master admin profile.');
  } catch (error) {
    console.error('Error seeding admin profile:', error.message);
  }

  console.log('Finished FireStore seeding process.');
  process.exit(0);
};

seedFirestore();
