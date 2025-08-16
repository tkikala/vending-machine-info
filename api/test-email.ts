import { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmail } from './email';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, text } = req.body;
    
    if (!to || !subject || !text) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, text' 
      });
    }

    await sendEmail({
      to,
      subject,
      text,
      html: `<p>${text}</p>`
    });

    res.status(200).json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message 
    });
  }
}
