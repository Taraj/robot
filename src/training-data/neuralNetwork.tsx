export interface HiddenLayerStructure {
    readonly layerSize: number;
}

export interface NeuralNetworkStructure {
    readonly numberOfInput: number;
    readonly hiddenLayers: HiddenLayerStructure[];
    readonly numberOfOutputs: number;
}

class Neuron {
    private readonly numberOfInputs: number;
    private readonly eta: number;
    weights: number[] = [];
    delta: number = 0;
    sigmoidValue: number = 0

    constructor(numberOfInputs: number, eta: number) {
        this.numberOfInputs = numberOfInputs;
        this.eta = eta;
        for (let i = 0; i < numberOfInputs; i++) {
            this.weights.push(Math.random() - 0.5);
        }
    }

    sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }

    sigmoidDerivative(): number {
        return this.sigmoidValue * (1 - this.sigmoidValue);
    }

    output(x: number[]): number {
        let activation = 0;
        for (let i = 0; i < this.numberOfInputs; i++) {
            activation += this.weights[i] * x[i]
        }
        this.sigmoidValue = this.sigmoid(activation);
        return this.sigmoidValue;
    }

    updateWeights(x: number[]): void {
        for (let i = 0; i < this.numberOfInputs; i++) {
            this.weights[i] -= this.eta * this.delta * x[i];
        }
    }
}

class Layer {
    readonly layerSize: number;
    readonly neurons: Neuron[] = [];
    input: number[] = [];

    constructor(prevLayerSize: number, layerSize: number, eta: number = 0.01) {
        this.layerSize = layerSize;
        for (let i = 0; i < layerSize; i++) {
            this.neurons.push(new Neuron(prevLayerSize, eta))
        }
    }

    output(x: number[]): number[] {
        const results: number[] = [];
        for (let i = 0; i < this.layerSize; i++) {
            results.push(this.neurons[i].output(x));
        }
        return results;
    }

    updateWeights(x: number[]) {
        for (let i = 0; i < this.layerSize; i++) {
            this.neurons[i].updateWeights(x);
        }
    }
}

export class NeuralNetwork {
    private readonly layers: Layer[] = [];
    private readonly structure: NeuralNetworkStructure;
    output: number[] = []

    constructor(structure: NeuralNetworkStructure) {
        this.structure = structure;
        if (structure.hiddenLayers.length === 0) {
            this.layers.push(new Layer(structure.numberOfInput, structure.numberOfOutputs));
        } else {
            this.layers.push(new Layer(structure.numberOfInput, structure.hiddenLayers[0].layerSize));
            for (let i = 0; i < structure.hiddenLayers.length - 1; i++) {
                this.layers.push(new Layer(structure.hiddenLayers[i].layerSize, structure.hiddenLayers[i + 1].layerSize));
            }
            this.layers.push(new Layer(structure.hiddenLayers[structure.hiddenLayers.length - 1].layerSize, structure.numberOfOutputs));
        }
    }

    train(examples: { input: number[], label: number[] }[], iterations: number = 10000) {
        for (let i = 0; i < iterations; i++) {
            console.log(`${i * 100 / iterations}%`)
            for (let j = 0; j < examples.length; j++) {
                const trainingExample = examples[j];
                this.forward(trainingExample.input);
                this.backward(trainingExample.label);
            }
            this.error(examples);
        }
    }

    forward(input: number[]): number[] {
        this.layers[0].input = [...input]
        let i = 0;
        for (; i < this.layers.length - 1; i++) {
            this.layers[i + 1].input = [...this.layers[i].output(this.layers[i].input)];
        }
        this.output = [...this.layers[i].output(this.layers[i].input)];
        return [...this.output]
    }

    private backward(expectedOutput: number[]): void {
        let lastLayerNumber = this.layers.length - 1;

        for (let neuronIndex = 0; neuronIndex < this.layers[lastLayerNumber].layerSize; neuronIndex++) {
            const epsilon = this.output[neuronIndex] - expectedOutput[neuronIndex];
            this.layers[lastLayerNumber].neurons[neuronIndex].delta = epsilon * this.layers[lastLayerNumber].neurons[neuronIndex].sigmoidDerivative();
        }
        this.layers[lastLayerNumber].updateWeights([...this.layers[lastLayerNumber].input]);

        for (let layerIndex = this.layers.length - 2; layerIndex >= 0; layerIndex--) {
            for (let neuronIndexOnCurrentLayer = 0; neuronIndexOnCurrentLayer < this.layers[layerIndex].layerSize; neuronIndexOnCurrentLayer++) {
                let epsilon = 0;
                for (let neuronIndexOnNextLayer = 0; neuronIndexOnNextLayer < this.layers[layerIndex + 1].layerSize; neuronIndexOnNextLayer++) {
                    epsilon += this.layers[layerIndex + 1].neurons[neuronIndexOnNextLayer].weights[neuronIndexOnCurrentLayer] * this.layers[1 + layerIndex].neurons[neuronIndexOnNextLayer].delta;
                }
                this.layers[layerIndex].neurons[neuronIndexOnCurrentLayer].delta = epsilon * this.layers[layerIndex].neurons[neuronIndexOnCurrentLayer].sigmoidDerivative();
            }
            this.layers[layerIndex].updateWeights([...this.layers[layerIndex].input]);
        }
    }

    public errorValues: number[] = []

    error(dataset:  { input: number[], label: number[] }[]) {
        const errors: number[] = [];
        for (let i = 0; i < dataset.length; i++) {
            const out = this.forward(dataset[i].input);
            let err = 0;
            for (let j = 0; j < out.length; j++) {
                err += (dataset[i].label[j] - out[j]) ** 2
            }
            errors.push(Math.sqrt(err))
        }
        this.errorValues.push(errors.reduce((a, b) => a + b, 0) / errors.length)
    }
}