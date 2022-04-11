class ReactiveEffect {
    private _fn: any
    public scheduler: any
    isActive = true
    constructor(fn, scheduler?) {
        this._fn = fn
        this.scheduler = scheduler
    }

    run() {
        // 全局一次只有一个正在执行的effect(vue2中的watcher)
        if(!this.isActive) return
        activeEffect = this
        return this._fn()
    }

    stop(){
        if(this.isActive) {
            this.isActive = false
            cleanupTrack(this)
        }
    }
}

const targetMap = new Map()
let activeEffect

export const trigger = function (target, key) {
    // 取出该key的依赖
    const depMap = targetMap.get(target)

    const dep = depMap.get(key)
    // 执行依赖
    dep.forEach((_effect) => {
        if (_effect.scheduler) {
            _effect.scheduler()
        } else {
            _effect.run()
        }
    })
}

//收集依赖
export const track = function (target, key) {
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
    dep.add(activeEffect)
}

export const effect = function (fn, options:any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler)
    _effect.run()

    fn._effect = _effect

    const runner: any =  _effect.run.bind(_effect)
    runner._effect = _effect
    return runner
}

export const stop = (runner) => {
    runner._effect.stop()
}

const cleanupTrack = (effect) => {
}