export interface GeoJSONFeature {
    type: "Feature",
    geometry: {
        type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon",
        coordinates: Array<number> | Array<Array<number>> | null
    }
    properties: Object,
}