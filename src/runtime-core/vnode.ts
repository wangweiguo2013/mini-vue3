import { shallowReadonly } from '../reactivity/reactive'
import { ShapeFlags } from '../shared/shapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export const createVnode = (type, props?, children?) => {
    const vnode = {
        type,
        props: shallowReadonly(props),
        children,
        key: props && props.key,
        component: null, // instance实例
        el: null,
        shapeFlag: getShapeFlag(type)
    }

    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILD
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT && typeof children === 'object') {
        vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }

    return vnode
}

export const createTextVNode = (text: string) => {
    return createVnode(Text, {}, text)
}

function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
