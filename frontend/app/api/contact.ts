import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(1, "Message is required")
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const validatedData = contactSchema.parse(req.body);
    
  
    console.log('Contact form submission:', validatedData);
    
    res.json({ 
      message: "Contact form submitted successfully", 
      contact: { id: Date.now().toString() } 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    } else {
      res.status(500).json({ 
        message: "Failed to submit contact form",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}