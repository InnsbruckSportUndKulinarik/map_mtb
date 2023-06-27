// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte initialisieren
let map = L.map("map", {
    fullscreenControl: true
}).setView([ibk.lat, ibk.lng], 12);

// thematische Layer
let themaLayer = {
    routen: L.featureGroup(),
    stops_bus: L.markerClusterGroup({ maxZoom: 22 }),
    stops_tram: L.markerClusterGroup({ maxZoom: 22 }),
    huetten: L.featureGroup()
}

// WMTS und Leaflet TileLayerProvider Hintergrundlayer und thematische Layer 
let layercontrol = L.control.layers({
    "Esri WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap").addTo(map),
    "Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "Geländeschummerung": L.tileLayer.provider("BasemapAT.surface")
}, {
    "ÖPNV-Bus": themaLayer.stops_bus.addTo(map),
    "ÖPNV-Tram": themaLayer.stops_tram.addTo(map),
    "Hütten": themaLayer.huetten.addTo(map)
}).addTo(map)

layercontrol.expand()

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Mini Map 
let miniMap = new L.Control.MiniMap(L.tileLayer.provider("OpenStreetMap.DE"), { toggleDisplay: true, minimized: true }).addTo(map);

//Lokalisierungsservice
map.locate({ watch: true, maxZoom: 18 });
//Funktionen für Events Lokalisierung gefunden oder Error message
map.on('locationerror', function onLocationError(evt) {
    alert(evt.message);
});

let circle = L.circle([0, 0]).addTo(map);
let marker = L.marker([0, 0]).addTo(map);

map.on('locationfound', function onLocationFound(evt) {
    console.log(evt)
    let radius = Math.round(evt.accuracy)
    marker.setLatLng(evt.latlng)
    marker.bindTooltip(`Sie befinden sich in einem Umkreis von ca. ${radius} Meter von diesem Punkt. `).openTooltip();
    circle.setLatLng(evt.latlng);
    circle.setRadius(radius)
});

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
            layer.bindPopup(`
            <h1>${prop.name}, ${prop.ele || ""} m ü.A. </h1><ul>
                <li>Öffnungszeiten: ${prop.opening_ho || "-"}</li>
                <li>Website: ${prop.contact_we || "-"}</li>
                <li>Telefon: ${prop.phone || "-"}</li>
                <li>Email: ${prop.email || "-"}</li>
            </ul>
        `);
        }
    }).addTo(themaLayer.huetten);
}
//Funktion ausführen, indem JSON gefetched wird (Hütten)
fetch("data/huetten_tirol_reduced.geojson")
    .then(response => response.json())
    .then(jsondata => {
        writeHuettenLayer(jsondata);
    })
    .catch(error => {
        console.error("Error fetching GeoJSON data:", error);
    });


//Haltestellen (Bus)
function writeBusLayer(jsondata) {
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/busstop_1.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h1>${prop.name}
        `);
        }
    }).addTo(themaLayer.stops_bus);
}
//Funktion ausführen, indem JSON gefetched wird (Bus)
fetch("data/bus_stop_reduced.geojson")
    .then(response => response.json())
    .then(jsondata => {
        writeBusLayer(jsondata);
    })
    .catch(error => {
        console.error("Error fetching GeoJSON data:", error);
    });

// Haltestellen (Tram)
function writeTramLayer(jsondata) {
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/tramstop_1.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties;
            layer.bindPopup(`
            <h1>${prop.name}
        `);
        }
    }).addTo(themaLayer.stops_tram);
}
//Funktion ausführen, indem JSON gefetched wird (Tram)
fetch("data/tram_stop_reduced.geojson")
    .then(response => response.json())
    .then(jsondata => {
        writeTramLayer(jsondata);
    })
    .catch(error => {
        console.error("Error fetching GeoJSON data:", error);
    });

//Elevation Plugin
let controlElevation = L.control.elevation({
    time: false,
    elevationDiv: "#profile",
}).addTo(map);

//GPX tracks 
const gpxfiles = [
    'data/GPX_bike/aldranser-alm-554.gpx',
    'data/GPX_bike/gasthof-rauschbrunnen.gpx',
    'data/GPX_bike/hoettinger-alm-505.gpx',
    'data/GPX_bike/kreither-almweg-511.gpx',
    'data/GPX_bike/lanser-alm-5004.gpx',
    'data/GPX_bike/mutterer-drei-almen-runde.gpx',
    'data/GPX_bike/nordkette-almenrunde.gpx',
    'data/GPX_bike/patscherkofel-gipfel-501.gpx',
    'data/GPX_bike/raitiser-almweg-512.gpx',
    'data/GPX_bike/rinner-alm-518.gpx',
    'data/GPX_bike/rumer-alm-513.gpx',
    'data/GPX_bike/seegrube-nordkette-506.gpx',
    'data/GPX_bike/sistranser-alm-515.gpx',
    'data/GPX_bike/vom-rauschbrunnen-zur-hoettinger-alm.gpx'
];

//Farben für Tracks
let colors = [
    'red',
    'blue',
    'green',
    'orange',
    'purple',
    'yellow',
    'pink',
    'black',
    'darkgreen',
    'lightblue',
    'darkred',
    'brown',
    'darkblue',
    'red'
];

//Tracks in der Karte anzeigen, Marker beim Startpunkt und bei Wegpunkten hinzufügen, Höhenprofil bei Klicken anzeigen, Namen und weitere Informationen in Popup beim Klicken anzeigen 
gpxfiles.forEach((gpxFile, index) => {
    new L.GPX(gpxFile, {
        async: true,
        polyline_options: {
            color: colors[index % colors.length],
        },
        marker_options: {
            startIconUrl: 'icons/start.png', // change start marker
            endIconUrl: '', // Remove end marker
            shadowUrl: '',// Remove shadow marker
            wptIconUrls: {
                '': 'icons/location.png'
            }, // add marker for way points
        }
    }).on('click', function (event) {
        controlElevation.load(gpxFile);
        controlElevation.clear();
    }).addTo(map).on('click', function (e) {
        const gpxLayer = e.target;
        let name = gpxLayer.get_name();
        let gpx_path = gpxFile;
        let website = 'https://www.innsbruck.info/radsport/mountainbike/mountainbike-touren/touren/' + gpx_path.replace(/^.*\/|\.gpx$/g, "") + '.html';
        let firstLayer = gpxLayer.getLayers()[0];
        firstLayer.bindPopup(`<b>${name}</b><br> <a href=${website} target="_blank">Weitere Informationen</a>`
        ).openPopup()
    });
});

