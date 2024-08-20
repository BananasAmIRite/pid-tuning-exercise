"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// MOTOR SIM
// adapted from: https://github.com/Team254/Sim-FRC-2015/blob/master/src/com/team254/frc2015/sim/DCMotor.java
class DCMotor {
    // Convenience methods for constructing common motors.
    static makeRS775() {
        let KT = 0.009; // 9 mNm / A
        let KV = (1083.0 * (Math.PI * 2.0)) / 60.0; // 1083 rpm/V in
        // rad/sec/V
        let RESISTANCE = 18.0 / 130.0; // Rated for 130A stall @ 18V
        let INERTIA = 1.20348237e-5; // 127g cylinder @ 1.084" diameter
        return new DCMotor(KT, KV, RESISTANCE, INERTIA);
    }
    static makeNeo() {
        let KT = 3.75 / 150;
        let KV = ((5676 / 12) * (Math.PI * 2.0)) / 60.0;
        let RESISTANCE = 12.0 / 150.0; // Rated for 105A stall @ 12V
        let INERTIA = 0; // 127g cylinder @ 1.084" diameter
        return new DCMotor(KT, KV, RESISTANCE, INERTIA);
    }
    static makeRS550() {
        let KT = 0.004862;
        let KV = (1608.0 * (Math.PI * 2.0)) / 60.0;
        let RESISTANCE = 12.0 / 85.0;
        let INERTIA = 0; // TODO(jared): Measure this
        return new DCMotor(KT, KV, RESISTANCE, INERTIA);
    }
    /*
     * Make a transmission.
     *
     * @param motors The motor type attached to the transmission.
     * @param num_motors The number of motors in this transmission.
     * @param gear_reduction The reduction of the transmission.
     * @param efficiency The efficiency of the transmission.
     * @return A DCMotor representing the combined transmission.
     */
    static makeTransmission(motor, num_motors, gear_reduction, efficiency) {
        return new DCMotor(num_motors * gear_reduction * efficiency * motor.m_kt, motor.m_kv / gear_reduction, motor.m_resistance / num_motors, motor.m_motor_inertia * num_motors * gear_reduction * gear_reduction);
    }
    /**
     * Simulate a simple DC motor.
     *
     * @param kt
     *            Torque constant (N*m / amp)
     * @param kv
     *            Voltage constant (rad/sec / V)
     * @param resistance
     *            (ohms)
     * @param inertia
     *            (kg*m^2)
     */
    constructor(kt, kv, resistance, inertia) {
        this.m_position = 0;
        this.m_velocity = 0;
        this.m_current = 0;
        this.m_kt = kt;
        this.m_kv = kv;
        this.m_resistance = resistance;
        this.m_motor_inertia = inertia;
        this.reset(0, 0, 0);
    }
    /**
     * Reset the motor to a specified state.
     *
     * @param position
     * @param velocity
     * @param current
     */
    reset(position, velocity, current) {
        this.m_position = position;
        this.m_velocity = velocity;
        this.m_current = current;
    }
    /**
     * Simulate applying a given voltage and load for a specified period of
     * time.
     *
     * @param applied_voltage
     *            Voltage applied to the motor (V)
     * @param load
     *            Load applied to the motor (kg*m^2)
     * @param acceleration
     *            The external torque applied (ex. due to gravity) (N*m)
     * @param timestep
     *            How long the input is applied (s)
     */
    step(applied_voltage, load, external_torque, timestep) {
        /*
         * Using the 971-style first order system model. V = I * R + Kv * w
         * torque = Kt * I
         *
         * V = torque / Kt * R + Kv * w torque = J * dw/dt + external_torque
         *
         * dw/dt = (V - Kv * w) * Kt / (R * J) - external_torque / J
         */
        load += this.m_motor_inertia;
        let acceleration = ((applied_voltage - this.m_velocity / this.m_kv) * this.m_kt) / (this.m_resistance * load) +
            external_torque / load;
        this.m_velocity += acceleration * timestep;
        this.m_position += this.m_velocity * timestep + 0.5 * acceleration * timestep * timestep;
        this.m_current = (load * acceleration * Math.sign(applied_voltage)) / this.m_kt;
    }
    getPosition() {
        return this.m_position;
    }
    getVelocity() {
        return this.m_velocity;
    }
    getCurrent() {
        return this.m_current;
    }
    getTorque() {
        return this.m_current * this.m_kt;
    }
}
exports.default = DCMotor;
