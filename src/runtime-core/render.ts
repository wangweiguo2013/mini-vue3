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
                const nextPos = e2 + 1
                const anchor = nextPos < l2 ? c2[nextPos].el : null
                console.log('anchor', anchor)
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        } else if (i > e2) {
            // 新的比旧的少
            while (i <= e1) {
                hostRemove(c1[i].el)
                i++
            }
        } else {
            // 中间对比
            // 新旧节点的初始值
            let s1 = i
            let s2 = i

            const toBePatched = e2 - s2 + 1 // 需要处理的节点数量，因为是用index值求数量，所以要+1
            let patched = 0
            const keyToNewIndexMap = new Map()
            const newIndexToOldIndexMap = new Array(toBePatched) // 固定长度数组有更好的性能
            let moved = false
            let maxNewIndexSoFar = 0
            // 初始化数组
            for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i]
                // 储存节点对应的新索引
                keyToNewIndexMap.set(nextChild.key, i)
            }

            for (let i = s1; i <= e1; i++) {
                const preChild = c1[i]
                // 如果已更新的数量大于更新完的数量，直接把剩余的删除
                if (patched >= toBePatched) {
                    hostRemove(preChild.el)
                    continue
                }

                let newIndex
                if (preChild.key != null) {
                    newIndex = keyToNewIndexMap.get(preChild.key)
                } else {
                    for (let j = s2; j < e2; j++) {
                        if (isSameVnodeType(preChild, c2[j])) {
                            newIndex = j
                            break
                        }
                    }
                    if (newIndex === undefined) {
                        hostRemove(preChild.el)
                    } else {
                        if (newIndex >= maxNewIndexSoFar) {
                            maxNewIndexSoFar = newIndex
                        } else {
                            moved = true
                        }

                        newIndexToOldIndexMap[newIndex - s2] = i + 1 //因为0是初始值，这里这里加1防止出现等于0 的情况
                        patch(preChild, c2[newIndex], container, parentComponent, null)
                        patched++
                    }
                }
                const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
                let j = increasingNewIndexSequence.length - 1

                // 从右边开始循环
                // 如果从左边开始，则右边元素可能还会移动，会导致左边元素移动的锚点不可靠
                for (let i = toBePatched - 1; i >= 0; i--) {
                    const nextIndex = i + s2
                    const nextChild = c2[nextIndex]
                    const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

                    if (newIndexToOldIndexMap[i] === 0) {
                        //不需要移动的
                        patch(null, nextChild, container, parentComponent, anchor)
                    } else if (moved) {
                        if (j < 0 || i !== increasingNewIndexSequence[j]) {
                            hostInsert(nextChild.el, container, anchor)
                        } else {
                            j--
                        }
                    }
                }
            }
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

function getSequence(arr) {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
        const arrI = arr[i]
        if (arrI !== 0) {
            j = result[result.length - 1]
            if (arr[j] < arrI) {
                p[i] = j
                result.push(i)
                continue
            }
            u = 0
            v = result.length - 1
            while (u < v) {
                c = (u + v) >> 1
                if (arr[result[c]] < arrI) {
                    u = c + 1
                } else {
                    v = c
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1]
                }
                result[u] = i
            }
        }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
        result[u] = v
        v = p[v]
    }
    return result
}
