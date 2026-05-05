export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
  const { action, email, password, name } = req.body;

  try {
    // Helper to query Supabase
    async function supabase(method, path, body) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': method === 'POST' ? 'return=representation' : '',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      return r.json();
    }

    // Simple password hash (base64 for now)
    function hashPass(p) { return Buffer.from(p).toString('base64'); }

    if (action === 'signup') {
      // Check if user exists
      const existing = await supabase('GET', `users?email=eq.${encodeURIComponent(email)}&select=id`);
      if (existing.length > 0) return res.status(400).json({ error: 'Account already exists — please log in' });

      // Create user
      const newUser = await supabase('POST', 'users', {
        email,
        name: name || email.split('@')[0],
        password: hashPass(password),
        plan: 'trial',
        episodes_used: 0,
      });

      if (newUser.error) return res.status(400).json({ error: newUser.error.message });
      const user = newUser[0];
      return res.status(200).json({ 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan, episodes_used: user.episodes_used }
      });
    }

    if (action === 'login') {
      const users = await supabase('GET', `users?email=eq.${encodeURIComponent(email)}&select=*`);
      if (!users.length) return res.status(400).json({ error: 'No account found — please sign up' });
      const user = users[0];
      if (user.password !== hashPass(password)) return res.status(400).json({ error: 'Incorrect password' });
      return res.status(200).json({ 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan, episodes_used: user.episodes_used }
      });
    }

    if (action === 'track') {
      const { userId, count } = req.body;
      // Get current usage
      const users = await supabase('GET', `users?id=eq.${userId}&select=episodes_used`);
      if (!users.length) return res.status(400).json({ error: 'User not found' });
      const newCount = (users[0].episodes_used || 0) + count;
      await supabase('PATCH', `users?id=eq.${userId}`, { episodes_used: newCount });
      return res.status(200).json({ success: true, episodes_used: newCount });
    }

    if (action === 'getuser') {
      const { userId } = req.body;
      const users = await supabase('GET', `users?id=eq.${userId}&select=*`);
      if (!users.length) return res.status(400).json({ error: 'User not found' });
      const user = users[0];
      return res.status(200).json({ 
        success: true,
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan, episodes_used: user.episodes_used }
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
