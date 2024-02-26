import Loader from "../components/common/Loader"
import UnitMap from "../components/map/UnitMap"

import { useUnitsLayer } from "../hooks/geoJson"
import { useManagers } from "../hooks/unit"

export default function Map() {
    const { data: unitsLayer, isFetching: unitsLayerFetching } = useUnitsLayer()
    const { data: managers, isFetching: managersFetching } = useManagers()

    return (
        <div className="page-container" style={{ position: "relative" }}>
            {unitsLayerFetching || managersFetching ? <Loader /> :
                <UnitMap
                    unitsLayer={unitsLayer}
                    managers={managers}
                />
            }
        </div>
    )
}