import { getCurrentInstance, h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js.js'

export const App = {
    setup() {
        console.log('app', getCurrentInstance())
        return {}
    },
    render() {
        return h('div', {}, [h('p', {}, 'app'), h(Foo, {}, {})])
    }
}
