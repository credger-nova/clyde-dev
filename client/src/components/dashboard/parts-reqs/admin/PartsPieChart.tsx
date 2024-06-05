import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

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

function getTotalParts(data){
  let sum = 0
  for(let i=0; i < data.length; i++){
    sum += data[i].value
  }
  return sum
}

export default function PartsPieChart(props) {
  const data = props.data
  const total = getTotalParts(data)

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
    >
      <PieCenterLabel>
        Total: {total}
      </PieCenterLabel>
    </PieChart>
  );
}