import { createVnode } from './vnode'

export const createAppApi = (render) => {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVnode(rootComponent)
                return render(vnode, rootContainer)
            }
        }
    }
}
