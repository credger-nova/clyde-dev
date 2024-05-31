import Loader from "../components/common/Loader"
import UnitMap from "../components/map/UnitMap"

import { useAuth0Token } from "../hooks/utils"
import { useUnitsLayer } from "../hooks/geoJson"
import { useManagers } from "../hooks/unit"
import { useCentroid } from "../hooks/geoJson"

export default function Map() {
    const token = useAuth0Token()

    const { data: unitsLayer, isFetching: unitsLayerFetching } = useUnitsLayer(token)
    const { data: managers, isFetching: managersFetching } = useManagers(token)
    const { data: centroid, isFetching: centroidFetching } = useCentroid(token, unitsLayer, unitsLayerFetching)

    return (
        <div className="page-container" style={{ position: "relative" }}>
            {unitsLayerFetching || managersFetching || centroidFetching || !unitsLayer ? (
                <Loader />
            ) : (
                <UnitMap unitsLayer={unitsLayer} centroid={centroid ?? []} managers={managers} />
            )}
        </div>
    )
}
