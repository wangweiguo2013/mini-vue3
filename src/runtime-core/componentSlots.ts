import { ShapeFlags } from '../shared/shapeFlags'

export function initSlots(instance, children) {
    const { vnode } = instance
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeSlotObject(children, instance.slots)
    }
}

const normalizeSlotObject = (children, slots) => {
    for (const key in children) {
        const val = children[key]
        // renderSlots说的时候是函数调用，所以这里需要变成函数
        slots[key] = (props) => normalizeSlotsValues(val(props))
    }
}
const normalizeSlotsValues = (val) => {
    return Array.isArray(val) ? val : [val]
}
