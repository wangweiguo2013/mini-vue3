import { h, ref } from '../../lib/mini-vue.esm.js'

export const App = {
    name: 'app',
    setup() {
        const count = ref(0)
        const props = ref({
            foo: 'foo',
            bar: 'bar'
        })

        const onChangeProps1 = () => {
            props.value.foo = 'new-foo'
        }
        const onChangeProps2 = () => {
            props.value.foo = null
        }
        const onChangeProps3 = () => {
            props.value = {
                foo: 'foo'
            }
        }

        const addCount = () => {
            count.value++
        }
        return {
            count,
            addCount,
            props,
            onChangeProps1,
            onChangeProps2,
            onChangeProps3
        }
    },
    render() {
        window.vm = this
        console.log(this.props)
        return h(
            'div',
            {
                id: 'root',
                ...this.props
            },
            [
                h('p', {}, 'count is:' + this.count),
                h(
                    'button',
                    {
                        onClick: this.onChangeProps1
                    },
                    'set foo new value'
                ),
                h(
                    'button',
                    {
                        onClick: this.onChangeProps2
                    },
                    'set foo null'
                ),
                h(
                    'button',
                    {
                        onClick: this.onChangeProps3
                    },
                    'delete bar'
                )
            ]
        )
    }
}
