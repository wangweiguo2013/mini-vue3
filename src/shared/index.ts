export const extend = Object.assign
export const EMPTY_OBJ = {}

export const isObject = (raw) => {
    return raw !== undefined && raw !== null && typeof raw === 'object'
}

export const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue)
}

export const capitalize = (str: string) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

export const camelize = (str: string) => {
    return str.replace(/-\w?/g, (_, c: string) => {
        return _.slice(1).toUpperCase()
    })
}

export const isSameVnodeType = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key
}
