import { proxyRefs } from '../reactivity'
import { shallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'

export const createComponentInstance = (vnode, parent) => {
    const component = {
        vnode,
        type: vnode.type,
        proxy: {},
        emit: () => {},
        slots: {},
        parent,
        next: null, // 下一个要更新的vnode
        isMounted: false,
        subTree: {},
        provides: parent ? parent.provides : {},
        setupState: {}
    }
    console.log('createComponentInstance', component)

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
    //  ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

    const { setup } = component
    if (setup) {
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit })
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }
}
// setup可以返回一个state对象，也可以是一个render函数
function handleSetupResult(instance, setupResult: any) {
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult)
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
