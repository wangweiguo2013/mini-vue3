import { createTextVNode, h } from '../../lib/mini-vue.esm.js'
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
                default: () => h('p', {}, 'default'),
                header: () => h('p', {}, 'header'),
                footer: ({ age }) => [
                    h('p', {}, 'footer' + age), // 获取组件内部的age
                    createTextVNode('你好')
                ]
            }
        )
        return h('div', {}, [app, foo])
    }
}
