import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";
import { navigateToSupplyChain } from '../dashboardFunctions';
import { PieChartSeries } from './AdminPartsReq';
import { Link } from '@mui/material';


const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 20,
}));

function PieCenterLabel({ children }: { children: React.ReactNode }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

function getTotalParts(data: Array<PieChartSeries>){
  let sum = 0
  for(let i=0; i < data.length; i++){
    sum += data[i].value
  }
  return sum
}

interface Props{
  target: string;
  item: string;
  data: Array<PieChartSeries>;
}

export default function PartsPieChart(props: Props) {
  const {target, item, data} = props
  const total = getTotalParts(data)
  const navigate = useNavigate()

  return (
    <PieChart
        skipAnimation
        width={400}
        height={400}
        series={[
            { 
                data, 
                innerRadius: 120,
                highlightScope: { faded: 'global', highlighted: 'item' },
                highlighted: {innerRadius: 120, outerRadius: 150},
            }
        ]}
        slotProps={{legend: {hidden: true}}}
        onItemClick={(_event, d) => {
          if(target === 'region'){
            return navigateToSupplyChain(navigate, data[d.dataIndex]['label'], undefined, item)
          } else {
              return navigateToSupplyChain(navigate, item, undefined, data[d.dataIndex]['label'])
          }
        }}
    >
      <PieCenterLabel>
        <Link 
          underline="hover"
          color="inherit"
          sx={{cursor: 'pointer', color: '#fff'}}
          onClick={() => {
            if(target === 'region'){
              return navigateToSupplyChain(navigate, undefined, undefined, item)
            } else{
                return navigateToSupplyChain(navigate, item)
            }
          }}
        >
            Total: {total}
        </Link>
      </PieCenterLabel>
    </PieChart>
  );
}
