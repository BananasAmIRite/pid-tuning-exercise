import SetpointChart from './SetpointChart';
import SimulationContainer from './SimulationContainer';
import ArmSimulation, { ArmSimWithG, ArmSimWithoutG } from './sims/ArmSimulation';
import SwervePodSimulation from './sims/SwervePodSimulation';

const container = document.getElementById('container');
if (!container || !(container instanceof HTMLDivElement)) throw new Error('invalid container');

const simContainer = new SimulationContainer();

simContainer.simulation = new SwervePodSimulation(container);

window.addEventListener('keydown', (e) => {
    if (e.key === 'a') {
        simContainer.simulation = new ArmSimWithG(container);
    } else if (e.key === 's') {
        simContainer.simulation = new SwervePodSimulation(container);
    } else if (e.key === 'd') {
        simContainer.simulation = new ArmSimWithoutG(container);
    }
});
