import { extend } from '../shared'

let activeEffect
// 被stop的effect不能被收集依赖
let shouldTrack

class ReactiveEffect {
    private _fn: any
    public scheduler: any
    deps = []
    isActive = true
    onStop?: () => void
    constructor(fn, { scheduler, onStop }) {
        this._fn = fn
        if (scheduler) this.scheduler = scheduler
        if (onStop) this.onStop = onStop
    }

    run() {
        // 全局一次只有一个正在执行的effect(vue2中的watcher)
        // if(!this.isActive) return this._fn()

        if (!this.isActive) return this._fn()

        activeEffect = this
        shouldTrack = true

        const result = this._fn()

        shouldTrack = false
        return result
    }

    stop() {
        if (this.isActive) {
            cleanupEffect(this)
            this.isActive = false
            if (this.onStop) this.onStop()
        }
    }
}

const targetMap = new Map()

export const trigger = function (target, key) {
    // 取出该key的依赖
    const depMap = targetMap.get(target)

    const dep = depMap.get(key)
    // 执行依赖
    triggerEffect(dep)
}

//收集依赖
export const track = function (target, key) {
    if (!isTracking()) return

    // 取出该key的依赖
    let depMap = targetMap.get(target)
    if (!depMap) {
        depMap = new Map()
        targetMap.set(target, depMap)
    }
    let dep = depMap.get(key)
    if (!dep) {
        dep = new Set()
        depMap.set(key, dep)
    }

    trackEffect(dep)
}

export const trackEffect = function (dep) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
}

export const triggerEffect = function (dep) {
    // 优化
    if (!dep.has(activeEffect)) return
    dep.forEach((_effect) => {
        if (_effect.scheduler) {
            _effect.scheduler()
        } else {
            _effect.run()
        }
    })
}

export const isTracking = function () {
    return shouldTrack && activeEffect !== undefined
}

export const effect = function (fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options)
    extend(_effect, options)

    _effect.run()

    const runner: any = _effect.run.bind(_effect)
    // 挂载到runner上，方便执行stop
    runner._effect = _effect
    return runner
}

export const stop = (runner) => {
    runner._effect.stop()
}

const cleanupEffect = (effect) => {
    effect.deps.forEach((dep) => {
        dep.delete(effect)
    })
    // 可以直接清空effect的deps
    effect.deps.length = 0
}
