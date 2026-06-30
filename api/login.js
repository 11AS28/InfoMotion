// api/login.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  const admins = {
    'SexyBadircea6969': process.env.ADMIN_1_PASS,
    's.m._.maria':      process.env.ADMIN_2_PASS,
    'Fane':             process.env.ADMIN_3_PASS,
    'Emi':              process.env.ADMIN_4_PASS
  };

  const expectedPassword = admins[username];

  if (expectedPassword && password === expectedPassword) {
    return res.status(200).json({
      success: true,
      username,
      sessionToken: password
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Utilizator sau parolă incorectă!'
  });
}