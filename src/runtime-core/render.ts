import { createComponentInstance, setupComponent } from './component'

export const render = (vnode, container) => {}

export const patch = (vnode, container) => {
    processElement(vnode, container)
    processComponent(vnode, container)
}

function processComponent(vnode: any, container) {
    mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}
function setupRenderEffect(instance, container: any) {
    const subTree = instance.render()
    patch(subTree, container)
}
function processElement(vnode: any, container: any) {
    throw new Error('Function not implemented.')
}
