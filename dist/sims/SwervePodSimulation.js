"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DcMotor_1 = __importDefault(require("../DcMotor"));
const PIDController_1 = __importDefault(require("../PIDController"));
const PIDSimulation_1 = __importDefault(require("../PIDSimulation"));
class SwervePodSimulation extends PIDSimulation_1.default {
    // private static
    constructor(simulationTarget) {
        super(simulationTarget, [
            {
                id: 'p',
                name: 'p',
            },
            // {
            //     id: 'd',
            //     name: 'd',
            // },
            {
                id: 'setpoint',
                name: 'setpoint',
            },
        ], [
            { id: 'angle', name: 'angle' },
            { id: 'error', name: 'error' },
            { id: 'effort', name: 'effort' },
        ]);
        this.turnMotor = DcMotor_1.default.makeTransmission(DcMotor_1.default.makeRS775(), 1, 150 / 7, 0.8);
        this.controller = new PIDController_1.default();
        this.lastRunTime = Date.now();
        this.cnv.addEventListener('click', (evt) => {
            const angle = -Math.atan2(evt.offsetY - this.cnv.height / 2, evt.offsetX - this.cnv.width / 2);
            const currentAngle = (angle * 180) / Math.PI;
            this.turnMotor.reset(currentAngle, 0, 0);
        });
        const text = document.createElement('p');
        text.innerText = `
            This is a simulation model of a swerve pod. The graph shows the angle of the swerve pod (-180 to 180). 

            Increase the P value (starting from 0.00001) until the wheel tracks the setpoint correctly and quickly. 
        `;
        this.simContainer.appendChild(text);
    }
    calculate() {
        const dt = Date.now() - this.lastRunTime;
        this.lastRunTime = Date.now();
        const pInput = this.getInput('p');
        const dInput = this.getInput('d');
        this.controller.p = pInput;
        this.controller.d = dInput;
        const setpointInput = this.getInput('setpoint');
        const position = this.turnMotor.getPosition();
        let effortVolts = this.controller.run(setpointInput % 360, position, dt / 1000);
        // effortVolts = clamp(effortVolts, -18, 18);
        this.setOutput('effort', effortVolts);
        this.setOutput('angle', position);
        this.setOutput('error', setpointInput - position);
        const friction = -SwervePodSimulation.KINETIC_FRICTION * SwervePodSimulation.WEIGHT * SwervePodSimulation.GRAVITY;
        // Math.abs(this.turnMotor.getTorque()) >
        // SwervePodSimulation.STATIC_FRICTION * SwervePodSimulation.WEIGHT * SwervePodSimulation.GRAVITY
        //     ? -SwervePodSimulation.KINETIC_FRICTION * SwervePodSimulation.WEIGHT * SwervePodSimulation.GRAVITY
        //     : -this.turnMotor.getTorque(); // static friction
        this.turnMotor.step(effortVolts, SwervePodSimulation.BILLET_LOAD, friction, dt / 1000);
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
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 10;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const POD_LENGTH = 450;
        const POD_WIDTH = 20;
        ctx.save();
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.rotate(-angleRadians);
        ctx.fillStyle = 'white';
        ctx.fillRect(-POD_LENGTH / 2, -POD_WIDTH / 2, POD_LENGTH, POD_WIDTH);
        ctx.restore();
        this.drawArrow(ctx, ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 2 + transX, ctx.canvas.height / 2 - transY);
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, (POD_LENGTH / 2) * 1.05, 0, 2 * Math.PI);
        ctx.stroke();
    }
    drawArrow(ctx, fx, fy, tx, ty) {
        // console.log(fx, fy, tx, ty);
        var headlen = 50; // length of head in pixels
        var dx = tx - fx;
        var dy = ty - fy;
        var angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.lineTo(tx - headlen * Math.cos(angle - Math.PI / 6), ty - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - headlen * Math.cos(angle + Math.PI / 6), ty - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }
}
exports.default = SwervePodSimulation;
SwervePodSimulation.BILLET_LOAD = (0.2494758 * 0.0508 * 0.0508) / 2; // moment of inertia of a standard billet wheel ( MR^2 / 2 => 0.55 lb * (2 in)^2 / 2 )
// private static BILLET_LOAD: number = 0.9246106623588476; // ykw im just gonna use the load for the 427 arm cuz these motors are too power for a small billet
SwervePodSimulation.STATIC_FRICTION = 0.1;
SwervePodSimulation.KINETIC_FRICTION = 0.0;
SwervePodSimulation.WEIGHT = 45.3592;
SwervePodSimulation.GRAVITY = 9.81;
