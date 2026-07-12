import admin from 'firebase-admin';
import crypto from 'crypto';

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

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const TOKEN_VALID_HOURS = 8;

function safeCompare(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function generateSessionToken(username) {
  const expiry = Date.now() + TOKEN_VALID_HOURS * 60 * 60 * 1000;
  const payload = `${username}.${expiry}`;
  const payloadEncoded = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(payloadEncoded)
    .digest('base64url');
  return `${payloadEncoded}.${signature}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Date incomplete.' });
  }

  let firestore;
  try {
    firestore = getFirestoreDb();
  } catch (error) {
    console.error('Eroare la inițializarea Firebase Admin:', error);
    return res.status(500).json({ success: false, error: 'Eroare internă de server.' });
  }

  const attemptsRef = firestore.collection('login_attempts').doc(username);

  try {
    const attemptsSnap = await attemptsRef.get();
    if (attemptsSnap.exists) {
      const attemptsData = attemptsSnap.data();
      if (attemptsData.lockedUntil && attemptsData.lockedUntil > Date.now()) {
        const minuteRamase = Math.ceil((attemptsData.lockedUntil - Date.now()) / 60000);
        return res.status(429).json({
          success: false,
          error: `Prea multe încercări eșuate. Încearcă din nou peste ${minuteRamase} minute.`
        });
      }
    }
  } catch (error) {
    console.error('Eroare la verificarea rate limiting:', error);
  }

  const admins = {
    'SexyBadircea6969': process.env.ADMIN_1_PASS,
    's.m._.maria': process.env.ADMIN_2_PASS,
    'Fane': process.env.ADMIN_3_PASS,
    'Emi': process.env.ADMIN_4_PASS
  };

  const expectedPassword = admins[username];

  const parolaCorecta = expectedPassword ? safeCompare(password, expectedPassword) : false;

  if (parolaCorecta) {
    try {
      await attemptsRef.set({ failedCount: 0, lockedUntil: null }, { merge: true });
    } catch (error) {
      console.error('Eroare la resetarea contorului de încercări:', error);
    }

    const sessionToken = generateSessionToken(username);

    return res.status(200).json({
      success: true,
      username,
      sessionToken
    });
  }

  try {
    const attemptsSnap = await attemptsRef.get();
    const currentCount = attemptsSnap.exists ? (attemptsSnap.data().failedCount || 0) : 0;
    const newCount = currentCount + 1;

    const updateData = { failedCount: newCount, lastAttempt: Date.now() };
    if (newCount >= MAX_FAILED_ATTEMPTS) {
      updateData.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      updateData.failedCount = 0;
    }

    await attemptsRef.set(updateData, { merge: true });
  } catch (error) {
    console.error('Eroare la înregistrarea încercării eșuate:', error);
  }

  return res.status(401).json({
    success: false,
    error: 'Utilizator sau parolă incorectă!'
  });
}