import { getCurrentInstance } from './component'

export const provide = (key, value) => {
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        let { provides } = currentInstance

        //初始化provide
        //使用原型链，向上查找父provide的值
        const parentProvides = currentInstance.parent?.provides
        // 如果跟父组件一个provides，说明当前组件里没有执行过provide方法，在这里初始化一下  见createComponentInstance方法
        if (provides === parentProvides) {
            // 这两个provides都是对父provides的引用，必须都重新赋值
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value
    }
}

export const inject = (key, defaultValue?) => {
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides

        if (key in parentProvides) {
            return parentProvides[key]
        } else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue()
            }
            return defaultValue
        }
    }
}
