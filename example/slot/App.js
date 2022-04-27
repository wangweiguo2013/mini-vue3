import { h, renderSlots } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js.js'

export const App = {
    setup() {
        return {}
    },
    render() {
        const app = h('div', {}, 'app')
        const foo = h(Foo, {}, [h('p', {}, '123'), h('p', {}, '1234')])
        return h('div', {}, [app, foo])
    }
}
