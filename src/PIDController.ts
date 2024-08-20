export default class PIDController {
    private lastError: number = Infinity;
    private accum: number = 0;

    public p: number = 0;
    public i: number = 0;
    public d: number = 0;

    public run(setpoint: number, measurement: number, dt: number): number {
        const error = setpoint - measurement;

        if (this.lastError === Infinity) {
            // dry run
            this.lastError = error;
            return this.p * error;
        }

        this.accum += error * dt;
        const derivative = (error - this.lastError) / dt;

        const pTerm = this.p * error;
        const iTerm = this.i * this.accum;
        const dTerm = this.d * derivative;

        this.lastError = error;
        return pTerm + iTerm + dTerm;
    }
}
