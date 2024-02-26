import Loader from "../components/common/Loader"
import UnitMap from "../components/map/UnitMap"

import { useUnitsLayer } from "../hooks/geoJson"
import { useManagers } from "../hooks/unit"
import { useCentroid } from "../hooks/geoJson"

export default function Map() {
    const { data: unitsLayer, isFetching: unitsLayerFetching } = useUnitsLayer()
    const { data: managers, isFetching: managersFetching } = useManagers()
    const { data: centroid, isFetching: centroidFetching } = useCentroid(unitsLayer, unitsLayerFetching)

    return (
        <div className="page-container" style={{ position: "relative" }}>
            {unitsLayerFetching || managersFetching || centroidFetching ? <Loader /> :
                <UnitMap
                    unitsLayer={unitsLayer}
                    centroid={centroid ?? []}
                    managers={managers}
                />
            }
        </div>
    )
}