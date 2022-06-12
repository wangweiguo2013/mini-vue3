/**
 * 通过传入plugin的方式，在外部控制需要操作的函数
 * 降低程序耦合
 * 测试的时候也方便按需测试
 */

export const transform = (root, options = {}) => {
    const context = createTransformContext(root, options)
    traverseNode(root, context)

    createCodegenNode(root)
    return root
}

function createCodegenNode(root: any) {
    root.codegenNode = root.children[0]
}

function traverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms
    nodeTransforms.forEach((transform) => {
        transform(node)
    })

    traverseChildren(node, context)
}

function traverseChildren(node, context) {
    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i]
            console.log('node ----', node)
            traverseNode(child, context)
        }
    }
}

function createTransformContext(root: any, options) {
    return {
        root,
        nodeTransforms: options.nodeTransforms || []
    }
}
