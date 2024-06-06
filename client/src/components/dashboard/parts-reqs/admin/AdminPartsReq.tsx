import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TargetToggleButton from './TargetToggleButton';
import PartsPieChart from './PartsPieChart';
import PartsLegend from './PartsLegend';
import TargetDropdownMenu from './TargetDropdownMenu';

const dataByRegion = [
    { value: 5, label: 'Pending Approval', color: '#04a5e5' },
    { value: 10, label: 'Pending Quote', color: '#ea76cb' },
    { value: 0, label: 'Rejected', color: '#d20f39' },
    { value: 40, label: 'Approved', color: '#40a02b' },
    { value: 12, label: 'Sourcing', color: '#df8e1d' },
    { value: 60, label: 'Parts Ordered', color: '#8839ef' },
    { value: 5, label: 'Parts Staged', color: '#dd7878' },
    { value: 10, label: 'Closed', color: '#1e66f5' },
  ];

const dataByStatus = [
    { value: 12, label: 'Carlsbad', color: '#04a5e5' },
    { value: 0, label: 'East Texas', color: '#ea76cb' },
    { value: 5, label: 'Midcon', color: '#d20f39' },
    { value: 32, label: 'Pecos', color: '#40a02b' },
    { value: 46, label: 'North Permian', color: '#df8e1d' },
    { value: 10, label: 'South Permian', color: '#8839ef' },
    { value: 2, label: 'South Texas', color: '#dd7878' },
];

const regionList = ['Carlsbad', 'East Texas', 'Midcon', 'Pecos', 'North Permian', 'South Permian', 'South Texas']
const statusList = ['Pending Approval', 'Pending Quote', 'Rejected', 'Approved', 'Sourcing', 'Parts Ordered', 'Parts Staged', 'Closed']

export default function AdminPartsReq(props){
    const partsByRegion = props.partsByRegion
    const partsByStatus = props.partsByStatus
    //console.log(partsByRegion)
    console.log(partsByStatus)

    const [target, setTarget] = React.useState('region')
    const [menu, setMenu] = React.useState(regionList)
    const [item, setItem] = React.useState(regionList[0])
    //const [data, setData] = React.useState(dataByRegion)

    let data = null
    if(target === 'region' && partsByRegion && partsByStatus){
        data = [
            { value: partsByRegion[item.toUpperCase()]['Pending Approval'], label: 'Pending Approval', color: '#04a5e5' },
            { value: partsByRegion[item.toUpperCase()]['Pending Quote'], label: 'Pending Quote', color: '#ea76cb' },
            { value: partsByRegion[item.toUpperCase()]['Rejected'], label: 'Rejected', color: '#d20f39' },
            { value: partsByRegion[item.toUpperCase()]['Approved'], label: 'Approved', color: '#40a02b' },
            { value: partsByRegion[item.toUpperCase()]['Sourcing'], label: 'Sourcing', color: '#df8e1d' },
            { value: partsByRegion[item.toUpperCase()]['Parts Ordered'], label: 'Parts Ordered', color: '#8839ef' },
            { value: partsByRegion[item.toUpperCase()]['Parts Staged'], label: 'Parts Staged', color: '#dd7878' },
            { value: partsByRegion[item.toUpperCase()]['Closed'], label: 'Closed', color: '#1e66f5' },
          ];
    } else if(target === 'status'){
        data = [
            { value: partsByStatus[item]['CARLSBAD'], label: 'Carlsbad', color: '#04a5e5' },
            { value: partsByStatus[item]['EAST TEXAS'], label: 'East Texas', color: '#ea76cb' },
            { value: partsByStatus[item]['MIDCON'], label: 'Midcon', color: '#d20f39' },
            { value: partsByStatus[item]['PECOS'], label: 'Pecos', color: '#40a02b' },
            { value: partsByStatus[item]['NORTH PERMIAN'], label: 'North Permian', color: '#df8e1d' },
            { value: partsByStatus[item]['SOUTH PERMIAN'], label: 'South Permian', color: '#8839ef' },
            { value: partsByStatus[item]['SOUTH TEXAS'], label: 'South Texas', color: '#dd7878' },
        ]
    } else{
        data = null
    }

    return( data ?
        <Box sx={{height: 500, maxWidth: 800, background: '#242424', borderRadius: '16px', padding: '24px', mx: 'auto', my: 32}}>
            <Typography variant='h2' sx={{fontSize: 20, fontWeight: '500', mb: '16px', textAlign: 'center'}}>Parts Requisitions</Typography>
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <TargetDropdownMenu target={target} menu={menu} item={item} setItem={setItem}/>
                <TargetToggleButton target={target} setTarget={setTarget} menu={menu} setMenu={setMenu} regionList={regionList} statusList={statusList} setItem={setItem}/>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                <PartsPieChart target={target} data={data}/>
                <PartsLegend target={target} data={data}/>
            </Box>
        </Box>
        : <Box>Error: Unable to fetch data</Box>
    )
}


