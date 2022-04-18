export const createComponentInstance = (vnode) => {
    const component = {
        vnode,
        type: vnode.type
    }
    return component
}

export const setupComponent = (instance) => {
    //
    //initProps()
    //initSlots()
    setupStatefulComponent(instance)
}
function setupStatefulComponent(instance: any) {
    const component = instance.type
    const { setup } = component
    if (setup) {
        const setupResult = setup()
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
    if (!component.render) {
        component.render = instance.render
    }
}
