import { emit } from './componentEmit'
import { initSlots } from './componentSlots'

export const createComponentInstance = (vnode) => {
    const component = {
        vnode,
        type: vnode.type,
        proxy: {},
        emit: () => {},
        slots: {},
        setupState: {}
    }
    component.emit = emit.bind(null, component) as any

    return component
}

export const setupComponent = (instance) => {
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children)
    setupStatefulComponent(instance)
}
function setupStatefulComponent(instance: any) {
    const component = instance.type
    const { setup } = component
    if (setup) {
        setCurrentInstance(instance)
        const setupResult = setup(instance.props, { emit: instance.emit })
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }
}
// setup可以返回一个state对象，也可以是一个render函数
function handleSetupResult(instance, setupResult: any) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
    const component = instance.type
    if (component.render) {
        instance.render = component.render
    }
}
function initProps(instance, props) {
    instance.props = props
}
let currentInstance = null

const setCurrentInstance = (instance) => {
    currentInstance = instance
}
export const getCurrentInstance = () => {
    return currentInstance
}
