import CircularProgress, { circularProgressClasses, CircularProgressProps } from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

function NovaCircularLoad(props: CircularProgressProps) {
    return (
        <Box>
            <CircularProgress
                variant="determinate"
                sx={{
                    color: (theme) =>
                        theme.palette.grey[800],
                    position: "fixed"
                }}
                size={60}
                thickness={6}
                {...props}
                value={100}
            />
            <CircularProgress
                variant="indeterminate"
                sx={{
                    color: "white",
                    animationDuration: '1500ms',
                    left: 0,
                    [`& .${circularProgressClasses.circle}`]: {
                        strokeLinecap: "round",
                    },
                }}
                size={60}
                thickness={6}
                {...props}
            />
        </Box>
    )
}

export default function Loader() {
    return (
        <div style={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center" }}>
            <p style={{ fontSize: "4em" }}>N</p>
            <NovaCircularLoad />
            <p style={{ fontSize: "4em" }}>V</p>
            <p style={{ fontSize: "4em" }}>A</p>
        </div>
    )
}