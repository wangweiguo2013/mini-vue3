import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { ShapeFlags } from '../shared/shapeFlags'
import { Fragment, Text } from './vnode'
import { createAppApi } from './createApp'

export const createRenderer = (options) => {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert
    } = options
    const render = (vnode, container) => {
        patch(vnode, container, null)
    }

    const patch = (vnode, container, parentComponent) => {
        const { shapeFlag, type } = vnode
        switch (type) {
            case Text:
                processText(vnode, container)
                break
            case Fragment:
                // 只渲染children，不使用div等元素包裹
                processFragment(vnode, container, parentComponent)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(vnode, container, parentComponent)
                }
                break
        }
    }
    function processText(vnode, container) {
        const { children } = vnode
        const textNode = (vnode.el = document.createTextNode(children))
        container.append(textNode)
    }
    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent)
    }

    function processComponent(vnode: any, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }

    function mountComponent(vnode: any, container, parentComponent) {
        const instance = createComponentInstance(vnode, parentComponent)
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
        patch(subTree, container, instance)
        vnode.el = subTree.el
    }

    function processElement(initialVNode: any, container: any, parentComponent) {
        mountElement(initialVNode, container, parentComponent)
    }

    function mountElement(initialVNode, container, parentComponent) {
        // 这里的vnode其实是element的vnode， 而不是组件的vnode
        // 因此不能在这里给el赋值
        const el = (initialVNode.el = hostCreateElement(initialVNode.type))
        const { props, children, shapeFlag } = initialVNode

        for (const key in props) {
            const value = props[key]
            hostPatchProp(el, key, value)
        }

        if (shapeFlag & ShapeFlags.TEXT_CHILD) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(initialVNode, el, parentComponent)
        }
        hostInsert(el, container)
    }

    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(v, container, parentComponent)
        })
    }

    return {
        createApp: createAppApi(render)
    }
}
