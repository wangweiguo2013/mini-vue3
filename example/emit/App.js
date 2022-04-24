import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js.js'

export const App = {
    setup() {
        return {
            msg: 'msg'
        }
    },
    render() {
        window.vm = this
        return h('div', { class: ['root', 'con'], id: 'root' }, [
            h(
                'p',
                {
                    style: 'color: red',
                    onClick() {
                        console.log('click')
                    }
                },
                'hi'
            ),
            h(
                'p',
                {
                    style: 'color:blue',
                    onMousedown() {
                        console.log('mousedown')
                    }
                },
                'this is from ' + this.msg
            ),
            h(Foo, {
                count: 1,
                onAdd(a, b) {
                    console.log('handle on add', a, b)
                },
                onAddFoo(a, b) {
                    console.log('handle on add foo', a, b)
                }
            })
        ])
    }
}
