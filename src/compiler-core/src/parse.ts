import { NodeTypes } from './ast'

export const baseParse = (content: string) => {
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}
function createParserContext(content: string) {
    return {
        source: content
    }
}

function createRoot(children) {
    return {
        children
    }
}

function parseChildren(context): any {
    const nodes: any[] = []

    let node
    if (context.source.startsWith('{{')) {
        node = parseInterpolation(context)
    }

    nodes.push(node)

    return nodes
}
function parseInterpolation(context) {
    const openDelimiter = '{{'
    const closeDelimiter = '}}'

    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

    advancedBy(context, openDelimiter.length)

    const rawContentLength = closeIndex - openDelimiter.length

    const rawContent = context.source.slice(0, rawContentLength)
    const content = rawContent.trim()

    advancedBy(context, rawContentLength + closeDelimiter.length)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

function advancedBy(context, length) {
    context.source = context.source.slice(length)
}
