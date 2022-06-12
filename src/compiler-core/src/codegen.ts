export const codegen = (root) => {
    const context = createCodeGenContext()
    const { push } = context

    const codegenNode = root.codegenNode
    const signature = ['ctx', '_cache']

    const functionName = 'render'
    push(` function ${functionName}(${signature.join(', ')}){`)

    //  render函数参数
    genNode(codegenNode, context)
    push('}')
    return { code: context.code }
}

function genNode(codegenNode, context) {
    const { push } = context
    push(`return '${codegenNode.content}'`)
}

function createCodeGenContext() {
    const context = {
        code: '',
        push(source) {
            context.code += source
        }
    }
    return context
}
