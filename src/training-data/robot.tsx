import React, {useEffect, useRef} from 'react';
import styled from 'styled-components'
import {ArmPosition} from '../App';

const Canvas = styled.canvas`
    border: solid;
`;

export const Robot = ({clicked, armPosition}: { clicked: (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void, armPosition: ArmPosition | null }) => {
    const canvasRef: React.RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas: HTMLCanvasElement = canvasRef.current;
        const canvasContext: CanvasRenderingContext2D = canvas.getContext('2d');
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        if (armPosition) {
            canvasContext.beginPath();
            canvasContext.moveTo(armPosition.start.x, armPosition.start.y);
            canvasContext.lineTo(armPosition.center.x, armPosition.center.y);
            canvasContext.lineTo(armPosition.end.x, armPosition.end.y);
            canvasContext.strokeStyle = "#FF0000";
            canvasContext.fillRect(armPosition.clicked.x,armPosition.clicked.y, 20, 20)
            canvasContext.stroke();
        }


    }, [armPosition])



    return <Canvas ref={canvasRef} height={800} width={800} onMouseMove={clicked}/>
}