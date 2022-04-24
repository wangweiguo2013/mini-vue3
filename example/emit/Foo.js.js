import { h } from '../../lib/mini-vue.esm.js'

export const Foo = {
    setup(props, { emit }) {
        // props.count
        console.log(props)
        props.count++

        const handleClick = () => {
            emit('add', 1, 2)
            emit('add-foo', 1, 2)
        }
        return {
            handleClick
        }
    },
    render() {
        const { handleClick } = this
        return h(
            'button',
            {
                onClick() {
                    handleClick()
                }
            },
            'add count' + this.count
        )
    }
}
