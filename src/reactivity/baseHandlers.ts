import { extend, isObject } from '../shared'
import { trigger, track } from './effect'
import { reactive, readonly } from './reactive'

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_is_reactive',
    IS_READONLY = '__v_is_readonly'
}

const createGetter = function (isReadOnly = false, isShallow = false) {
    return function (target, key) {
        const res = Reflect.get(target, key)

        if (isObject(res) && !isShallow) {
            return isReadOnly ? readonly(res) : reactive(res)
        }

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
        return res
    }
}

const get = createGetter()
const set = createSetter()

const readonlyGet = createGetter(true)

const shallowReadonlyGet = createGetter(true, true)

export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn(
            `read only object's cannot be set, accessing key is ${String(key)}, value is ${value}`,
            target
        )
        return true
    }
}

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
})
