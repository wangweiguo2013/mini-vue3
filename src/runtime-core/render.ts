import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'

export const render = (vnode, container) => {
    patch(vnode, container)
}

export const patch = (vnode, container) => {
    console.log(vnode.type)
    if (typeof vnode.type === 'string') {
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container)
    }
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
    const el = document.createElement(vnode.type)
    const { props, children } = vnode
    for (const key in props) {
        const value = props[key]
        el.setAttribute(key, value)
    }
    if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        children.forEach((v) => {
            patch(v, el)
        })
    }
    container.append(el)
}
