"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auto_1 = require("chart.js/auto");
// Chart.register(TimeScale);
class SetpointChart {
    constructor(cnv, minScale) {
        this.cnv = cnv;
        this.minScale = minScale;
        this.chart = new auto_1.Chart(cnv, {
            type: 'line',
            options: {
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuad', // Easing function for smooth transitions
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        enabled: false,
                    },
                },
                scales: {
                    x: {
                        type: 'linear',
                        grace: '0%',
                        // min: () => this.chart.data.labels[0] as number,
                        suggestedMax: minScale,
                        suggestedMin: 0,
                        ticks: {
                            callback: function (value, index, values) {
                                // Hide the first and last tick labels
                                if (index === 0 || index === values.length - 1) {
                                    return '';
                                }
                                return value;
                            },
                        },
                    },
                    y: {
                        type: 'linear',
                        grace: '0%',
                        suggestedMin: -180,
                        suggestedMax: 180,
                    },
                },
                elements: {
                    line: {
                        capBezierPoints: false,
                    },
                    point: {
                        pointStyle: false,
                    },
                },
            },
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Setpoint',
                        data: [],
                        fill: false,
                        borderColor: 'rgb(255, 0, 0)',
                        tension: 0.1,
                    },
                    {
                        label: 'Position',
                        data: [],
                        fill: false,
                        borderColor: 'rgb(0, 0, 255)',
                        tension: 0.1,
                    },
                ],
            },
        });
    }
    addTimeValue(time, setpoint, measurement) {
        var _a, _b, _c;
        (_a = this.chart.data.labels) === null || _a === void 0 ? void 0 : _a.push(time);
        this.chart.data.datasets[0].data.push(setpoint);
        this.chart.data.datasets[1].data.push(measurement);
        // console.log(time, setpoint, measurement);
        // @ts-ignore
        if (this.chart.data.labels[this.chart.data.labels.length - 1] - this.chart.data.labels[0] > this.minScale) {
            (_b = this.chart.data.labels) === null || _b === void 0 ? void 0 : _b.shift();
            this.chart.data.datasets[0].data.shift();
            this.chart.data.datasets[1].data.shift();
        }
        console.log((_c = this.chart.data.labels) === null || _c === void 0 ? void 0 : _c[0]);
        // @ts-ignore
        this.chart.options.scales.x.min = this.chart.data.labels[0];
        // @ts-ignore
        this.chart.options.scales.x.max = Math.max(
        // @ts-ignore
        this.chart.data.labels[this.chart.data.labels.length - 1], this.minScale);
        console.log(this.chart);
        this.chart.update('none');
    }
}
exports.default = SetpointChart;
