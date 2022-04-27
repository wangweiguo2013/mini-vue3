import { createVnode } from '../runtime-core/vnode'

export const renderSlots = (slots) => {
    return createVnode('div', {}, slots)
}
