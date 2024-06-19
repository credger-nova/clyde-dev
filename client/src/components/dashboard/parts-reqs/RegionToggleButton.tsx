import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface Props{
    regions: Array<string>
    region: string
    setRegion: React.Dispatch<React.SetStateAction<string>>
}

export default function RegionToggleButton(props: Props) {
    const {regions, region, setRegion} = props

    if(regions.length === 1){
      return null
    }

    const handleChange = (
      event: React.MouseEvent<HTMLElement>,
      newRegion: string,
    ) => {
      setRegion(newRegion);
    };

    const buttons = regions.map((region: string) => {
      return <ToggleButton disableRipple key={region} value={region}>{region}</ToggleButton>
    })

    return (
      <ToggleButtonGroup
        color="primary"
        value={region}
        exclusive
        onChange={handleChange}
        aria-label="Platform"
      >   
          {buttons}
      </ToggleButtonGroup>
    );
}
