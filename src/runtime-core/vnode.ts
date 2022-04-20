import { shallowReadonly } from '../reactivity/reactive'
import { ShapeFlags } from '../shared/shapeFlags'

export const createVnode = (type, props?, children?) => {
    const vnode = {
        type,
        props: shallowReadonly(props),
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    }

    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILD
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    return vnode
}

function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
