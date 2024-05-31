export interface UnitProperties {
    unitNumber: string
    location?: string
    customer?: string
    region?: string
    county?: string
    state?: string
    engine?: string
    frame?: string
    oemHP?: number
    status?: string
    mechanic?: string
    manager?: string
    director?: string
    coordinates?: string
}

export interface GeoJSONFeature {
    type: "Feature"
    geometry: {
        type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon"
        coordinates: Array<number> | Array<Array<number>> | null
    }
    properties: UnitProperties
}

export interface GeoJSONLayer {
    type: "FeatureCollection"
    features: Array<GeoJSONFeature>
}
