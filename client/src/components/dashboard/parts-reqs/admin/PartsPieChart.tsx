import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate()
  const target = props.target
  const item = props.item

  const handleClick = (statusGroup?: string, requesters?: Array<NovaUser>, region?: string, urgency?: string) => {
    
    let statuses: Array<string> = []
    if (statusGroup === "Pending Quote") {
        statuses = ["Pending Quote"]
    } else if (statusGroup === "Pending Approval") {
        statuses = ["Pending Approval", "Quote Provided - Pending Approval", "Sourcing - Request to Cancel"]
    } else if (statusGroup === "Rejected") {
        statuses = ["Rejected - Adjustments Required"]
    } else if (statusGroup === "Approved") {
        statuses = ["Approved", "Approved - On Hold"]
    } else if (statusGroup === "Sourcing") {
        statuses = [
            "Sourcing - In Progress",
            "Sourcing - Information Required",
            "Sourcing - Information Provided",
            "Sourcing - Pending Amex Approval",
            "Sourcing - Amex Approved",
            "Sourcing - Request to Cancel",
        ]
    } else if (statusGroup === "Parts Ordered") {
        statuses = ["Ordered - Awaiting Parts"]
    } else if (statusGroup === "Parts Staged") {
        statuses = ["Completed - Parts Staged/Delivered"]
    } else if (statusGroup === "Closed") {
        statuses = ["Closed - Partially Received", "Closed - Parts in Hand", "Rejected - Closed", "Closed - Order Canceled"]
    } else if (statusGroup === "Unit Down") {
        statuses = UNIT_DOWN_STATUSES
    }

    navigate("/supply-chain", {
        state: { statuses: statuses, requesters: requesters, region: region, urgency: urgency },
    })
}

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
        onItemClick={(event, d) => {
          if(target === 'region'){
            return handleClick(data[d.dataIndex]['label'], undefined, item)
          } else {
            return handleClick(item, undefined, data[d.dataIndex]['label'])
          }
        }}
    >
      <PieCenterLabel>
        Total: {total}
      </PieCenterLabel>
    </PieChart>
  );
}


// if(target === 'region'){
//   return handleClick(listItem.label, undefined, item)
// } else {
//   return handleClick(item, undefined, listItem.label)
// }
// }}

// console.log(data[d.dataIndex]['label']