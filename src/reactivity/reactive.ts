import { mutableHandlers, readonlyHandlers } from "./baseHandlers"

export const reactive = function (raw) {
    return new Proxy(raw, mutableHandlers)
}

export const readonly = function (raw) {
    return createActiveObject(raw, readonlyHandlers)
}

const createActiveObject = function(raw, handler) {
    return new Proxy(raw, handler)
}