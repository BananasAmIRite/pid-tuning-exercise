import PIDSimulation from './PIDSimulation';

export default class SimulationContainer {
    private currentSimulation?: PIDSimulation;
    public constructor() {}

    public set simulation(sim: PIDSimulation) {
        if (this.currentSimulation) this.currentSimulation.unmount();
        this.currentSimulation = sim;
        sim.loop();
    }
}
