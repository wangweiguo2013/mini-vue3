import { EMPTY_OBJ, isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { ShapeFlags } from '../shared/shapeFlags'
import { Fragment, Text } from './vnode'
import { createAppApi } from './createApp'
import { effect } from '../reactivity/effect'

export const createRenderer = (options) => {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        setElementText: hostSetElementText
    } = options
    const render = (vnode, container) => {
        patch(null, vnode, container, null)
    }
    /**
     *
     * @param n1 旧的vnode节点
     * @param n2 新的vnode节点
     * @param container 容器
     * @param parentComponent 父组件
     */
    const patch = (n1, n2, container, parentComponent) => {
        console.log('patch')
        const { shapeFlag, type } = n2
        switch (type) {
            case Text:
                processText(n1, n2, container)
                break
            case Fragment:
                // 只渲染children，不使用div等元素包裹
                processFragment(n1, n2, container, parentComponent)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent)
                }
                break
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children))
        container.append(textNode)
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2.children, container, parentComponent)
    }

    function processComponent(n1, n2: any, container, parentComponent) {
        mountComponent(n2, container, parentComponent)
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
        effect(() => {
            if (!instance.isMounted) {
                console.log('before mount')
                const { proxy } = instance
                // 组件render返回的vnode
                const subTree = (instance.subTree = instance.render.call(proxy))
                patch(null, subTree, container, instance)
                vnode.el = subTree.el
                instance.isMounted = true
            } else {
                console.log('update')
                const { proxy } = instance
                // 组件render返回的vnode
                const subTree = instance.render.call(proxy)
                const preSubTree = instance.subTree
                console.log('subtree', subTree)
                console.log('presubtree', preSubTree)
                patch(preSubTree, subTree, container, instance)
                // 更新subTree
                instance.subTree = subTree
            }
        })
    }

    function processElement(n1, n2: any, container: any, parentComponent) {
        console.log('process element')
        if (!n1) {
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container, parentComponent)
        }
    }

    function patchElement(n1, n2, container, parentComponent) {
        console.log('patch element')
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        // 把n1的el挂载到新的vnode上
        const el = (n2.el = n1.el)
        patchChildren(n1, n2, el, parentComponent)
        patchProps(el, oldProps, newProps)
    }
    function patchChildren(n1, n2, container, parentComponent) {
        const { shapeFlag: preShapeFlag } = n1
        const { shapeFlag } = n2
        const c1 = n1.children
        const c2 = n2.children
        if (preShapeFlag & ShapeFlags.TEXT_CHILD) {
            if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                hostSetElementText(container, '')
                mountChildren(c2, container, parentComponent)
            } else if (shapeFlag & ShapeFlags.TEXT_CHILD) {
                if (c2 !== c1) {
                    hostSetElementText(container, c2)
                }
            }
        } else if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            hostSetElementText(container, c2)
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps === newProps) return
        // 遍历新属性，变化时执行更新
        for (const key in newProps) {
            const preVal = oldProps[key]
            const nextVal = newProps[key]
            if (preVal !== nextVal) {
                hostPatchProp(el, key, preVal, nextVal)
            }
        }
        // 更新被删除的属性
        if (oldProps !== EMPTY_OBJ) {
            for (const key in oldProps) {
                const preVal = oldProps[key]
                const nextVal = newProps[key]
                // 当属性被删除时，交给hostPatchProp删除改属性
                if (nextVal === null || nextVal === undefined) {
                    hostPatchProp(el, key, preVal, nextVal)
                }
            }
        }
    }
    function mountElement(initialVNode, container, parentComponent) {
        // 这里的vnode其实是element的vnode， 而不是组件的vnode
        // 因此不能在这里给el赋值
        const el = (initialVNode.el = hostCreateElement(initialVNode.type))
        const { props, children, shapeFlag } = initialVNode

        for (const key in props) {
            const value = props[key]
            hostPatchProp(el, key, null, value)
        }

        if (shapeFlag & ShapeFlags.TEXT_CHILD) {
            el.textContent = children
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(initialVNode.children, el, parentComponent)
        }
        hostInsert(el, container)
    }

    function mountChildren(children, container, parentComponent) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent)
        })
    }

    return {
        createApp: createAppApi(render)
    }
}
