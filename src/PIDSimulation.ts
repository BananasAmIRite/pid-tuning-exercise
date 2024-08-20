import SetpointChart from './SetpointChart';

export interface Input {
    id: string;
    name: string;
}

export default abstract class PIDSimulation {
    protected simContainer: HTMLDivElement;

    protected chart!: SetpointChart;

    protected cnv!: HTMLCanvasElement;

    private static CANVAS_WIDTH = 800;
    private static CANVAS_HEIGHT = 600;

    private startTime: number = Infinity;

    public constructor(private simulationTarget: HTMLDivElement, inputs: Input[] = [], outputs: Input[] = []) {
        this.simContainer = document.createElement('div');
        this.setupRenderer(this.simContainer, inputs, outputs);
        simulationTarget.appendChild(this.simContainer);
    }

    abstract calculate(): void;

    abstract render(ctx: CanvasRenderingContext2D): void;

    loop() {
        if (this.startTime === Infinity) {
            this.startTime = Date.now();
        }
        const ctx = this.cnv.getContext('2d');
        if (!ctx) return;
        this.calculate();
        this.render(ctx);

        requestAnimationFrame(() => this.loop());
    }

    private setupRenderer(target: HTMLDivElement, inputs: Input[], outputs: Input[]) {
        const graphsCont = document.createElement('div');
        graphsCont.style.display = 'flex';
        graphsCont.style.width = '90vw';
        graphsCont.style.flexDirection = 'row';
        const canvas = document.createElement('canvas');
        canvas.width = PIDSimulation.CANVAS_WIDTH;
        canvas.height = PIDSimulation.CANVAS_HEIGHT;
        canvas.style.width = `${PIDSimulation.CANVAS_WIDTH}px`;
        canvas.style.height = `${PIDSimulation.CANVAS_HEIGHT}px`;
        graphsCont.appendChild(canvas);

        const graphCanvasCont = document.createElement('div');
        graphCanvasCont.style.width = '40vw';

        const graphCanvas = document.createElement('canvas');
        canvas.width = PIDSimulation.CANVAS_WIDTH;
        canvas.height = PIDSimulation.CANVAS_HEIGHT;
        canvas.style.width = `${PIDSimulation.CANVAS_WIDTH}px !important`;
        canvas.style.height = `${PIDSimulation.CANVAS_HEIGHT}px !important`;
        graphCanvasCont.appendChild(graphCanvas);
        graphsCont.appendChild(graphCanvasCont);

        target.appendChild(graphsCont);

        this.chart = new SetpointChart(graphCanvas, 10);

        for (const input of inputs) {
            target.appendChild(this.createInput(input.id, input.name));
        }
        for (const output of outputs) {
            target.appendChild(this.createOutput(output.id, output.name));
            this.setOutput(output.id, 0);
        }
        this.cnv = canvas;
    }

    protected getInput(id: string): number {
        return Number((document.getElementById(`input-${id}`) as HTMLInputElement)?.value ?? 0);
    }

    protected setOutput(id: string, value: number) {
        const outputElem = document.getElementById(`output-${id}`);
        if (!outputElem) return;
        outputElem.innerText = `${value.toFixed(2)}`;
    }

    protected createInput(inputId: string, name: string): HTMLDivElement {
        const div = document.createElement('div');
        div.id = `input-${inputId}-container`;
        const label = document.createElement('span');
        label.innerText = `${name}: `;
        const input = document.createElement('input');
        input.id = `input-${inputId}`;
        input.type = 'number';
        div.append(label, input);
        return div;
    }
    protected createOutput(outputId: string, outputName: string): HTMLDivElement {
        const div = document.createElement('div');
        div.id = `output-${outputId}-container`;
        const label = document.createElement('span');
        label.innerText = `${outputName}: `;
        const outputVal = document.createElement('span');
        outputVal.id = `output-${outputId}`;
        div.append(label, outputVal);
        return div;
    }

    public unmount() {
        this.simulationTarget.removeChild(this.simContainer);
    }

    public getTimeMS() {
        return Date.now() - this.startTime;
    }
}
