"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = void 0;
function clamp(val, min, max) {
    return Math.min(max, Math.max(val, min));
}
exports.clamp = clamp;
