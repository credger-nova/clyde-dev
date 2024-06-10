import * as React from 'react';
import {Box, Link } from '@mui/material';
import TargetToggleButton from './TargetToggleButton';
import PartsPieChart from './PartsPieChart';
import PartsLegend from './PartsLegend';
import TargetDropdownMenu from './TargetDropdownMenu';
import { toTitleCase} from "../../../../utils/helperFunctions"
import { STATUS_GROUPS } from '../lookupTables';
import { useNavigate } from 'react-router-dom';
import { calcUnitDownV2, navigateToSupplyChain } from '../dashboardFunctions';
import { PartsReq } from '../../../../types/partsReq';

interface Props {
    regionsUpperCase: Array<string>;
    partsByRegion: {[key: string]: {[key: string]: number}};
    partsByStatus: {[key: string]: {[key: string]: number}};
    partsReqs: Array<PartsReq>
}

export interface PieChartSeries {
    value: number;
    label: string;
    color: string;
}

const colorPallete = ['#04a5e5', '#ea76cb', '#d20f39', '#40a02b', '#df8e1d', '#8839ef', '#dd7878', '#1e66f5']

export default function AdminPartsReq(props: Props){
    const {regionsUpperCase, partsByRegion, partsByStatus, partsReqs} = props
    const statusList = STATUS_GROUPS
    const regionList = regionsUpperCase.map((region: string) => {
        return toTitleCase(region)
    })
    const navigate = useNavigate()
    
    const [target, setTarget] = React.useState('region')
    const [menu, setMenu] = React.useState(regionList)
    const [item, setItem] = React.useState(regionList[0])

    let unitsDown: number = -999
    if(target === 'region'){
        unitsDown = calcUnitDownV2(partsReqs, item)
    } else if(target === 'status'){
        unitsDown = calcUnitDownV2(partsReqs, undefined, item)
    }

    const data: Array<PieChartSeries> = []
    if(target === 'region'){
        statusList.map((status, index) => {
            const x = {value: partsByRegion[item.toUpperCase()][status], label: status, color: colorPallete[index]}
            data.push(x)
    })
    } else if(target === 'status'){
        regionList.map((region, index) => {
            const x = {value: partsByStatus[item][region.toUpperCase()], label: region, color: colorPallete[index]}
            data.push(x)    
        })
    } 

    if(!data.length){
        return undefined
    }

    return(
        <Box sx={{height: 500, maxWidth: 800, background: '#242424', borderRadius: '16px', padding: '24px', mx: 'auto', my: 4}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <TargetDropdownMenu target={target} menu={menu} item={item} setItem={setItem}/>
                <TargetToggleButton target={target} setTarget={setTarget} setMenu={setMenu} regionList={regionList} setItem={setItem}/>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
                <PartsPieChart target={target} item={item} data={data}/>
                <PartsLegend target={target} data={data} item={item}/>
            </Box>
            <Box sx={{display: 'flex', aligItems: 'center', justifyContent: 'center', fontSize: '20px'}}>
                <Link 
                    underline="hover" 
                    sx={{cursor: 'pointer'}}
                    onClick = {() => {
                        if(target === 'region'){
                            return navigateToSupplyChain(navigate, 'Unit Down', undefined, item)
                        } else{
                            return navigateToSupplyChain(navigate, 'Unit Down')
                        }
                    }}
                >
                    Units down:
                </Link>
                <Box sx={{marginLeft: '8px'}}>{unitsDown}</Box>
            </Box>
        </Box>
    )
}


