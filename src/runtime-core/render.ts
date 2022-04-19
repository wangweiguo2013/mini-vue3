import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'

export const render = (vnode, container) => {
    patch(vnode, container)
}

export const patch = (vnode, container) => {
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
    const { setupState } = instance
    instance.proxy = new Proxy(
        {},
        {
            get(target, key) {
                if (key in setupState) {
                    return setupState[key]
                }
                if (key === '$el') {
                    return instance.vnode.el
                }
                return target[key]
            }
        }
    )
    setupRenderEffect(instance, vnode, container)
}

function setupRenderEffect(instance, vnode, container: any) {
    const { proxy } = instance
    // 组件render返回的vnode
    const subTree = instance.render.call(proxy)
    patch(subTree, container)
    vnode.el = subTree.el
}

function processElement(initialVNode: any, container: any) {
    mountElement(initialVNode, container)
}

function mountElement(initialVNode, container) {
    // 这里的vnode其实是element的vnode， 而不是组件的vnode
    // 因此不能在这里给el赋值
    const el = document.createElement(initialVNode.type)
    const { props, children } = initialVNode
    for (const key in props) {
        const value = props[key]
        el.setAttribute(key, value)
    }
    if (typeof children === 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(initialVNode, el)
    }

    initialVNode.el = el

    container.append(el)
}

function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container)
    })
}
