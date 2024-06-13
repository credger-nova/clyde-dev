import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Typography } from '@mui/material';
import { TITLES } from "../../../utils/titles"
import { PERSONNEL_GROUPS } from './lookupTables';

export default function ManagerSwitch(props) {
  // const {novaUser, setChecked} = props
  // const userType = TITLES.find((item) => item.titles.includes(novaUser.jobTitle))
  // const group = PERSONNEL_GROUPS[userType.group]

  const {checked, setChecked} = props

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  
    return(
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={checked} onChange={handleChange} size="small"/>} 
          label={<Typography sx={{fontSize: "13px"}}>Submitted By Manager Only</Typography>}
        />
      </FormGroup>
    )
  }

