import {
    mutableHandlers,
    ReactiveFlags,
    readonlyHandlers,
    shallowReadonlyHandlers
} from './baseHandlers'

export const reactive = function (raw) {
    return new Proxy(raw, mutableHandlers)
}

export const readonly = function (raw) {
    return createActiveObject(raw, readonlyHandlers)
}

export const shallowReadonly = function (raw) {
    return createActiveObject(raw, shallowReadonlyHandlers)
}

const createActiveObject = function (raw, handler) {
    return new Proxy(raw, handler)
}

export const isReactive = function (target) {
    // 普通对象不会触发base handler的get，会返回undefined，所以要转成bool
    return !!target[ReactiveFlags.IS_REACTIVE]
}

export const isReadOnly = function (target) {
    return !!target[ReactiveFlags.IS_READONLY]
}
