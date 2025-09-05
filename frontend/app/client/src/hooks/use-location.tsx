import { useState, useEffect } from "react";

export function useLocation() {
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              try {
                const kakaoResponse = await fetch(
                  `/api/kakao/location?lat=${latitude}&lng=${longitude}`
                );
                
                if (kakaoResponse.ok) {
                  const kakaoData = await kakaoResponse.json();
                  const address = kakaoData.documents?.[0]?.address;
                  if (address) {
                    setLocation(`${address.region_2depth_name || address.region_1depth_name || "서울"}, 대한민국`);
                    setLoading(false);
                    return;
                  }
                }
                
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ko`
                );
                
                if (response.ok) {
                  const data = await response.json();
                  setLocation(`${data.city || data.locality || "서울"}, ${data.countryName || "대한민국"}`);
                } else {
                  throw new Error("Geocoding failed");
                }
              } catch (geocodeError) {
                console.error("Geocoding error:", geocodeError);
                setLocation("서울, 대한민국");
              }
              setLoading(false);
            },
            (error) => {
              console.error('Geolocation error:', error);
              setLocation("서울, 대한민국");
              setLoading(false);
            }
          );
        } else {
          setLocation("서울, 대한민국");
          setLoading(false);
        }
      } catch (error) {
        console.error('Location error:', error);
        setLocation("서울, 대한민국");
        setLoading(false);
      }
    };

    loadLocation();
  }, []);

  return { location, loading };
}
