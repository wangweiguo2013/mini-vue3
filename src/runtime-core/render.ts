import { EMPTY_OBJ, isObject, isSameVnodeType } from '../shared/index'
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
        setElementText: hostSetElementText,
        remove: hostRemove
    } = options
    const render = (vnode, container) => {
        patch(null, vnode, container, null, null)
    }
    /**
     *
     * @param n1 旧的vnode节点
     * @param n2 新的vnode节点
     * @param container 容器
     * @param parentComponent 父组件
     */
    const patch = (n1, n2, container, parentComponent, anchor) => {
        console.log('patch')
        const { shapeFlag, type } = n2
        switch (type) {
            case Text:
                processText(n1, n2, container)
                break
            case Fragment:
                // 只渲染children，不使用div等元素包裹
                processFragment(n1, n2, container, parentComponent, anchor)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent, anchor)
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
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor)
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
                patch(null, subTree, container, instance, null)
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
                patch(preSubTree, subTree, container, instance, null)
                // 更新subTree
                instance.subTree = subTree
            }
        })
    }

    function processElement(n1, n2: any, container: any, parentComponent, anchor) {
        console.log('process element')
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }

    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('patch element')
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        // 把n1的el挂载到新的vnode上
        const el = (n2.el = n1.el)
        patchChildren(n1, n2, el, parentComponent, anchor)
        patchProps(el, oldProps, newProps)
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const { shapeFlag: preShapeFlag } = n1
        const { shapeFlag } = n2
        const c1 = n1.children
        const c2 = n2.children
        // element的children可能是array 和 text两种
        // 如果现在是text，则直接设置文本内容
        if (shapeFlag & ShapeFlags.TEXT_CHILD) {
            if (preShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1)
            }
            if (c2 !== c1) {
                console.log('host set element text', c2)
                hostSetElementText(container, c2)
            }
        } else {
            if (preShapeFlag & ShapeFlags.TEXT_CHILD) {
                hostSetElementText(container, '')
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                // array diff array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        let i = 0
        let e1 = c1.length - 1
        let e2 = c2.length - 1
        const l2 = c2.length
        console.log('patch keyed children')
        //左指针i开始从左侧对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            if (isSameVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }
            i++
        }
        //从右指针开始对比
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSameVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }
            e1--
            e2--
        }
        // 新的比旧的多
        if (i > e1) {
            if (i <= e2) {
                const anchor = c2[e2 + 1].el
                console.log('anchor', anchor)
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++
            }
            // 新的比旧的少
        } else {
        }
    }

    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el
            hostRemove(el)
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
    function mountElement(initialVNode, container, parentComponent, anchor) {
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
            mountChildren(initialVNode.children, el, parentComponent, anchor)
        }
        hostInsert(el, container, anchor)
    }

    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent, anchor)
        })
    }

    return {
        createApp: createAppApi(render)
    }
}
