class ReactiveEffect{
    private _fn: any
    constructor(fn){
        this._fn = fn
    }

    run(){
        // 全局一次只有一个正在执行的effect(vue2中的watcher)
        activeEffect = this
        this._fn()
    }
}

const targetMap = new Map()
let activeEffect

export const trigger = function(target, key){
    // 取出该key的依赖
    const depMap = targetMap.get(target)
  
    const dep = depMap.get(key)
    // 执行依赖
    dep.forEach((_effect) => {
        _effect.run()
    })
}

//收集依赖
export const track  = function(target, key){
    // 取出该key的依赖
    let depMap = targetMap.get(target)
    if(!depMap) {
        depMap = new Map()
        targetMap.set(target, depMap)
    }
    let dep = depMap.get(key)
    if(!dep) {
        dep = new Set()
        depMap.set(key, dep)
    }
    dep.add(activeEffect)
}

export const effect = function(fn){
    const _effect = new ReactiveEffect(fn)
    _effect.run()
}