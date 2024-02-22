import { MapContainer, GeoJSON, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useUnitsLayer } from "../hooks/geoJson"
import Loader from "../components/common/Loader"
import { Layer } from "leaflet"

const createPopup = (feature, layer: Layer) => {
    layer.bindPopup(
        `
        <h3>${feature.properties.unitNumber}</h3>
        <div class="leaflet-popup-body-row">
            <b><p>Location: </p></b>
            <p>${feature.properties.location ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Customer: </p></b>
            <p>${feature.properties.customer ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Operational Region: </p></b>
            <p>${feature.properties.region ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>County: </p></b>
            <p>${feature.properties.county ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>State: </p></b>
            <p>${feature.properties.state ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Engine: </p></b>
            <p>${feature.properties.engine ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Compressor Frame: </p></b>
            <p>${feature.properties.frame ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>OEM HP: </p></b>
            <p>${feature.properties.oemHP ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Status: </p></b>
            <p>${feature.properties.status ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Mechanic: </p></b>
            <p>${feature.properties.mechanic ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Manager: </p></b>
            <p>${feature.properties.manager ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Director: </p></b>
            <p>${feature.properties.director ?? ""}</p>
        </div>
        <i>${feature.properties.coordinates}</i>
        `
    )
}


export default function UnitMap() {
    const { data: unitsLayer, isFetching: unitsLayerFetching } = useUnitsLayer()

    return (
        <div className="page-container">
            {unitsLayerFetching ? <Loader /> : <MapContainer
                center={[33.527409, -97.366201]}
                zoom={6}
                style={{ width: "100%", height: "100%" }}
            >
                <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <GeoJSON data={unitsLayer} onEachFeature={createPopup} />
            </MapContainer>
            }
        </div>
    )
}