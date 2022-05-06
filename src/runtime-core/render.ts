import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { ShapeFlags } from '../shared/shapeFlags'
import { Fragment, Text } from './vnode'

export const render = (vnode, container) => {
    patch(vnode, container)
}

export const patch = (vnode, container) => {
    const { shapeFlag, type } = vnode
    switch (type) {
        case Text:
            processText(vnode, container)
            break
        case Fragment:
            // 只渲染children，不使用div等元素包裹
            processFragment(vnode, container)
            break
        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container)
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container)
            }
            break
    }
}
function processText(vnode, container) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}
function processFragment(vnode, container) {
    mountChildren(vnode, container)
}

function processComponent(vnode: any, container) {
    mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    const { setupState } = instance

    //  ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

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
    const el = (initialVNode.el = document.createElement(initialVNode.type))
    const { props, children, shapeFlag } = initialVNode

    const isEvent = (key: string) => /^on[A-Z]/.test(key)

    for (const key in props) {
        const value = props[key]
        if (isEvent(key)) {
            const eventName = key.slice(2).toLocaleLowerCase()
            el.addEventListener(eventName, value)
        } else {
            el.setAttribute(key, value)
        }
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILD) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(initialVNode, el)
    }

    container.append(el)
}

function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container)
    })
}
