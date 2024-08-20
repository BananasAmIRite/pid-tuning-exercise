"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SimulationContainer_1 = __importDefault(require("./SimulationContainer"));
const ArmSimulation_1 = require("./sims/ArmSimulation");
const SwervePodSimulation_1 = __importDefault(require("./sims/SwervePodSimulation"));
const container = document.getElementById('container');
if (!container || !(container instanceof HTMLDivElement))
    throw new Error('invalid container');
const simContainer = new SimulationContainer_1.default();
simContainer.simulation = new SwervePodSimulation_1.default(container);
window.addEventListener('keydown', (e) => {
    if (e.key === 'a') {
        simContainer.simulation = new ArmSimulation_1.ArmSimWithG(container);
    }
    else if (e.key === 's') {
        simContainer.simulation = new SwervePodSimulation_1.default(container);
    }
    else if (e.key === 'd') {
        simContainer.simulation = new ArmSimulation_1.ArmSimWithoutG(container);
    }
});
