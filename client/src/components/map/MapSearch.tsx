import Autocomplete from '@mui/material/Autocomplete'
import { GeoJSONFeature } from '../../types/geoJson'
import TextField from '@mui/material/TextField'
import parse from 'autosuggest-highlight/parse'
import match from 'autosuggest-highlight/match'
import { Map } from 'leaflet'

const textFieldStyle = {
    ".MuiInputBase-root": {
        background: "#454545e3",
        boxShadow: "3px 3px 5px #0000009e"
    },
    ".MuiInputBase-root:hover": {
        border: "none"
    }
}

interface Props {
    features: Array<GeoJSONFeature>,
    map: Map | null
}

const getCoords = (feature: GeoJSONFeature) => {
    if (feature.geometry.type === "Point" && feature.geometry.coordinates) {
        return { lat: feature.geometry.coordinates[1] as number, lng: feature.geometry.coordinates[0] as number }
    } else {
        return { lat: 0, lng: 0 }
    }
}

export default function MapSearch(props: Props) {
    const { features, map } = props

    const goToFeature = (_e: React.SyntheticEvent<Element, Event>, value: GeoJSONFeature | null) => {
        if (value) {
            map?.flyTo(getCoords(value), 16, {duration: 0.5})
        }
    }

    return (
        <Autocomplete
            options={features}
            getOptionLabel={(option) => {
                return (option.properties.unitNumber)
            }}
            onChange={goToFeature}
            renderInput={(params) => <TextField
                {...params}
                variant="outlined"
                placeholder="Search..."
                sx={textFieldStyle}
            />}
            renderOption={(props, option, { inputValue }) => {
                const matches = match(option.properties.unitNumber, inputValue, { insideWords: true });
                const parts = parse(option.properties.unitNumber, matches);

                return (
                    <li {...props}>
                        <div>
                            {parts.map((part, index) => (
                                <span
                                    key={index}
                                    style={{
                                        fontWeight: part.highlight ? 700 : 400,
                                        color: part.highlight ? "#23aee5" : "#fff"
                                    }}
                                >
                                    {part.text}
                                </span>
                            ))}
                        </div>
                    </li>
                );
            }}
            sx={{ position: "absolute", width: "50vw", maxWidth: "400px", padding: "10px" }}
        />
    )
}