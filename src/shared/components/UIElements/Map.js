import { useRef, useEffect } from "react";

import "./Map.css";

const Map = (props) => {
    const mapRef = useRef();
    const mapInstanceRef = useRef();

    useEffect(() => {
        const leaflet = window.L;
        const center = props.center;
        const hasValidCenter =
            typeof center?.lat === "number" && typeof center?.lng === "number";

        if (!mapRef.current || !leaflet || !hasValidCenter) {
            return;
        }

        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        mapRef.current.innerHTML = "";

        mapInstanceRef.current = leaflet.map(mapRef.current, {
            center: [center.lat, center.lng],
            zoom: props.zoom,
            zoomControl: true,
        });

        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstanceRef.current);

        leaflet.marker([center.lat, center.lng]).addTo(mapInstanceRef.current);

        const resizeMap = () => {
            mapInstanceRef.current?.invalidateSize();
            mapInstanceRef.current?.setView([center.lat, center.lng], props.zoom);
        };

        const resizeTimeout = window.setTimeout(resizeMap, 250);

        mapInstanceRef.current.whenReady(() => {
            resizeMap();
        });

        return () => {
            window.clearTimeout(resizeTimeout);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [props.center, props.zoom]);

    useEffect(() => {
        if (!window.L && mapRef.current) {
            mapRef.current.innerHTML =
                '<div class="map__fallback">Leaflet failed to load.</div>';
        }
    }, []);

    return (
        <div
            ref={mapRef}
            className={`map ${props.className || ""}`.trim()}
            style={props.style}></div>
    );
};

export default Map;
