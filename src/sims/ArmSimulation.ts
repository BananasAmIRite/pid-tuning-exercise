import DCMotor from '../DcMotor';
import PIDController from '../PIDController';
import PIDSimulation from '../PIDSimulation';
import { clamp } from '../utils';

export default class ArmSimulation extends PIDSimulation {
    private turnMotor: DCMotor = DCMotor.makeTransmission(DCMotor.makeNeo(), 1, 60, 1);
    private controller: PIDController = new PIDController();

    private lastRunTime: number = Date.now();

    private static ARM_MASS = 9.07185;
    private static ARM_LENGTH = 0.552958;
    private static GRAVITY = 9.81;

    private static ARM_LOAD: number = (1 / 3) * this.ARM_MASS * this.ARM_LENGTH * this.ARM_LENGTH;
    private static MAX_ARM_GRAV: number = this.ARM_MASS * this.GRAVITY * this.ARM_LENGTH;

    public constructor(simulationTarget: HTMLDivElement, useKg: boolean = true) {
        super(
            simulationTarget,
            [
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
            ],
            [
                { id: 'angle', name: 'angle' },
                { id: 'error', name: 'error' },
                { id: 'effort', name: 'effort' },
            ]
        );

        this.cnv.addEventListener('click', (evt) => {
            const angle = -Math.atan2(evt.offsetY - this.cnv.height / 2, evt.offsetX - this.cnv.width / 2);
            const currentAngle = (angle * 180) / Math.PI;
            this.turnMotor.reset(currentAngle, 0, 0);
        });
    }

    calculate(): void {
        const dt = Date.now() - this.lastRunTime;
        this.lastRunTime = Date.now();

        const pInput = this.getInput('p');
        const dInput = this.getInput('d');
        const gInput = this.getInput('kg');

        this.controller.p = pInput;
        this.controller.d = dInput;

        const setpointInput = this.getInput('setpoint');
        const position = this.turnMotor.getPosition();
        let effortVolts =
            this.controller.run(setpointInput, position, dt / 1000) + gInput * Math.cos((position * Math.PI) / 180);

        this.setOutput('effort', effortVolts);
        this.setOutput('angle', position);
        this.setOutput('error', setpointInput - position);
        this.turnMotor.step(
            effortVolts,
            ArmSimulation.ARM_LOAD,
            -ArmSimulation.MAX_ARM_GRAV * Math.cos((position * Math.PI) / 180),
            dt / 1000
        );

        this.turnMotor.reset(
            this.turnMotor.getPosition() % 360,
            this.turnMotor.getVelocity(),
            this.turnMotor.getCurrent()
        );
        this.chart.addTimeValue(this.getTimeMS() / 1000, setpointInput, position);
    }

    render(ctx: CanvasRenderingContext2D): void {
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

export class ArmSimWithG extends ArmSimulation {
    public constructor(simulationTarget: HTMLDivElement) {
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

export class ArmSimWithoutG extends ArmSimulation {
    public constructor(simulationTarget: HTMLDivElement) {
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
