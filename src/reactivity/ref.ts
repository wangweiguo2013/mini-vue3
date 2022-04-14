import { hasChanged, isObject } from '../shared'
import { trackEffect, triggerEffect, isTracking } from './effect'
import { reactive } from './reactive'

class RefImplement {
    private _value: any
    // 进行新旧值对比的时候，需要使用原值，而_value是一个reactive
    private _rawValue: any
    // ! 维护自己的dep
    // ref只有一个dep，不必像reactive维护一个map，因为只有一个.value值
    private dep: Set<any>
    public __v_isRef = true
    constructor(value) {
        this._value = convert(value)
        this._rawValue = value
        this.dep = new Set()
    }
    get value() {
        if (isTracking()) {
            trackEffect(this.dep)
        }
        return this._value
    }

    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            this._value = convert(newValue)
            this._rawValue = newValue
            triggerEffect(this.dep)
        }
    }
}

export const ref = function (value) {
    return new RefImplement(value)
}

function convert(value) {
    return isObject(value) ? reactive(value) : value
}

export const isRef = function (value) {
    return !!value.__v_isRef
}

export const unRef = function (value) {
    return isRef(value) ? value.value : value
}

export const proxyRefs = function (objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key))
        },
        set(target, key, newValue) {
            if (isRef(target[key]) && !isRef(newValue)) {
                return (target[key].value = newValue)
            }
            return Reflect.set(target, key, newValue)
        }
    })
}
