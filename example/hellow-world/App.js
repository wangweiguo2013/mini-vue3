import { h } from '../../lib/mini-vue.esm.js'

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
            )
        ])
    }
}
