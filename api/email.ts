import type { VercelRequest, VercelResponse } from '@vercel/node';

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM || 'noreply@automatcheck.com';
    if (!apiKey) {
      console.warn('RESEND_API_KEY not set; skipping email to', to, subject);
      return { skipped: true } as const;
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html })
    });
    if (!res.ok) {
      const txt = await res.text();
      console.warn('Resend email failed', res.status, txt);
      return { error: true } as const;
    }
    return { ok: true } as const;
  } catch (e) {
    console.warn('sendEmail error', e);
    return { error: true } as const;
  }
}


