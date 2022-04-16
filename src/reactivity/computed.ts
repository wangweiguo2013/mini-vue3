import { ReactiveEffect } from './effect'

class ComputedRefImplement {
    private _effect: any
    private _value: any
    public dirty = true // 初始化或依赖更新后，是否未执行过
    constructor(getter) {
        this._effect = new ReactiveEffect(getter, () => {
            if (!this.dirty) this.dirty = true
        })
    }
    get value() {
        if (this.dirty) {
            this._value = this._effect.run()
            this.dirty = false
        }
        return this._value
    }
}

export const computed = (getter) => {
    return new ComputedRefImplement(getter)
}
