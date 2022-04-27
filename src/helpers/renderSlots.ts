import { createVnode } from '../runtime-core/vnode'

export const renderSlots = (slots, slotKey = 'default') => {
    const slot = slots[slotKey]

    if (slot) {
        return createVnode('div', {}, slots[slotKey])
    }
}
