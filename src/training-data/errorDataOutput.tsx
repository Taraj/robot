import React from 'react';
import CanvasJSReact from '../utils/canvasjs.react';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

export const ErrorDataOutput = ({errors}: { errors: number[] }) => {
    return <CanvasJSChart options={{
        title: {
            text: 'Errors'
        },
        data: [{
            type: 'spline',
            dataPoints: errors.map((error: number, index: number) => {
                return {label: `${index}`, y: error}
            })
        }]
    }}
    />
}