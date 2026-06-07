// api/login.js

export default async function handler(req, res) {
  // Permitem doar cereri de tip POST (securitate de bază pentru endpoint-uri de autentificare)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  // Citim variabilele de mediu securizate de pe serverul Vercel (fără prefixul VITE_)
  const admins = {
    'SexyBadircea6969': process.env.ADMIN_1_PASS,
    's.m._.maria':      process.env.ADMIN_2_PASS,
    'Fane':             process.env.ADMIN_3_PASS,
    'Emi':              process.env.ADMIN_4_PASS
  };

  // Verificăm dacă user-ul trimis există în lista noastră de admini
  const expectedPassword = admins[username];

  // Dacă user-ul există și parola trimisă se potrivește perfect cu cea din .env
  if (expectedPassword && password === expectedPassword) {
    return res.status(200).json({
      success: true,
      username: username,
      // Trimitem parola înapoi ca token de sesiune (va fi păstrată doar în memoria RAM a aplicației React, nu în LocalStorage)
      sessionToken: password 
    });
  }

  // Dacă credențialele nu se potrivesc, returnăm eroare 401 (Unauthorized)
  return res.status(401).json({ 
    success: false, 
    error: 'Utilizator sau parolă incorectă!' 
  });
}