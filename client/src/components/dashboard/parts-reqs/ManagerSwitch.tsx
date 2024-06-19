import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Typography } from '@mui/material';

interface Props{
  checked: boolean
  setChecked: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ManagerSwitch(props: Props) {
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

