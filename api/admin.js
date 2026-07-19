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

function verifySessionToken(username, sessionToken) {
  if (!sessionToken || typeof sessionToken !== 'string') return false;

  const parts = sessionToken.split('.');
  if (parts.length !== 2) return false;

  const [payloadEncoded, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(payloadEncoded)
    .digest('base64url');

  try {
    const sigBufA = Buffer.from(signature);
    const sigBufB = Buffer.from(expectedSignature);
    if (sigBufA.length !== sigBufB.length) return false;
    if (!crypto.timingSafeEqual(sigBufA, sigBufB)) return false;
  } catch (e) {
    return false;
  }

  const payload = Buffer.from(payloadEncoded, 'base64url').toString();
  const partsPayload = payload.split('|');
  if (partsPayload.length !== 2) return false;

  const [tokenUsername, expiryStr] = partsPayload;
  const expiry = parseInt(expiryStr, 10);

  if (tokenUsername !== username) return false;
  if (!expiry || isNaN(expiry) || Date.now() > expiry) return false;

  return true;
}
export default async function handler(req, res) {
  try {
    db = getFirestoreDb();
  } catch (error) {
    console.error('Eroare la inițializarea Firebase Admin:', error);
    return res.status(500).json({
      error: 'Serverul nu a putut inițializa Firebase Admin.'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, sessionToken, username, data, targetId } = req.body;

  const admins = {
    'SexyBadircea6969': process.env.ADMIN_1_PASS,
    's.m._.maria': process.env.ADMIN_2_PASS,
    'Fane': process.env.ADMIN_3_PASS,
    'Emi': process.env.ADMIN_4_PASS
  };

  const ACTIUNI_FARA_SESIUNE_ADMIN = ['claim_daily_reward', 'acorda_puncte', 'check_server_time', 'request_diploma'];

  if (!ACTIUNI_FARA_SESIUNE_ADMIN.includes(action)) {
    if (!admins[username] || !verifySessionToken(username, sessionToken)) {
      return res.status(403).json({ error: 'Neautorizat! Sesiune invalidă sau expirată.' });
    }
  }

  const currentTimestamp = new Date().toISOString();

  try {
    switch (action) {
      case 'claim_daily_reward': {
        const { userToken, userId } = data;

        if (!userToken || !userId) {
          return res.status(400).json({ error: 'Date incomplete pentru revendicare.' });
        }

        const decodedToken = await admin.auth().verifyIdToken(userToken);
        if (decodedToken.uid !== userId) {
          return res.status(403).json({ error: 'Identitate invalidă! Cerere neautorizată.' });
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          return res.status(404).json({ error: 'Utilizatorul nu există.' });
        }

        const userData = userDoc.data();
        const aziStr = new Date().toLocaleDateString("en-US");

        if (userData.lastDailyClaim === aziStr) {
          return res.status(400).json({ error: 'Ai revendicat deja recompensa pe ziua de azi!' });
        }

        const sansa = Math.random();
        let fieldsToUpdate = {};
        let message = "";
        let tipReward = "coins";

        if (sansa < 0.10) {
          tipReward = 'epic';
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
          fieldsToUpdate = {
            lastDailyClaim: aziStr,
            xp_booster_expires_at: expiresAt
          };
          message = "⚡ MEGA JACKPOT! Ai deblocat un 2x XP Booster pentru următoarea oră! ⚡";

        } else if (sansa < 0.25) {
          const puncteJackpot = 50;
          fieldsToUpdate = {
            lastDailyClaim: aziStr,
            puncte: (userData.puncte || 0) + puncteJackpot,
            puncteTotale: (userData.puncteTotale || 0) + puncteJackpot
          };
          message = `🎉 JACKPOT! Ai nimerit premiul cel mare de ${puncteJackpot} puncte! 🎉`;

        } else {
          const puncteNormale = Math.floor(Math.random() * 11) + 20;

          fieldsToUpdate = {
            lastDailyClaim: aziStr,
            puncte: (userData.puncte || 0) + puncteNormale,
            puncteTotale: (userData.puncteTotale || 0) + puncteNormale
          };
          message = `Ai primit ${puncteNormale} puncte ca Daily Reward! 🪙`;
        }

        await userRef.update(fieldsToUpdate);

        return res.status(200).json({
          success: true,
          rarity: tipReward,
          message: message
        });
      }

      case 'approve_diploma': {
        const { requestId, grant } = data;
        const reqRef = db.collection('diplomaRequests').doc(requestId);
        const reqDoc = await reqRef.get();
        if (!reqDoc.exists) return res.status(404).json({ error: 'Cererea nu există.' });

        const reqData = reqDoc.data();
        if (reqData.status !== 'pending') {
          return res.status(400).json({ error: 'Cererea a fost deja procesată.' });
        }

        if (!grant) {
          await reqRef.update({
            status: 'rejected',
            decidedBy: username,
            decidedAt: currentTimestamp,
            rejectReason: data.rejectReason || null
          });

          await db.collection('users').doc(reqData.studentId).collection('notifications').add({
            type: 'diploma_respinsa',
            text: data.rejectReason
              ? data.rejectReason
              : 'Cererea ta de diplomă a fost respinsă. Mai lucrează și cere din nou peste ceva timp.',
            read: false,
            createdAt: currentTimestamp
          });

          return res.status(200).json({ success: true });
        }

        const diplomaRef = await db.collection('diplomas').add({
          studentId: reqData.studentId,
          studentName: reqData.studentName,
          stats: reqData.stats,
          grantedBy: username,
          grantedAt: currentTimestamp,
          tier: data.tier,
          courseName: data.courseName || null
        });

        await reqRef.update({
          status: 'approved',
          diplomaId: diplomaRef.id,
          decidedBy: username,
          decidedAt: currentTimestamp
        });

        await db.collection('users').doc(reqData.studentId).collection('notifications').add({
          type: 'diploma_acordata',
          text: `Felicitări! Ai primit o diplomă. Vezi-o aici: /diploma/${diplomaRef.id}`,
          read: false,
          createdAt: currentTimestamp
        });

        return res.status(200).json({ success: true, diplomaId: diplomaRef.id });
      }

      case 'request_diploma': {
        const { userToken, userId } = data;

        if (!userToken || !userId) {
          return res.status(400).json({ error: 'Date incomplete.' });
        }

        const decodedToken = await admin.auth().verifyIdToken(userToken);
        if (decodedToken.uid !== userId) {
          return res.status(403).json({ error: 'Identitate invalidă!' });
        }

        const existingSnap = await db.collection('diplomaRequests')
          .where('studentId', '==', userId)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (!existingSnap.empty) {
          const last = existingSnap.docs[0].data();
          const lastDate = new Date(last.createdAt);
          const zileTrecute = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
          if (zileTrecute < 7) {
            return res.status(400).json({ error: `Mai poți cere peste ${Math.ceil(7 - zileTrecute)} zile.` });
          }
        }

        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        const progres = userData.progres || {};

        const lectiiSnap = await db.collection('lectii').get();
        const clasaPerLectie = {};
        lectiiSnap.forEach(doc => {
          clasaPerLectie[doc.id] = doc.data().clasa || 'necunoscut';
        });

        const statsClase = { 'clasa-9': 0, 'clasa-10': 0, 'clasa-11': 0 };

        Object.keys(progres).forEach(lessonId => {
          const dateProgres = progres[lessonId];
          if (!dateProgres) return;

          const eComplet = dateProgres.status === 'complet' ||
            dateProgres === true ||
            dateProgres === 'complet' ||
            (typeof dateProgres === 'object' && !dateProgres.status);

          if (!eComplet) return;

          const clasa = clasaPerLectie[lessonId];
          if (clasa === 'clasa-9') statsClase['clasa-9']++;
          else if (clasa === 'clasa-10') statsClase['clasa-10']++;
          else if (clasa === 'clasa-11') statsClase['clasa-11']++;
        });

        const reqRef = await db.collection('diplomaRequests').add({
          studentId: userId,
          studentName: userData.nume || userData.email || 'Necunoscut',
          stats: {
            lectiiClasa9: statsClase['clasa-9'],
            lectiiClasa10: statsClase['clasa-10'],
            lectiiClasa11: statsClase['clasa-11'],
            puncteTotale: userData.puncteTotale || 0,
            problemeRezolvate: userData.problemeRezolvateCount || 0
          },
          status: 'pending',
          createdAt: currentTimestamp
        });

        return res.status(200).json({ success: true, requestId: reqRef.id });
      }

      case 'list_diploma_requests': {
        const snap = await db.collection('diplomaRequests')
          .where('status', '==', 'pending')
          .orderBy('createdAt', 'desc')
          .get();
        const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.status(200).json({ success: true, requests });
      }


      case 'acorda_puncte': {
        const { userToken, userId, amount, extraFields } = data;

        if (!userToken || !userId || amount === undefined) {
          return res.status(400).json({ error: 'Date incomplete.' });
        }

        const decodedToken = await admin.auth().verifyIdToken(userToken);
        if (decodedToken.uid !== userId) {
          return res.status(403).json({ error: 'Identitate invalidă! Cerere neautorizată.' });
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          return res.status(404).json({ error: 'Utilizatorul nu există.' });
        }

        const userData = userDoc.data();

        const updateData = {
          puncte: (userData.puncte || 0) + amount,
          puncteTotale: (userData.puncteTotale || 0) + amount,
          ...extraFields
        };

        await userRef.update(updateData);

        return res.status(200).json({ success: true, message: `Ai primit ${amount} puncte!` });
      }

      case 'publish_lesson': {
        const { isEditing, propunereInCurs, clasaFinala, ordineFinala, fId, lectieData } = data;
        const batch = db.batch();
        const lectiiRef = db.collection('lectii');

        if (!isEditing && !propunereInCurs) {
          const snapVerificare = await lectiiRef
            .where('clasa', '==', clasaFinala)
            .where('ordine', '==', ordineFinala)
            .get();

          if (!snapVerificare.empty) {
            const snapDecalare = await lectiiRef
              .where('clasa', '==', clasaFinala)
              .where('ordine', '>=', ordineFinala)
              .get();

            snapDecalare.forEach((document) => {
              const docRef = lectiiRef.doc(document.id);
              batch.update(docRef, {
                ordine: document.data().ordine + 1,
                cheieSecuritate: sessionToken,
                adminUsername: username
              });
            });
          }
        }

        const nouaLectieRef = lectiiRef.doc(fId);
        batch.set(nouaLectieRef, {
          ...lectieData,
          cheieSecuritate: sessionToken,
          adminUsername: username
        }, { merge: true });

        if (propunereInCurs) {
          const propRef = db.collection('propuneri_lectii').doc(propunereInCurs);
          batch.delete(propRef);
        }
        const metaRef = db.collection('meta').doc('lectii');
        batch.set(metaRef, { ultimaActualizare: Date.now() }, { merge: true });
        await batch.commit();
        return res.status(200).json({ success: true });
      }

      case 'delete_lesson':
        await db.collection('lectii').doc(targetId).delete();
        return res.status(200).json({ success: true });

      case 'add_todo':
        const todoRef = await db.collection('admin_todo').add({
          text: data.text, author: username, completed: false, createdAt: currentTimestamp,
          cheieSecuritate: sessionToken, adminUsername: username
        });
        return res.status(200).json({ success: true, id: todoRef.id });

      case 'toggle_todo':
        await db.collection('admin_todo').doc(targetId).update({
          completed: data.completed, cheieSecuritate: sessionToken, adminUsername: username
        });
        return res.status(200).json({ success: true });

      case 'delete_todo':
        await db.collection('admin_todo').doc(targetId).delete();
        return res.status(200).json({ success: true });

      case 'send_notification': {
        await db.collection('users').doc(data.userId).collection('notifications').add({
          type: data.type,
          text: data.text,
          read: false,
          createdAt: currentTimestamp
        });
        return res.status(200).json({ success: true });
      }

      case 'send_announcement': {
        let targetIds = data.userIds;
        if (targetIds === 'all' || (Array.isArray(targetIds) && targetIds.includes('all'))) {
          const allUsersSnap = await db.collection('users').get();
          targetIds = allUsersSnap.docs.map((d) => d.id);
        }

        let batch = db.batch();
        let count = 0;

        for (const uid of targetIds) {
          const notifRef = db.collection('users').doc(uid).collection('notifications').doc();
          batch.set(notifRef, {
            type: 'anunt_admin',
            text: data.text,
            read: false,
            createdAt: currentTimestamp
          });
          count++;

          if (count === 500) {
            await batch.commit();
            batch = db.batch();
            count = 0;
          }
        }
        if (count > 0) await batch.commit();

        return res.status(200).json({ success: true, count: targetIds.length });
      }

      case 'reject_proposal': {
        if (data.autorId) {
          await db.collection('users').doc(data.autorId).collection('notifications').add({
            type: 'lectie_respinsa',
            text: `Propunerea ta pentru lecția „${data.titlu}" a fost respinsă.`,
            read: false,
            createdAt: currentTimestamp
          });
        }
        await db.collection('propuneri_lectii').doc(data.proposalId).delete();
        return res.status(200).json({ success: true });
      }

      case 'reply_message': {
        await db.collection('contact_messages').doc(data.messageId).update({
          answered: true,
          raspuns: data.raspuns,
          raspunsAdmin: data.numeAdmin,
          raspunsLa: currentTimestamp
        });
        if (data.userUid) {
          await db.collection('users').doc(data.userUid).collection('notifications').add({
            type: 'contact_raspuns',
            text: `${data.numeAdmin} ți-a răspuns la mesaj: "${data.raspuns}"`,
            read: false,
            createdAt: currentTimestamp
          });
        }
        return res.status(200).json({ success: true });
      }

      case 'delete_message': {
        if (!data?.messageId) {
          return res.status(400).json({ success: false, message: 'ID-ul mesajului lipsește.' });
        }
        await db.collection('contact_messages').doc(data.messageId).delete();
        return res.status(200).json({ success: true });
      }

      case 'list_messages': {
        const snap = await db.collection('contact_messages').orderBy('createdAt', 'desc').get();
        const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.status(200).json({ success: true, messages });
      }

      case 'list_proposals': {
        const snap = await db.collection('propuneri_lectii').orderBy('createdAt', 'desc').get();
        const proposals = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.status(200).json({ success: true, proposals });
      }

      case 'list_todos': {
        const snap = await db.collection('admin_todo').orderBy('createdAt', 'desc').get();
        const todoList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return res.status(200).json({ success: true, todos: todoList });
      }

      case 'update_user': {
        await db.collection('users').doc(data.targetId).update(data.fields);
        return res.status(200).json({ success: true });
      }

      case 'list_users_minimal': {
        const usersSnap = await db.collection('users').get();
        const users = usersSnap.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username || '',
          email: doc.data().email || ''
        }));
        return res.status(200).json({ success: true, users });
      }

      case 'check_server_time': {
        return res.status(200).json({
          success: true,
          serverTimeISO: new Date().toISOString(),
          serverTimestamp: Date.now(),
          clientTimeISOFromRequest: data?.clientTime || 'N/A'
        });
      }

      case 'broadcast_announcement': {
        const { type, userId, text } = data;

        if (type === 'unul') {
          if (!userId) return res.status(400).json({ success: false, message: 'ID-ul utilizatorului lipsește.' });

          await db.collection('users').doc(userId).collection('notifications').add({
            type: 'anunt_admin',
            text: text,
            read: false,
            createdAt: currentTimestamp,
            adminUsername: username
          });

          return res.status(200).json({ success: true, message: 'Notificare trimisă cu succes!' });
        }

        if (type === 'toti') {
          const usersSnap = await db.collection('users').get();
          let batch = db.batch();
          let count = 0;

          for (const userDoc of usersSnap.docs) {
            const notifRef = db.collection('users').doc(userDoc.id).collection('notifications').doc();
            batch.set(notifRef, {
              type: 'anunt_admin',
              text: text,
              read: false,
              createdAt: currentTimestamp,
              adminUsername: username
            });
            count++;

            if (count === 500) {
              await batch.commit();
              batch = db.batch();
              count = 0;
            }
          }
          if (count > 0) await batch.commit();

          return res.status(200).json({ success: true, message: `Anunț trimis la toți cei ${usersSnap.size} utilizatori!` });
        }

        return res.status(400).json({ success: false, message: 'Tip de anunț invalid.' });
      }

      default:
        return res.status(400).json({ error: 'Acțiune necunoscută!' });
    }
  } catch (error) {
    console.error(`Eroare la executarea acțiunii ${action}:`, error);
    return res.status(500).json({ error: 'A apărut o eroare internă pe server.' });
  }
}