const admin = require('firebase-admin');
const serviceAccount = require('./traffic-optimization-1e1bd-firebase-adminsdk-fbsvc-d55a57e4aa.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const samplePosts = [
  {
    author: "Aditya",
    title: "Dangerous Pothole on Nashik Road",
    content: "Caution! A very deep pothole has appeared near the Nashik Road railway station bridge. Multiple bikers have almost lost balance. Please drive slowly.",
    location: "Nashik Road",
    category: "Infrastructure",
    lang: "EN",
    imageUrl: "https://images.unsplash.com/photo-1599406161100-33068936997f?q=80&w=2070&auto=format&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1506015391300-4802dc7bbde2?q=80&w=2042&auto=format&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1541913066827-400e2193237a?q=80&w=1974&auto=format&fit=crop",
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
    imageUrl: "https://images.unsplash.com/photo-1574621100236-40742d4a5da2?q=80&w=2072&auto=format&fit=crop",
    likes: 8,
    comments: 2
  }
];

const seedCommunity = async () => {
  console.log('Starting Community Hub seeding...');
  const colRef = db.collection('community_posts');

  for (const post of samplePosts) {
    try {
      await colRef.add({
        ...post,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Added post: ${post.title}`);
    } catch (error) {
      console.error(`Error adding post ${post.title}:`, error.message);
    }
  }

  console.log('Finished seeding community posts.');
  process.exit(0);
};

seedCommunity();
