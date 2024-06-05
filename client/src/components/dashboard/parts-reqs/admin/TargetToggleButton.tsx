import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export default function TargetToggleButton(props) {
  const target = props.target
  const setTarget = props.setTarget
  const setMenu = props.setMenu
  const setData = props.setData
  const setItem = props.setItem
  const dataByRegion = props.dataByRegion
  const dataByStatus = props.dataByStatus
  const regionList = props.regionList
  const statusList = props.statusList

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTarget: string,
  ) => {
    setTarget(newTarget);    
    if(newTarget ==='region'){
      setData(dataByRegion)
      setMenu(regionList)
      setItem(regionList[0])
    } else{
        setData(dataByStatus)
        setMenu(statusList)
        setItem(statusList[0])
    }
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={target}
      exclusive
      onChange={handleChange}
      aria-label="Platform"
    >
      <ToggleButton value="region">Region</ToggleButton>
      <ToggleButton value="status">Status</ToggleButton>
    </ToggleButtonGroup>
  );
}
