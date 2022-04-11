import { trigger, track } from './effect'

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_is_reactive',
    IS_READONLY = '__v_is_readonly'
}

const createGetter = function (isReadOnly = false) {
    return function (target, key) {
        const res = Reflect.get(target, key)

        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadOnly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadOnly
        }
        // 收集依赖
        if (!isReadOnly) {
            track(target, key)
        }
        return res
    }
}

const createSetter = function () {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value)
        // 触发依赖
        trigger(target, key)
        return res;
    }
}

const get = createGetter()
const set = createSetter()

const readonlyGet = createGetter(true)

export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn(`read only object's cannot be set, accessing key is ${String(key)}, value is ${value}`, target)
        return true
    }
}