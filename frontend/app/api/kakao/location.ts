import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { lat, lng } = req.query;
    const kakaoApiKey = process.env.KAKAO_API_KEY || "efe45bd0fb232c98afd3a547dc360d84";
    
    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }
    
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      {
        headers: {
          'Authorization': `KakaoAK ${kakaoApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Kakao API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Kakao API error:', error);
    res.status(500).json({ 
      message: "Failed to get location information",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}