import React, {useEffect, useRef} from 'react';
import {Point} from '../App';
import styled from 'styled-components'

const Canvas = styled.canvas`
    border: solid;
`;


export const TrainingDataOutput = ({trainingData}: { trainingData: Point[] }) => {
    const canvasRef: React.RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas: HTMLCanvasElement = canvasRef.current;
        const canvasContext: CanvasRenderingContext2D = canvas.getContext('2d');
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        trainingData.forEach(point =>
            canvasContext.fillRect(point.x,  canvas.height - point.y, 2, 2)
        )
    }, [trainingData])

    return <Canvas ref={canvasRef} height={800} width={800}/>
}