"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArmSimWithoutG = exports.ArmSimWithG = void 0;
const DcMotor_1 = __importDefault(require("../DcMotor"));
const PIDController_1 = __importDefault(require("../PIDController"));
const PIDSimulation_1 = __importDefault(require("../PIDSimulation"));
class ArmSimulation extends PIDSimulation_1.default {
    constructor(simulationTarget, useKg = true) {
        super(simulationTarget, [
            {
                id: 'p',
                name: 'p',
            },
            {
                id: 'd',
                name: 'd',
            },
            ...(useKg
                ? [
                    {
                        id: 'kg',
                        name: 'kG',
                    },
                ]
                : []),
            {
                id: 'setpoint',
                name: 'setpoint',
            },
        ], [
            { id: 'angle', name: 'angle' },
            { id: 'error', name: 'error' },
            { id: 'effort', name: 'effort' },
        ]);
        this.turnMotor = DcMotor_1.default.makeTransmission(DcMotor_1.default.makeNeo(), 1, 60, 1);
        this.controller = new PIDController_1.default();
        this.lastRunTime = Date.now();
        this.cnv.addEventListener('click', (evt) => {
            const angle = -Math.atan2(evt.offsetY - this.cnv.height / 2, evt.offsetX - this.cnv.width / 2);
            const currentAngle = (angle * 180) / Math.PI;
            this.turnMotor.reset(currentAngle, 0, 0);
        });
    }
    calculate() {
        const dt = Date.now() - this.lastRunTime;
        this.lastRunTime = Date.now();
        const pInput = this.getInput('p');
        const dInput = this.getInput('d');
        const gInput = this.getInput('kg');
        this.controller.p = pInput;
        this.controller.d = dInput;
        const setpointInput = this.getInput('setpoint');
        const position = this.turnMotor.getPosition();
        let effortVolts = this.controller.run(setpointInput, position, dt / 1000) + gInput * Math.cos((position * Math.PI) / 180);
        this.setOutput('effort', effortVolts);
        this.setOutput('angle', position);
        this.setOutput('error', setpointInput - position);
        this.turnMotor.step(effortVolts, ArmSimulation.ARM_LOAD, -ArmSimulation.MAX_ARM_GRAV * Math.cos((position * Math.PI) / 180), dt / 1000);
        this.turnMotor.reset(this.turnMotor.getPosition() % 360, this.turnMotor.getVelocity(), this.turnMotor.getCurrent());
        this.chart.addTimeValue(this.getTimeMS() / 1000, setpointInput, position);
    }
    render(ctx) {
        // console.log('rendering...');
        const pos = this.turnMotor.getPosition();
        // console.log(pos);
        const angleRadians = (pos * Math.PI) / 180;
        const length = 200;
        const transX = length * Math.cos(angleRadians);
        const transY = length * Math.sin(angleRadians);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.lineTo(ctx.canvas.width / 2 + transX, ctx.canvas.height / 2 - transY);
        ctx.stroke();
    }
}
exports.default = ArmSimulation;
_a = ArmSimulation;
ArmSimulation.ARM_MASS = 9.07185;
ArmSimulation.ARM_LENGTH = 0.552958;
ArmSimulation.GRAVITY = 9.81;
ArmSimulation.ARM_LOAD = (1 / 3) * _a.ARM_MASS * _a.ARM_LENGTH * _a.ARM_LENGTH;
ArmSimulation.MAX_ARM_GRAV = _a.ARM_MASS * _a.GRAVITY * _a.ARM_LENGTH;
class ArmSimWithG extends ArmSimulation {
    constructor(simulationTarget) {
        super(simulationTarget, true);
        const text = document.createElement('p');
        text.innerText = `
            This is a simulation model of a 427's heavy 2024 arm mechanism. The graph shows the angle of the arm (-180 to 180). 
            Click anywhere on the simulation to move the arm to that position. 

            You now have a new value to tune, kG. This value allows the motor to account for the arm's weight when controlling. 
            Try to tune the kG value first by increasing the value until the arm stays still (doesn't fall, doesn't go up). Try clicking around to see if it stays. 

            Then, tune P and D like usual. 

            Notice that now, the arm is able to go to the correct position completely!
        `;
        this.simContainer.appendChild(text);
    }
}
exports.ArmSimWithG = ArmSimWithG;
class ArmSimWithoutG extends ArmSimulation {
    constructor(simulationTarget) {
        super(simulationTarget, false);
        const text = document.createElement('p');
        text.innerText = `
            This is a simulation model of a 427's heavy 2024 arm mechanism. The graph shows the angle of the arm (-180 to 180). 

            Click anywhere on the simulation to move the arm to that position. 
            
            Increase the P value until the arm starts to oscillate about the setpoint a bit (the graph may be helpful). 
            Then, increase the D value to "dampen" the control loop (your oscillation will start to decrease). 
            (Note: as you are tuning, at certain angles, the arm will not achieve the position completely. That is normal. )
        `;
        this.simContainer.appendChild(text);
    }
}
exports.ArmSimWithoutG = ArmSimWithoutG;
