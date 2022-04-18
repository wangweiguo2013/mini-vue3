import { render } from './render'

export const createApp = (rootContainer) => {
    return {
        mount(rootContainer) {
            const vnode = createVnode(rootComponent)
            render(vnode, rootContainer)
        }
    }
}
