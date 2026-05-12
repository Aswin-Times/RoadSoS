export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Description required' });
  }

  const TRIAGE_PROMPT = `You are a trauma triage assistant. The user is at a road accident scene.
Respond ONLY in JSON. Classify urgency P1/P2/P3. Return immediate_actions
as an array of ≤4 steps. Never ask clarifying questions. Act on what you know.
P1 = life-threatening, P2 = serious but stable, P3 = minor.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: TRIAGE_PROMPT,
        messages: [{ role: 'user', content: description }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(JSON.parse(data.content?.[0]?.text || '{}'));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'AI unavailable' });
  }
}
