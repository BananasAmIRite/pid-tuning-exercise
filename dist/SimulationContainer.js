"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SimulationContainer {
    constructor() { }
    set simulation(sim) {
        if (this.currentSimulation)
            this.currentSimulation.unmount();
        this.currentSimulation = sim;
        sim.loop();
    }
}
exports.default = SimulationContainer;
