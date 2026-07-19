import admin from 'firebase-admin';

let db = null;
function getFirestoreDb() {
  if (db) return db;
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
  db = admin.firestore();
  return db;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID lipsă.' });

  try {
    db = getFirestoreDb();
    const snap = await db.collection('diplomas').doc(id).get();

    if (!snap.exists) {
      res.setHeader('Cache-Control', 'public, max-age=60'); 
      return res.status(404).json({ error: 'Diplomă negăsită.' });
    }

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).json({ success: true, diploma: snap.data() });
  } catch (error) {
    console.error('Eroare diploma-view:', error);
    return res.status(500).json({ error: 'Eroare server.' });
  }
}