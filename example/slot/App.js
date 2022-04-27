import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js.js'

export const App = {
    setup() {
        return {}
    },
    render() {
        const app = h('div', {}, 'app')
        const foo = h(
            Foo,
            {},
            {
                default: h('p', {}, 'default'),
                header: h('p', {}, 'header'),
                footer: h('p', {}, 'footer')
            }
        )
        return h('div', {}, [app, foo])
    }
}
