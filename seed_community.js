const admin = require('firebase-admin');
const serviceAccount = require('./traffic-optimization-1e1bd-firebase-adminsdk-fbsvc-d55a57e4aa.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const communityPosts = [
  {
    author: "Aditya",
    title: "Dangerous Pothole on Nashik Road",
    content: "Caution! A very deep pothole has appeared near the Nashik Road railway station bridge. Multiple bikers have almost lost balance. Please drive slowly.",
    location: "Nashik Road",
    category: "Infrastructure",
    lang: "EN",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/994e721c8e62660bbfd78c1f42b1fd62917ec981.jpg",
    likes: 24,
    comments: 5
  },
  {
    author: "Rahul S.",
    title: "Heavy Traffic at CBS Circle",
    content: "CBS चौक पर बहुत भारी ट्रैफिक जाम है। सिग्नल ठीक से काम नहीं कर रहा है। कृपया इस रास्ते से बचने की कोशिश करें।",
    location: "CBS Circle",
    category: "Congestion",
    lang: "HI",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a21a1482e24d7f8442c66279c513f59f7a08aa47.jpg",
    likes: 15,
    comments: 3
  },
  {
    author: "Sneha P.",
    title: "पावसामुळे त्र्यंबक नाक्यावर पाणी साचले आहे",
    content: "त्र्यंबक नाका परिसरात मोठ्या प्रमाणावर पाणी साचले आहे. वाहतूक अत्यंत संथ गतीने चालली आहे. ड्रेनेजची समस्या गंभीर आहे.",
    location: "Trimbak Naka",
    category: "Infrastructure",
    lang: "MR",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/d098c755f1624d13ab34cdde6185e58c7f7c590d.jpg",
    likes: 42,
    comments: 12
  },
  {
    author: "Inspector Patil",
    title: "Minor Accident at Dwarka Circle",
    content: "A minor collision between two cars has caused a bottleneck at Dwarka Circle. Traffic police are on site. Expect 10-15 mins delay.",
    location: "Dwarka Circle",
    category: "Enforcement",
    lang: "EN",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a6406037812744bd83e5655d3d6be148b04693a2.jpg",
    likes: 8,
    comments: 2
  },
  {
    author: "Siddhesh T.",
    title: "Amazing Green Corridor Service!",
    content: "आज नाशिक मध्ये ग्रीन कॉरिडॉर मुळे रुग्णवाहिका फक्त ५ मिनिटात मुंबई नाक्यावरून द्वारका सर्कलला पोहोचली. मार्गवेध प्रणालीचे आभार! 🙏",
    location: "Mumbai Naka",
    category: "Safety",
    lang: "MR",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/95ce51d6ab839d088700c567095da6e65f5bd1d3.jpg",
    likes: 156,
    comments: 20
  }
];

const citizenReports = [
  {
    type: "Pothole",
    description: "Dangerous deep pothole near Nashik Road Station bridge. Risk to two-wheelers.",
    location: "Nashik Road Station",
    lat: 19.9625,
    lng: 73.8150,
    status: "Pending",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/994e721c8e62660bbfd78c1f42b1fd62917ec981.jpg",
    userId: "aditya_citizen"
  },
  {
    type: "Congestion",
    description: "Heavy peak hour traffic jam at CBS Circle. Signal timing needs adjustment.",
    location: "CBS Circle",
    lat: 20.0022,
    lng: 73.7844,
    status: "Active",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a21a1482e24d7f8442c66279c513f59f7a08aa47.jpg",
    userId: "rahul_citizen"
  },
  {
    type: "Waterlogging",
    description: "Severe flooding at Trimbak Naka intersection. Drainage blocked.",
    location: "Trimbak Naka",
    lat: 19.9925,
    lng: 73.7800,
    status: "Investigating",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/d098c755f1624d13ab34cdde6185e58c7f7c590d.jpg",
    userId: "sneha_citizen"
  },
  {
    type: "Accident",
    description: "Minor truck-car collision at Dwarka Circle. Blocking one lane.",
    location: "Dwarka Circle",
    lat: 19.9975,
    lng: 73.7938,
    status: "Police Responding",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/a6406037812744bd83e5655d3d6be148b04693a2.jpg",
    userId: "police_app"
  },
  {
    type: "Green Corridor",
    description: "Live Emergency: Green corridor active. All clear for ambulance.",
    location: "Mumbai Naka to Dwarka",
    lat: 19.9850,
    lng: 73.7888,
    status: "In Progress",
    imageUrl: "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/95ce51d6ab839d088700c567095da6e65f5bd1d3.jpg",
    userId: "emergency_admin"
  }
];

const seedData = async () => {
  console.log('--- CLEANUP START ---');
  
  const communityRef = db.collection('community_posts');
  const reportsRef = db.collection('citizen_reports');

  // Deleting Community Posts
  const communitySnapshot = await communityRef.get();
  const communityBatch = db.batch();
  communitySnapshot.docs.forEach((doc) => communityBatch.delete(doc.ref));
  await communityBatch.commit();
  console.log('Cleaned community_posts');

  // Deleting Citizen Reports
  const reportsSnapshot = await reportsRef.get();
  const reportsBatch = db.batch();
  reportsSnapshot.docs.forEach((doc) => reportsBatch.delete(doc.ref));
  await reportsBatch.commit();
  console.log('Cleaned citizen_reports');

  console.log('--- SEEDING START ---');

  // Seed Social Posts
  for (const post of communityPosts) {
    await communityRef.add({
      ...post,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Added Social Post: ${post.title}`);
  }

  // Seed Citizen Issues/Reports
  for (const report of citizenReports) {
    await reportsRef.add({
      ...report,
      submitted_at: new Date().toISOString(),
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Added Traffic Issue: ${report.type} at ${report.location}`);
  }

  console.log('--- ALL DATA SEEDED SUCCESSFULLY ---');
  process.exit(0);
};

seedData();
