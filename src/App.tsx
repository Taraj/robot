import React, {useState} from 'react';
import {TrainingDataOutput} from "./training-data/trainingDataOutput";
import {NeuralNetwork} from "./training-data/neuralNetwork";
import {ErrorDataOutput} from "./training-data/errorDataOutput";
import {Robot} from "./training-data/robot";


export interface Point {
    readonly x: number;
    readonly y: number;
}

export interface Angles {
    readonly alpha: number;
    readonly beta: number;
}

export interface TrainingExample {
    readonly input: Point;
    readonly label: Angles;
}

export class TrainingDataGenerator {
    private readonly armLength: number;
    private readonly center: Point;

    constructor(armLength: number = 10, center: Point = {x: 0, y: 0}) {
        this.armLength = armLength;
        this.center = center;
    }

    generate(count: number): TrainingExample[] {
        const output: TrainingExample[] = [];
        for (let i = 0; i < count; i++) {
            output.push(this.generateSingleExample())
        }
        return output;
    }

    generateSingleExample(): TrainingExample {
        const alpha: number = Math.random() * Math.PI;
        const beta: number = Math.random() * Math.PI;
        return {
            input: this.translate(this.translate(this.center, alpha), Math.PI - beta + alpha),
            label: {
                alpha: alpha,
                beta: beta
            }
        };
    }

    private translate(center: Point, angle: number): Point {
        return {
            x: center.x + this.armLength * Math.sin(angle),
            y: center.y - this.armLength * Math.cos(angle)
        }
    }
}

function translate(center: Point, angle: number, armLength: number): Point {
    return {
        x: center.x + armLength * Math.sin(angle),
        y: center.y - armLength * Math.cos(angle)
    }
}

export interface ArmPosition {
    readonly start: Point;
    readonly center: Point;
    readonly end: Point;
    readonly clicked: Point;
}

export const App = () => {
    const [trainingData, setTrainingData] = useState<TrainingExample[]>([]);
    const [errors, setErrors] = useState<number[]>([])
    const [armPosition, setArmPosition] = useState<ArmPosition | null>(null)


    const [neuralNetwork] = useState<NeuralNetwork>(new NeuralNetwork({
        numberOfInput: 2,
        hiddenLayers: [
            {layerSize: 10},
            {layerSize: 20},
            {layerSize: 20},
            {layerSize: 10}
        ],
        numberOfOutputs: 2
    }));
    const [trainingDataGenerator] = useState<TrainingDataGenerator>(new TrainingDataGenerator(200, {
        x: 400,
        y: 400
    }));

    const train = () => {
        const max = Math.max(...trainingData.map(it => it.input.x), ...trainingData.map(it => it.input.y))
        const min = Math.min(...trainingData.map(it => it.input.x), ...trainingData.map(it => it.input.y))
        neuralNetwork.train(trainingData.map(it => {
            return {
                input: [((it.input.x - min) / max) * 0.8 + 0.1, ((it.input.y - min) / max) * 0.8 + 0.1],
                label: [it.label.alpha / Math.PI * 0.8 + 0.1, it.label.beta / Math.PI * 0.8 + 0.1]
            }
        }))
        setErrors([...neuralNetwork.errorValues]);
    }

    const generateTrainingData = () => {
        setTrainingData(trainingDataGenerator.generate(1000))
    }

    const clicked = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const start = {x: 400, y: 400};
        const clicked = [event.clientX - rect.left, 800 - (event.clientY - rect.top)]
        const max = Math.max(...trainingData.map(it => it.input.x), ...trainingData.map(it => it.input.y));
        const min = Math.min(...trainingData.map(it => it.input.x), ...trainingData.map(it => it.input.y));

        const input = [((clicked[0] - min) / max) * 0.8 + 0.1, ((clicked[1] - min) / max) * 0.8 + 0.1];

        const [alpha, beta] = neuralNetwork.forward(input);

        const angle: Angles = {
            alpha: ((alpha - 0.1) / 0.8) * Math.PI,
            beta: ((beta - 0.1) / 0.8) * Math.PI
        }

        const center = translate(start, angle.alpha, 200);
        const end = translate(center, Math.PI - angle.beta + angle.alpha, 200)

        setArmPosition({
            start,
            center: {
                x: center.x,
                y: 800 - center.y
            },
            end: {
                x: end.x,
                y: 800 - end.y
            },
            clicked: {
                x: clicked[0],
                y: 800- clicked[1]
            }
        })
    }

    return (
        <div className="App">
            <div>
                <Robot clicked={clicked} armPosition={armPosition}/>
                <button onClick={train}>Trenuj</button>
                <button onClick={generateTrainingData}>Generuj zbiór uczący</button>
            </div>
            <div>
                <TrainingDataOutput trainingData={trainingData.map(trainingExample => trainingExample.input)}/>
                <ErrorDataOutput errors={errors}/>
            </div>
        </div>
    );
}



