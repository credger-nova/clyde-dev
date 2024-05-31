import * as React from "react"

import { MapContainer, GeoJSON, TileLayer, LayersControl } from "react-leaflet"
import { LatLngExpression, Layer, Map, circleMarker } from "leaflet"
import Control from "react-leaflet-custom-control"
import "leaflet/dist/leaflet.css"
import { GeoJSONLayer } from "../../types/geoJson"
import MapSearch from "./MapSearch"
import { UIContext } from "../../context/UIContext"

interface Props {
    unitsLayer: GeoJSONLayer | undefined
    centroid: Array<number>
    managers: Array<string> | undefined
}

const COLORS = ["#ffe119", "#e6194B", "#800000", "#000000", "#f032e6", "#42d4f4", "#3cb44b", "#fabed4", "#911eb4", "#f58231"]

const createPopup = (feature: GeoJSON.Feature, layer: Layer) => {
    layer.bindPopup(
        `
        <h3>${feature.properties?.unitNumber}</h3>
        <div class="leaflet-popup-body-row">
            <b><p>Location: </p></b>
            <p>${feature.properties?.location ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Customer: </p></b>
            <p>${feature.properties?.customer ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Operational Region: </p></b>
            <p>${feature.properties?.region ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>County: </p></b>
            <p>${feature.properties?.county ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>State: </p></b>
            <p>${feature.properties?.state ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Engine: </p></b>
            <p>${feature.properties?.engine ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Compressor Frame: </p></b>
            <p>${feature.properties?.frame ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>OEM HP: </p></b>
            <p>${feature.properties?.oemHP ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Status: </p></b>
            <p>${feature.properties?.status ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Mechanic: </p></b>
            <p>${feature.properties?.mechanic ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Manager: </p></b>
            <p>${feature.properties?.manager ?? ""}</p>
        </div>
        <div class="leaflet-popup-body-row">
            <b><p>Director: </p></b>
            <p>${feature.properties?.director ?? ""}</p>
        </div>
        <i>${feature.properties?.coordinates}</i>
        `
    )
}

const getColor = (index: number) => {
    return COLORS[index]
}

const createStyle = (index: number) => {
    return {
        color: "#000",
        fillColor: getColor(index),
        fillOpacity: 1,
        weight: 1,
        radius: 6,
    }
}

export default function UnitMap(props: Props) {
    const { unitsLayer, centroid, managers } = props
    const context = React.useContext(UIContext)

    const { BaseLayer } = LayersControl

    const [map, setMap] = React.useState<Map | null>(null)

    // Resize map when drawer is opened or closed
    React.useEffect(() => {
        setTimeout(() => map?.invalidateSize(), 500)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context?.state.isDrawerOpen])

    return (
        <MapContainer ref={setMap} center={centroid as LatLngExpression} zoom={6} zoomControl={false} style={{ width: "100%", height: "100%" }}>
            <Control prepend position="topleft">
                <MapSearch features={unitsLayer!.features} map={map} />
            </Control>
            <LayersControl position="bottomleft">
                {managers?.map((manager, index) => {
                    return (
                        <LayersControl.Overlay checked name={manager} key={manager}>
                            <GeoJSON
                                data={unitsLayer as GeoJSON.FeatureCollection}
                                pointToLayer={(_feature, latlng) => circleMarker(latlng)}
                                onEachFeature={createPopup}
                                filter={(feature) => feature.properties.manager === manager}
                                style={createStyle(index)}
                                key={manager}
                            />
                        </LayersControl.Overlay>
                    )
                })}
                <BaseLayer checked name="Streets">
                    <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </BaseLayer>
                <BaseLayer name="Satellite">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </BaseLayer>
            </LayersControl>
        </MapContainer>
    )
}
