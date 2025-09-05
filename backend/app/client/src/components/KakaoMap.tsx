import { useEffect, useMemo, useRef, useState } from "react";

declare global {
  interface Window { kakao?: any; }
}

type Lang = "ko" | "en";

type KakaoMapProps = {
  language?: Lang;
  lat?: number;
  lng?: number;
  level?: number;
  draggable?: boolean;
  scrollwheel?: boolean;
  onAddressChange?: (address: string) => void;

  showZoomControl?: boolean;      
  showMapTypeControl?: boolean;   
  enableGeolocate?: boolean;

  enableSearch?: boolean;
  searchPlaceholder?: string;
  myLocationIconUrl?: string;
};

const BLUE_PIN_SVG = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='40' viewBox='0 0 28 40'><defs><filter id='s' x='-50%' y='-50%' width='200%' height='200%'><feDropShadow dx='0' dy='2' stdDeviation='2' flood-opacity='0.3'/></filter></defs><path d='M14 0C6.82 0 1 5.82 1 13c0 9.5 11 26 13 26s13-16.5 13-26C27 5.82 21.18 0 14 0z' fill='%233B82F6' filter='url(%23s)'/><circle cx='14' cy='13' r='5.5' fill='white'/><path d='M14 9l3 4h-6z' fill='%233B82F6'/></svg>`.replace(/\n/g, "");
const MY_DOT_SVG  = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'><circle cx='9' cy='9' r='7' fill='white'/><circle cx='9' cy='9' r='5' fill='%231D4ED8'/></svg>`.replace(/\n/g, "");

const haversine = (a:{lat:number;lng:number}, b:{lat:number;lng:number}) => {
  const R = 6371000;
  const dLat = (b.lat-a.lat)*Math.PI/180;
  const dLng = (b.lng-a.lng)*Math.PI/180;
  const s1 = Math.sin(dLat/2), s2 = Math.sin(dLng/2);
  const aa = s1*s1 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*s2*s2;
  return 2*R*Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
};

const TEXT = {
  ko: {
    search: "검색",
    searchPlaceholder: "검색",
    basis_me: "내 위치 기준 검색",
    basis_map: "지도 중심 기준 검색",
    dist_me: "거리: 내 위치",
    dist_map: "거리: 지도 중심",
    radius: (km:number)=>`반경 ${km}km`,
    sort_acc: "정확도순",
    sort_dist:"거리순",
    noResult: "검색 결과가 없습니다.",
    results: (n:number)=>`결과 ${n}개`,
    page: (c:number,l:number)=>`페이지 ${c} / ${l}`,
    prev: "이전", next: "다음", close: "닫기",
    goHere: "여기로 이동", viewDetail: "상세보기",
    distance: "거리",
    loadingMap: "지도를 불러오는 중…",
    myLocBtn: "내 위치",
    myLocToastFail: "현재 위치를 가져올 수 없습니다. 브라우저 권한을 확인해주세요.",
    tooltipMyLoc: "내 위치로 이동",
    map: "지도", sky: "스카이뷰",
    zoomIn: "확대", zoomOut: "축소",
  },
  en: {
    search: "Search",
    searchPlaceholder: "Search places",
    basis_me: "Search from My Location",
    basis_map: "Search from Map Center",
    dist_me: "Distance: My location",
    dist_map: "Distance: Map center",
    radius: (km:number)=>`Radius ${km} km`,
    sort_acc: "Accuracy",
    sort_dist:"Distance",
    noResult: "No results found.",
    results: (n:number)=>`Results ${n}`,
    page: (c:number,l:number)=>`Page ${c} / ${l}`,
    prev: "Prev", next: "Next", close: "Close",
    goHere: "Go here", viewDetail: "Details",
    distance: "Distance",
    loadingMap: "Loading map…",
    myLocBtn: "My location",
    myLocToastFail: "Unable to get your current location. Please check browser permission.",
    tooltipMyLoc: "Go to my location",
    map: "Map", sky: "Skyview",
    zoomIn: "Zoom in", zoomOut: "Zoom out",
  }
} as const;

