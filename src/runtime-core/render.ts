import { createComponentInstance, setupComponent } from './component'

export const render = (params) => {}

export const patch = (params) => {}

function processComponent(params: any) {}

function mountComponent(vnode: any) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
}
