const client = require('firebase-tools');

process.env.GOOGLE_APPLICATION_CREDENTIALS = 'e:\\MargVedhaMain\\traffic-optimization-1e1bd-firebase-adminsdk-fbsvc-d55a57e4aa.json';

console.log('Using service account credentials for deployment...');

client.deploy({
  project: 'traffic-optimization-1e1bd',
  only: 'hosting'
}).then(() => {
  console.log('Successfully deployed to Firebase Hosting!');
}).catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