export default function KakaoMap({
  language = "ko",
  lat = 37.5665,
  lng = 126.978,
  level = 3,
  draggable = true,
  scrollwheel = true,
  onAddressChange,

  showZoomControl = true,
  showMapTypeControl = true,
  enableGeolocate = true,

  enableSearch = true,
  searchPlaceholder,
  myLocationIconUrl,
}: KakaoMapProps) {
  const L = TEXT[language];

  const mapRef        = useRef<HTMLDivElement>(null);
  const mapObjRef     = useRef<any>(null);

  const markerRef         = useRef<any>(null);
  const myMarkerRef       = useRef<any>(null);
  const resultsMarkersRef = useRef<any[]>([]);
  const overlayRef        = useRef<any>(null);
  const clustererRef      = useRef<any>(null);
  const pinImageRef       = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  const [query, setQuery] = useState("");
  const [useMyLocationBias, setUseMyLocationBias] = useState(true);
  const [distanceAnchor, setDistanceAnchor] = useState<"me"|"map">("me");
  const [radiusKm, setRadiusKm] = useState(5);
  const [order, setOrder] = useState<"accuracy"|"distance">("accuracy");
  const [showPanel, setShowPanel] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [pageInfo, setPageInfo] = useState({ current:1, last:1 });
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [isZooming, setIsZooming] = useState(false);
  const zoomTimer = useRef<number|null>(null);

  const [isDark, setIsDark] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const obs = new MutationObserver(()=>setIsDark(
      document.documentElement.classList.contains("dark")
    ));
    obs.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
    return ()=>obs.disconnect();
  },[]);

  useEffect(() => {
    const appkey = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined;
    if (!appkey) { console.error("[KakaoMap] VITE_KAKAO_JS_KEY is missing"); setSdkLoaded(false); return; }
    if (window.kakao?.maps) { setSdkLoaded(true); return; }
    const existed = document.querySelector<HTMLScriptElement>("script[data-kakao-sdk='true']");
    if (existed) return;
    const script = document.createElement("script");
    script.setAttribute("data-kakao-sdk","true");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services,clusterer`;
    script.async = true;
    script.onload  = () => window.kakao.maps.load(()=>setSdkLoaded(true));
    script.onerror = () => setSdkLoaded(false);
    document.head.appendChild(script);
  },[]);

  const [mapType, setMapType] = useState<"ROADMAP"|"SKYVIEW">("ROADMAP");


  const findNearestPlace = (ll: any): Promise<any | null> => {
    return new Promise((resolve) => {
      const kakao = window.kakao;
      const places = new kakao.maps.services.Places(mapObjRef.current);

      const CODES = ["FD6","CE7","HP8","PM9","AD5","MT1","CS2","BK9","CT1","PO3","AT4","SW8","PK6"];
      const opts: any = {
        location: ll,
        radius: 800, 
        sort: kakao.maps.services.SortBy.DISTANCE,
        size: 15,
      };

      let pending = CODES.length;
      const bucket: any[] = [];

      const done = () => {
        if (--pending > 0) return;
        if (bucket.length === 0) return resolve(null);

        const anchor = { lat: ll.getLat(), lng: ll.getLng() };
        bucket.sort((a, b) => {
          const da = haversine(anchor, { lat: Number(a.y), lng: Number(a.x) });
          const db = haversine(anchor, { lat: Number(b.y), lng: Number(b.x) });
          return da - db;
        });
        resolve(bucket[0] ?? null);
      };

      CODES.forEach((code) => {
        places.categorySearch(
          code,
          (data: any[], status: string) => {
            if (status === kakao.maps.services.Status.OK && Array.isArray(data)) {
              bucket.push(...data);
            }
            done();
          },
          opts
        );
      });
    });
  };

  const openAddressOverlay = (address: string, ll: any) => {
    const kakao = window.kakao;
    if (overlayRef.current) { overlayRef.current.setMap(null); overlayRef.current = null; }

    const bg = isDark ? "rgba(15,23,42,0.96)" : "rgba(255,255,255,0.98)";
    const fg = isDark ? "#e2e8f0" : "#0f172a";
    const bd = isDark ? "#334155" : "#e2e8f0";

    const html = `
      <div style="min-width:240px;max-width:320px;padding:10px;border-radius:12px;background:${bg};
                  color:${fg};border:1px solid ${bd};box-shadow:0 10px 30px rgba(0,0,0,0.2)">
        <div style="font-weight:700;font-size:14px;margin-bottom:6px">${address || "No nearby place"}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button id="km-close" style="padding:6px 10px;border-radius:8px;background:transparent;
                  border:1px solid ${bd};color:${fg};font-size:12px;cursor:pointer">${TEXT[language].close}</button>
        </div>
      </div>
    `;
    const overlay = new kakao.maps.CustomOverlay({
      position: ll, content: html, xAnchor: 0.5, yAnchor: 1.1, zIndex: 9999,
    });
    overlay.setMap(mapObjRef.current);
    overlayRef.current = overlay;

    setTimeout(() => {
      const el = overlay.getContent() as HTMLElement;
      el.querySelector<HTMLButtonElement>("#km-close")
        ?.addEventListener("click", () => { overlay.setMap(null); overlayRef.current = null; });
    }, 0);
  };

  useEffect(() => {
    if (!sdkLoaded || !mapRef.current) return;

    const kakao = window.kakao;
    const center = new kakao.maps.LatLng(lat, lng);
    const map = new kakao.maps.Map(mapRef.current, { center, level, draggable, scrollwheel });
    map.setKeyboardShortcuts(false);
    mapObjRef.current = map;

    const onStart = () => {
      setIsZooming(true);
      if (overlayRef.current) { overlayRef.current.setMap(null); overlayRef.current = null; }
      if (zoomTimer.current) cancelAnimationFrame(zoomTimer.current);
    };
    const onEnd = () => {
      if (zoomTimer.current) cancelAnimationFrame(zoomTimer.current);
      zoomTimer.current = requestAnimationFrame(()=>setIsZooming(false));
    };
    kakao.maps.event.addListener(map, "zoom_start", onStart);
    kakao.maps.event.addListener(map, "zoom_changed", onEnd);
    kakao.maps.event.addListener(map, "dragstart", onStart);
    kakao.maps.event.addListener(map, "dragend", onEnd);

    if (!markerRef.current) markerRef.current = new kakao.maps.Marker({ position:center });
    else markerRef.current.setPosition(center);
    markerRef.current.setMap(map);

    clustererRef.current = new kakao.maps.MarkerClusterer({
      map, averageCenter:true, minLevel:6, disableClickZoom:false,
    });

    if (!pinImageRef.current) {
      pinImageRef.current = new kakao.maps.MarkerImage(
        BLUE_PIN_SVG, new kakao.maps.Size(28,40), { offset: new kakao.maps.Point(14,40) }
      );
    }

    if (language === "ko") {
      if (showZoomControl)     map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
      if (showMapTypeControl)  map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
    }

    kakao.maps.event.addListener(map, "click", async (e: any) => {
      const ll = e.latLng;

      markerRef.current?.setPosition(ll);
      map.panTo(ll);

      if (onAddressChange) {
        try {
          const r = await fetch(`/api/kakao/location?lat=${ll.getLat()}&lng=${ll.getLng()}`);
          const d = await r.json();
          const addr =
            d?.documents?.[0]?.road_address?.address_name ??
            d?.documents?.[0]?.address?.address_name ?? "";
          if (addr) onAddressChange(addr);
        } catch {}
      }

      if (overlayRef.current) { overlayRef.current.setMap(null); overlayRef.current = null; }

      const nearest = await findNearestPlace(ll);
      if (nearest) {
        enterDetail(nearest);
        return;
      }

      try {
        const r = await fetch(`/api/kakao/location?lat=${ll.getLat()}&lng=${ll.getLng()}`);
        const d = await r.json();
        const addr =
          d?.documents?.[0]?.road_address?.address_name ??
          d?.documents?.[0]?.address?.address_name ?? "";
        openAddressOverlay(addr, ll);
      } catch {
        openAddressOverlay("", ll);
      }
    });

    setLoading(false);
  }, [sdkLoaded, lat, lng, level, draggable, scrollwheel, onAddressChange, showZoomControl, showMapTypeControl, language]);

  const setType = (t:"ROADMAP"|"SKYVIEW") => {
    const kakao = window.kakao;
    setMapType(t);
    if (!mapObjRef.current) return;
    mapObjRef.current.setMapTypeId(t === "ROADMAP" ? kakao.maps.MapTypeId.ROADMAP : kakao.maps.MapTypeId.HYBRID);
  };
  const zoomIn  = () => mapObjRef.current?.setLevel(Math.max(1, mapObjRef.current.getLevel()-1));
  const zoomOut = () => mapObjRef.current?.setLevel(mapObjRef.current.getLevel()+1);

  const goMyLocation = () => {
    if (!enableGeolocate || !mapObjRef.current) return;
    if (!("geolocation" in navigator)) return alert(L.myLocToastFail);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const kakao = window.kakao;
        const ll = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        const imgUrl = myLocationIconUrl || MY_DOT_SVG;
        const img = new kakao.maps.MarkerImage(imgUrl, new kakao.maps.Size(18,18), { offset: new kakao.maps.Point(9,9) });
        if (!myMarkerRef.current) myMarkerRef.current = new kakao.maps.Marker({ position: ll, image: img });
        else { myMarkerRef.current.setImage(img); myMarkerRef.current.setPosition(ll); }
        myMarkerRef.current.setMap(mapObjRef.current);
        mapObjRef.current.panTo(ll);
      },
      () => alert(L.myLocToastFail),
      { enableHighAccuracy:true, timeout:10000 }
    );
  };

  const clearResultsMarkers = () => {
    if (clustererRef.current) clustererRef.current.clear();
    resultsMarkersRef.current.forEach((m)=>m.setMap && m.setMap(null));
    resultsMarkersRef.current = [];
    if (overlayRef.current) { overlayRef.current.setMap(null); overlayRef.current=null; }
  };

  const openOverlay = (place:any) => {
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(Number(place.y), Number(place.x));
    if (overlayRef.current) { overlayRef.current.setMap(null); overlayRef.current=null; }

    const bg = isDark ? "rgba(15,23,42,0.96)" : "rgba(255,255,255,0.98)";
    const text = isDark ? "#0ea5e9" : "#2563eb";
    const fg = isDark ? "#e2e8f0" : "#0f172a";
    const sub = isDark ? "#94a3b8" : "#475569";
    const bd = isDark ? "#334155" : "#e2e8f0";

    const html = `
      <div style="min-width:260px;max-width:320px;padding:10px;border-radius:12px;background:${bg};color:${fg};border:1px solid ${bd};
                  box-shadow:0 10px 30px rgba(0,0,0,0.2);font-family:system-ui,-apple-system,Segoe UI,Roboto,'Noto Sans KR',sans-serif">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <div style="font-weight:700;font-size:15px;line-height:1.2">${place.place_name}</div>
          <button id="km-close" style="background:transparent;border:1px solid ${bd};color:${sub};border-radius:8px;padding:4px 8px;cursor:pointer;font-size:12px">${L.close}</button>
        </div>
        <div style="margin-top:6px;font-size:12px;color:${sub}">${place.road_address_name || place.address_name || ""}</div>
        ${place.phone ? `<div style="margin-top:6px;font-size:12px;color:${sub}">☎ ${place.phone}</div>` : ""}
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <a href="${place.place_url}" target="_blank" rel="noopener noreferrer"
             style="padding:6px 10px;border-radius:8px;background:${text};color:white;text-decoration:none;font-size:12px">${L.viewDetail}</a>
          <button id="km-go" style="padding:6px 10px;border-radius:8px;background:#0ea5e9;color:white;border:none;font-size:12px;cursor:pointer">${L.goHere}</button>
        </div>
      </div>
    `;
    const overlay = new kakao.maps.CustomOverlay({ position:pos, content:html, xAnchor:0.5, yAnchor:1.1, zIndex:9999 });
    overlay.setMap(mapObjRef.current);
    overlayRef.current = overlay;

    setTimeout(() => {
      const container = overlay.getContent() as HTMLElement;
      container.querySelector<HTMLButtonElement>("#km-close")?.addEventListener("click", ()=>{
        overlay.setMap(null); overlayRef.current=null;
      });
      container.querySelector<HTMLButtonElement>("#km-go")?.addEventListener("click", ()=>{
        mapObjRef.current.panTo(pos);
      });
    },0);
  };

  const enterDetail = (place:any) => {
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(Number(place.y), Number(place.x));
    setShowPanel(false); setShowHistory(false);
    mapObjRef.current.setLevel(3);
    setTimeout(()=>{ mapObjRef.current.panTo(pos); setTimeout(()=>openOverlay(place),120); },0);
    window.history.pushState({view:"detail"},"","");
  };

  const handleSearch = (page?:number) => {
    if (!enableSearch || !mapObjRef.current) return;
    const kakao = window.kakao;
    const places = new kakao.maps.services.Places(mapObjRef.current);
    const opts:any = { size: 15 };
    if (order === "distance") opts.sort = kakao.maps.services.SortBy.DISTANCE;

    let biasCenter = mapObjRef.current.getCenter();
    if (useMyLocationBias && myMarkerRef.current) biasCenter = myMarkerRef.current.getPosition();
    opts.location = biasCenter;
    opts.radius   = radiusKm * 2000;

    const targetPage = page ?? 1;

    places.keywordSearch(
      query.trim(),
      (data:any[], status:string, pagination:any) => {
        if (status !== kakao.maps.services.Status.OK) {
          setResults([]); setPageInfo({current:1, last:1});
          clearResultsMarkers(); alert(L.noResult); return;
        }
        setRecentQueries((prev)=>[query.trim(), ...prev.filter(q=>q!==query.trim())].slice(0,10));
        setResults(data);
        setPageInfo({current: pagination.current, last: pagination.last});

        clearResultsMarkers();
        const bounds = new kakao.maps.LatLngBounds();
        const newMarkers:any[] = [];
        data.forEach((place)=>{
          const pos = new kakao.maps.LatLng(Number(place.y), Number(place.x));
          const marker = new kakao.maps.Marker({ position: pos, image: pinImageRef.current });
          kakao.maps.event.addListener(marker,"click",()=>enterDetail(place));
          newMarkers.push(marker);
          resultsMarkersRef.current.push(marker);
          bounds.extend(pos);
        });
        clustererRef.current.addMarkers(newMarkers);
        if (!bounds.isEmpty()) mapObjRef.current.setBounds(bounds);

        setShowPanel(true); setShowHistory(false);
      },
      opts
    );
    if (targetPage > 1) places.gotoPage(targetPage);
  };

  const onResultClick = (place:any) => enterDetail(place);

  const radiusOptions = useMemo(()=>[1,2,3,5,10,15,20],[]);
  type OrderOpt = { key: "accuracy" | "distance"; label: string };
  const orderOptions = useMemo<OrderOpt[]>(() => [
    { key: "accuracy", label: TEXT[language].sort_acc },
    { key: "distance", label: TEXT[language].sort_dist },
  ], [language]);

  const cardCls  = "rounded-xl shadow-xl backdrop-blur-xl border";
  const cardTone = "bg-white/80 border-slate-200 text-slate-800 dark:bg-slate-900/70 dark:border-slate-700/60 dark:text-slate-100";

  return (
    <div className="w-full relative">
      <style>{`.wrap_mapTypeControl{right:16px!important;top:16px!important}.wrap_zoomControl{right:16px!important}`}</style>

      <div
        ref={mapRef}
        className="w-full h-[520px] md:h-[560px] rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 will-change-transform"
        role="region" aria-label="Kakao Map"
        aria-live="polite" aria-busy={loading ? "true" : "false"}
      />

      {language === "en" && (
        <>
          <div className="absolute top-3 right-3 z-20">
            <div className={`${cardCls} ${cardTone} p-1 flex rounded-lg`}>
              <button
                onClick={()=>setType("ROADMAP")}
                className={`px-3 py-1.5 text-sm rounded-md ${mapType==="ROADMAP" ? "bg-blue-600 text-white" : ""}`}
                title={L.map}
              >
                {L.map}
              </button>
              <button
                onClick={()=>setType("SKYVIEW")}
                className={`ml-1 px-3 py-1.5 text-sm rounded-md ${mapType==="SKYVIEW" ? "bg-blue-600 text-white" : ""}`}
                title={L.sky}
              >
                {L.sky}
              </button>
            </div>
          </div>

          <div className="absolute top-20 right-3 z-20">
            <div className={`${cardCls} ${cardTone} flex flex-col rounded-lg overflow-hidden`}>
              <button onClick={zoomIn}  className="px-3 py-2 text-lg hover:bg-slate-100 dark:hover:bg-slate-800" title={L.zoomIn}>+</button>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <button onClick={zoomOut} className="px-3 py-2 text-lg hover:bg-slate-100 dark:hover:bg-slate-800" title={L.zoomOut}>−</button>
            </div>
          </div>
        </>
      )}

      {enableGeolocate && (
        <button
          type="button" onClick={goMyLocation}
          className="absolute bottom-4 right-4 z-20 rounded-full bg-white/95 text-slate-700 border border-slate-300
                     px-4 py-2 text-sm font-medium shadow-lg hover:bg-white 
                     dark:bg-slate-800/90 dark:text-slate-100 dark:border-slate-600
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          title={L.tooltipMyLoc}
        >
          📍 {L.myLocBtn}
        </button>
      )}

      {enableSearch && (
        <div className="absolute top-3 left-4 z-20 w-[92%] sm:w-[86%] max-w-4xl">
          <div className={`${cardCls} ${cardTone} p-3 rounded-xl`}>
            <div className="flex flex-wrap gap-3 items-stretch relative">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  value={query}
                  onChange={(e)=>setQuery(e.target.value)}
                  onKeyDown={(e)=>e.key==="Enter" && handleSearch(1)}
                  onFocus={()=>setShowHistory(true)}
                  onBlur={()=>setTimeout(()=>setShowHistory(false),150)}
                  placeholder={searchPlaceholder ?? L.searchPlaceholder}
                  className="w-full h-10 rounded-lg border px-3 pr-24 text-[13px]
                             bg-white/70 border-slate-300 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             dark:bg-slate-800/70 dark:border-slate-600 dark:placeholder:text-slate-400"
                />
                <button
                  onClick={()=>handleSearch(1)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 px-3 rounded-md
                             bg-blue-600 text-white text-[13px] shadow hover:bg-blue-700"
                >
                  {L.search}
                </button>

                {showHistory && recentQueries.length>0 && (
                  <div className={`absolute left-0 right-0 mt-1 max-h-60 overflow-auto z-30 ${cardCls} ${cardTone}`}>
                    <ul className="py-1 text-[13px]">
                      {recentQueries.map((q)=>(
                        <li key={q}
                          className="px-3 py-1.5 flex items-center justify-between gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          onMouseDown={(e)=>e.preventDefault()}>
                          <button className="flex-1 text-left truncate"
                                  onClick={()=>{ setQuery(q); setShowHistory(false); handleSearch(1); }}>
                            {q}
                          </button>
                          <button
                            aria-label={`remove ${q}`}
                            className="shrink-0 inline-flex items-center justify-center rounded-md
                                       w-6 h-6 text-slate-500 hover:text-slate-700 hover:bg-slate-200
                                       dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/70"
                            onMouseDown={(e)=>e.preventDefault()}
                            onClick={()=> setRecentQueries(prev=>prev.filter(item=>item!==q))}
                          >✕</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <select
                value={useMyLocationBias ? "me" : "map"}
                onChange={(e)=>setUseMyLocationBias(e.target.value==="me")}
                className="h-10 rounded-lg border px-3 text-[13px]
                           bg-white/70 border-slate-300 text-slate-800
                           dark:bg-slate-800/70 dark:border-slate-600 dark:text-slate-100"
              >
                <option value="me">{L.basis_me}</option>
                <option value="map">{L.basis_map}</option>
              </select>

              <select
                value={distanceAnchor}
                onChange={(e)=>setDistanceAnchor(e.target.value as any)}
                className="h-10 rounded-lg border px-3 text-[13px]
                           bg-white/70 border-slate-300 text-slate-800
                           dark:bg-slate-800/70 dark:border-slate-600 dark:text-slate-100"
              >
                <option value="me">{L.dist_me}</option>
                <option value="map">{L.dist_map}</option>
              </select>

              <select
                value={radiusKm}
                onChange={(e)=>setRadiusKm(Number(e.target.value))}
                className="h-10 rounded-lg border px-3 text-[13px]
                           bg-white/70 border-slate-300 text-slate-800
                           dark:bg-slate-800/70 dark:border-slate-600 dark:text-slate-100"
              >
                {radiusOptions.map((km)=>(<option key={km} value={km}>{L.radius(km)}</option>))}
              </select>

              <select
                value={order}
                onChange={(e)=>setOrder(e.target.value as any)}
                className="h-10 rounded-lg border px-3 text-[13px]
                           bg-white/70 border-slate-300 text-slate-800
                           dark:bg-slate-800/70 dark:border-slate-600 dark:text-slate-100"
              >
                {orderOptions.map((o)=>(<option key={o.key} value={o.key}>{o.label}</option>))}
              </select>
            </div>
          </div>
        </div>
      )}

      {enableSearch && showPanel && results.length>0 && !isZooming && (
        <div className="absolute left-3 right-3 bottom-3 md:left-5 md:right-5 z-20">
          <div className={`${cardCls} ${cardTone} overflow-hidden`}>
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-700">
              <div className="text-[12px]">
                {L.results(results.length)} • {L.page(pageInfo.current, pageInfo.last)}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={pageInfo.current<=1}
                  onClick={()=>handleSearch(pageInfo.current-1)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 text-[12px] disabled:opacity-40
                             dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                >
                  {L.prev}
                </button>
                <button
                  disabled={pageInfo.current>=pageInfo.last}
                  onClick={()=>handleSearch(pageInfo.current+1)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 text-[12px] disabled:opacity-40
                             dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                >
                  {L.next}
                </button>
                <button
                  onClick={()=>setShowPanel(false)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 text-[12px]
                             dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                >
                  {L.close}
                </button>
              </div>
            </div>

            <ul className="max-h-[45vh] overflow-auto divide-y divide-slate-200 dark:divide-slate-800">
              {results.map((p,i)=>{
                const anchor = (distanceAnchor==="me" && myMarkerRef.current)
                  ? { lat: myMarkerRef.current.getPosition().getLat(), lng: myMarkerRef.current.getPosition().getLng() }
                  : { lat: mapObjRef.current.getCenter().getLat(),        lng: mapObjRef.current.getCenter().getLng() };
                const distM = haversine(anchor, { lat:Number(p.y), lng:Number(p.x) });
                const dist  = distM>=1000 ? `${(distM/1000).toFixed(2)} km` : `${Math.round(distM)} m`;

                return (
                  <li key={`${p.id}-${i}`} onClick={()=>onResultClick(p)}
                      className="cursor-pointer px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60">
                    <div className="font-semibold text-sm">{p.place_name}</div>
                    <div className="text-[12px] mt-0.5">{p.road_address_name || p.address_name}</div>
                    <div className="flex gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{L.distance} {dist}</span>
                      {p.category_name && <span>{p.category_name}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {loading && (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400" role="status" aria-live="polite">
          {L.loadingMap}
        </p>
      )}
    </div>
  );
}
