"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SetpointChart_1 = __importDefault(require("./SetpointChart"));
class PIDSimulation {
    constructor(simulationTarget, inputs = [], outputs = []) {
        this.simulationTarget = simulationTarget;
        this.startTime = Infinity;
        this.simContainer = document.createElement('div');
        this.setupRenderer(this.simContainer, inputs, outputs);
        simulationTarget.appendChild(this.simContainer);
    }
    loop() {
        if (this.startTime === Infinity) {
            this.startTime = Date.now();
        }
        const ctx = this.cnv.getContext('2d');
        if (!ctx)
            return;
        this.calculate();
        this.render(ctx);
        requestAnimationFrame(() => this.loop());
    }
    setupRenderer(target, inputs, outputs) {
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
        this.chart = new SetpointChart_1.default(graphCanvas, 10);
        for (const input of inputs) {
            target.appendChild(this.createInput(input.id, input.name));
        }
        for (const output of outputs) {
            target.appendChild(this.createOutput(output.id, output.name));
            this.setOutput(output.id, 0);
        }
        this.cnv = canvas;
    }
    getInput(id) {
        var _a, _b;
        return Number((_b = (_a = document.getElementById(`input-${id}`)) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 0);
    }
    setOutput(id, value) {
        const outputElem = document.getElementById(`output-${id}`);
        if (!outputElem)
            return;
        outputElem.innerText = `${value.toFixed(2)}`;
    }
    createInput(inputId, name) {
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
    createOutput(outputId, outputName) {
        const div = document.createElement('div');
        div.id = `output-${outputId}-container`;
        const label = document.createElement('span');
        label.innerText = `${outputName}: `;
        const outputVal = document.createElement('span');
        outputVal.id = `output-${outputId}`;
        div.append(label, outputVal);
        return div;
    }
    unmount() {
        this.simulationTarget.removeChild(this.simContainer);
    }
    getTimeMS() {
        return Date.now() - this.startTime;
    }
}
exports.default = PIDSimulation;
PIDSimulation.CANVAS_WIDTH = 800;
PIDSimulation.CANVAS_HEIGHT = 600;
