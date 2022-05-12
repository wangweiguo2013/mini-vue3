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
                'button',
                {
                    onClick() {
                        this.msg = 'hello'
                    }
                },
                '+ +'
            ),
            h(
                'p',
                {
                    style: 'color: red',
                    onClick() {
                        console.log('click')
                    }
                },
                'hi' + this.msg
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
            h(Foo, { count: 1 })
        ])
    }
}
