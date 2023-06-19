// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 9);

// thematische Layer
let themaLayer = {
    routen: L.featureGroup(),
    stops: L.featureGroup(),
    huetten: L.featureGroup()
}

// WMTS und Leaflet TileLayerProvider Hintergrundlayer
let layercontrol = L.control.layers({"Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap") }, {
    "Mountainbikerouten": themaLayer.routen,
    "ÖPNV-Haltestellen": themaLayer.stops,
    "Hütten": themaLayer.huetten
}).addTo(map)

layerControl.expand()

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Rainviewer Plugin
L.control.rainviewer({ 
    position: 'bottomleft',
    nextButtonText: '>',
    playStopButtonText: 'Play/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Hour:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 500,
    opacity: 0.5
}).addTo(map);

// Hütten 
function writeHuettenLayer(jsondata) {
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/restaurant.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            let mas = feature.geometry.coordinates[2]
            let date_time = new Date(prop.date);
            let WG;
            if (prop.WG) {
                WG = (prop.WG).toFixed(1);
            } else {
                WG = "-";
            }
            //let WG = (prop.WG)?(prop.WG*3.6).toFixed(1):"-";
            layer.bindPopup(`
            <h1>${prop.name}, ${mas} m ü.A. </h1><ul>
                <li>Lufttemperatur (Grad °): ${prop.LT || "-"} </li>
                <li>relative Luftfeuchte (%): ${prop.RH || "-"} </li>
                <li>Windgeschwindigkeit (km/h): ${WG}</li>
                <li>Schneehöhe (cm): ${prop.HS || "-"}</li>
            </ul></>
            <span>${date_time.toLocaleString()}</span>
        `);
        }
    }).addTo(themaLayer.stations)
}