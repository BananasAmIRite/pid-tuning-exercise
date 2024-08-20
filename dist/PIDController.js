"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PIDController {
    constructor() {
        this.lastError = Infinity;
        this.accum = 0;
        this.p = 0;
        this.i = 0;
        this.d = 0;
    }
    run(setpoint, measurement, dt) {
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
exports.default = PIDController;
