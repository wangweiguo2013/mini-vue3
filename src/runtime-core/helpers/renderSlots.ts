import { createVnode } from '../vnode'

export const renderSlots = (slots, slotKey = 'default', props = {}) => {
    const slot = slots[slotKey]

    if (typeof slot === 'function') {
        return createVnode('div', {}, slot(props))
    }
}
