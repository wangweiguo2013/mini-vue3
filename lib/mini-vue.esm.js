const extend = Object.assign;
const isObject = (raw) => {
    return raw !== undefined && raw !== null && typeof raw === 'object';
};
const capitalize = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};
const camelize = (str) => {
    return str.replace(/-\w?/g, (_, c) => {
        return _.slice(1).toUpperCase();
    });
};

let activeEffect;
const targetMap = new Map();
const trigger = function (target, key) {
    // 取出该key的依赖
    const depMap = targetMap.get(target);
    const dep = depMap.get(key);
    // 执行依赖
    triggerEffect(dep);
};
const triggerEffect = function (dep) {
    // 优化
    if (!dep.has(activeEffect))
        return;
    dep.forEach((_effect) => {
        if (_effect.scheduler) {
            _effect.scheduler();
        }
        else {
            _effect.run();
        }
    });
};

const createGetter = function (isReadOnly = false, isShallow = false) {
    return function (target, key) {
        const res = Reflect.get(target, key);
        if (isObject(res) && !isShallow) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        if (key === "__v_is_reactive" /* IS_REACTIVE */) {
            return !isReadOnly;
        }
        else if (key === "__v_is_readonly" /* IS_READONLY */) {
            return isReadOnly;
        }
        return res;
    };
};
const createSetter = function () {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
};
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn(`read only object cannot be set, accessing key is ${String(key)}, value is ${value}`, target);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const reactive = function (raw) {
    return new Proxy(raw, mutableHandlers);
};
const readonly = function (raw) {
    return createActiveObject(raw, readonlyHandlers);
};
const shallowReadonly = function (raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
};
const createActiveObject = function (raw, handler) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} is not object`);
        return;
    }
    return new Proxy(raw, handler);
};

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
const createVnode = (type, props, children) => {
    const vnode = {
        type,
        props: shallowReadonly(props),
        children,
        el: null,
        shapeFlag: getShapeFlag(type)
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= 8 /* TEXT_CHILD */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 16 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */ && typeof children === 'object') {
        vnode.shapeFlag |= 32 /* SLOT_CHILDREN */;
    }
    return vnode;
};
const createTextVNode = (text) => {
    return createVnode(Text, {}, text);
};
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 4 /* STATEFUL_COMPONENT */;
}

const h = (type, props, children) => {
    return createVnode(type, props, children);
};

const renderSlots = (slots, slotKey = 'default', props = {}) => {
    const slot = slots[slotKey];
    if (typeof slot === 'function') {
        return createVnode(Fragment, {}, slot(props));
    }
};

const emit = (instance, eventName, ...args) => {
    const { props } = instance;
    const eventKey = 'on' + capitalize(eventName);
    const handler = props[camelize(eventKey)];
    handler && handler(...args);
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 32 /* SLOT_CHILDREN */) {
        normalizeSlotObject(children, instance.slots);
    }
}
const normalizeSlotObject = (children, slots) => {
    for (const key in children) {
        const val = children[key];
        // renderSlots说的时候是函数调用，所以这里需要变成函数
        slots[key] = (props) => normalizeSlotsValues(val(props));
    }
};
const normalizeSlotsValues = (val) => {
    return Array.isArray(val) ? val : [val];
};

const createComponentInstance = (vnode, parent) => {
    const component = {
        vnode,
        type: vnode.type,
        proxy: {},
        emit: () => { },
        slots: {},
        parent,
        provides: parent ? parent.provides : {},
        setupState: {}
    };
    console.log('createComponentInstance', component);
    component.emit = emit.bind(null, component);
    return component;
};
const setupComponent = (instance) => {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
};
function setupStatefulComponent(instance) {
    const component = instance.type;
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(instance.props, { emit: instance.emit });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
// setup可以返回一个state对象，也可以是一个render函数
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}
function initProps(instance, props) {
    instance.props = props;
}
let currentInstance = null;
const setCurrentInstance = (instance) => {
    currentInstance = instance;
};
const getCurrentInstance = () => {
    return currentInstance;
};

const provide = (key, value) => {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        //初始化provide
        //使用原型链，向上查找父provide的值
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // 如果跟父组件一个provides，说明当前组件里没有执行过provide方法，在这里初始化一下  见createComponentInstance方法
        if (provides === parentProvides) {
            // 这两个provides都是对父provides的引用，必须都重新赋值
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
};
const inject = (key, defaultValue) => {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        const hasOwn = (target, key) => {
            return Object.prototype.hasOwnProperty.call(target, key);
        };
        if (hasOwn(setupState, key))
            return setupState[key];
        if (hasOwn(props, key))
            return props[key];
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

const createAppApi = (render) => {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const vnode = createVnode(rootComponent);
                return render(vnode, rootContainer);
            }
        };
    };
};

const createRenderer = (options) => {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    const render = (vnode, container) => {
        patch(vnode, container, null);
    };
    const patch = (vnode, container, parentComponent) => {
        const { shapeFlag, type } = vnode;
        switch (type) {
            case Text:
                processText(vnode, container);
                break;
            case Fragment:
                // 只渲染children，不使用div等元素包裹
                processFragment(vnode, container, parentComponent);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
    };
    function processText(vnode, container) {
        const { children } = vnode;
        const textNode = (vnode.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent);
    }
    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }
    function mountComponent(vnode, container, parentComponent) {
        const instance = createComponentInstance(vnode, parentComponent);
        setupComponent(instance);
        //  ctx
        instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
        setupRenderEffect(instance, vnode, container);
    }
    function setupRenderEffect(instance, vnode, container) {
        const { proxy } = instance;
        // 组件render返回的vnode
        const subTree = instance.render.call(proxy);
        patch(subTree, container, instance);
        vnode.el = subTree.el;
    }
    function processElement(initialVNode, container, parentComponent) {
        mountElement(initialVNode, container, parentComponent);
    }
    function mountElement(initialVNode, container, parentComponent) {
        // 这里的vnode其实是element的vnode， 而不是组件的vnode
        // 因此不能在这里给el赋值
        const el = (initialVNode.el = hostCreateElement(initialVNode.type));
        const { props, children, shapeFlag } = initialVNode;
        for (const key in props) {
            const value = props[key];
            hostPatchProp(el, key, value);
        }
        if (shapeFlag & 8 /* TEXT_CHILD */) {
            el.textContent = children;
        }
        else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
            mountChildren(initialVNode, el, parentComponent);
        }
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            patch(v, container, parentComponent);
        });
    }
    return {
        createApp: createAppApi(render)
    };
};

const createElement = (type) => {
    return document.createElement(type);
};
const isEvent = (key) => /^on[A-Z]/.test(key);
const patchProp = (el, key, value) => {
    if (isEvent(key)) {
        const eventName = key.slice(2).toLocaleLowerCase();
        el.addEventListener(eventName, value);
    }
    else {
        el.setAttribute(key, value);
    }
};
const insert = (el, parent) => {
    parent.append(el);
};
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});
const createApp = (...args) => {
    return renderer.createApp(...args);
};

export { createApp, createElement, createRenderer, createTextVNode, getCurrentInstance, h, inject, insert, patchProp, provide, renderSlots };
