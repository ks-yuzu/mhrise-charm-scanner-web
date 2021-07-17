
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*
     * Dexie.js - a minimalistic wrapper for IndexedDB
     * ===============================================
     *
     * By David Fahlander, david.fahlander@gmail.com
     *
     * Version 3.0.3, Wed Nov 18 2020
     *
     * http://dexie.org
     *
     * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
     */
     
    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };










    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var keys = Object.keys;
    var isArray = Array.isArray;
    var _global = typeof self !== 'undefined' ? self :
        typeof window !== 'undefined' ? window :
            global;
    if (typeof Promise !== 'undefined' && !_global.Promise) {
        _global.Promise = Promise;
    }
    function extend(obj, extension) {
        if (typeof extension !== 'object')
            return obj;
        keys(extension).forEach(function (key) {
            obj[key] = extension[key];
        });
        return obj;
    }
    var getProto = Object.getPrototypeOf;
    var _hasOwn = {}.hasOwnProperty;
    function hasOwn(obj, prop) {
        return _hasOwn.call(obj, prop);
    }
    function props(proto, extension) {
        if (typeof extension === 'function')
            extension = extension(getProto(proto));
        keys(extension).forEach(function (key) {
            setProp(proto, key, extension[key]);
        });
    }
    var defineProperty = Object.defineProperty;
    function setProp(obj, prop, functionOrGetSet, options) {
        defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ?
            { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } :
            { value: functionOrGetSet, configurable: true, writable: true }, options));
    }
    function derive(Child) {
        return {
            from: function (Parent) {
                Child.prototype = Object.create(Parent.prototype);
                setProp(Child.prototype, "constructor", Child);
                return {
                    extend: props.bind(null, Child.prototype)
                };
            }
        };
    }
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    function getPropertyDescriptor(obj, prop) {
        var pd = getOwnPropertyDescriptor(obj, prop);
        var proto;
        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
    }
    var _slice = [].slice;
    function slice(args, start, end) {
        return _slice.call(args, start, end);
    }
    function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
    }
    function assert(b) {
        if (!b)
            throw new Error("Assertion Failed");
    }
    function asap(fn) {
        if (_global.setImmediate)
            setImmediate(fn);
        else
            setTimeout(fn, 0);
    }

    function arrayToObject(array, extractor) {
        return array.reduce(function (result, item, i) {
            var nameAndValue = extractor(item, i);
            if (nameAndValue)
                result[nameAndValue[0]] = nameAndValue[1];
            return result;
        }, {});
    }

    function tryCatch(fn, onerror, args) {
        try {
            fn.apply(null, args);
        }
        catch (ex) {
            onerror && onerror(ex);
        }
    }
    function getByKeyPath(obj, keyPath) {
        if (hasOwn(obj, keyPath))
            return obj[keyPath];
        if (!keyPath)
            return obj;
        if (typeof keyPath !== 'string') {
            var rv = [];
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                var val = getByKeyPath(obj, keyPath[i]);
                rv.push(val);
            }
            return rv;
        }
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var innerObj = obj[keyPath.substr(0, period)];
            return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return undefined;
    }
    function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === undefined)
            return;
        if ('isFrozen' in Object && Object.isFrozen(obj))
            return;
        if (typeof keyPath !== 'string' && 'length' in keyPath) {
            assert(typeof value !== 'string' && 'length' in value);
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                setByKeyPath(obj, keyPath[i], value[i]);
            }
        }
        else {
            var period = keyPath.indexOf('.');
            if (period !== -1) {
                var currentKeyPath = keyPath.substr(0, period);
                var remainingKeyPath = keyPath.substr(period + 1);
                if (remainingKeyPath === "")
                    if (value === undefined) {
                        if (isArray(obj) && !isNaN(parseInt(currentKeyPath)))
                            obj.splice(currentKeyPath, 1);
                        else
                            delete obj[currentKeyPath];
                    }
                    else
                        obj[currentKeyPath] = value;
                else {
                    var innerObj = obj[currentKeyPath];
                    if (!innerObj)
                        innerObj = (obj[currentKeyPath] = {});
                    setByKeyPath(innerObj, remainingKeyPath, value);
                }
            }
            else {
                if (value === undefined) {
                    if (isArray(obj) && !isNaN(parseInt(keyPath)))
                        obj.splice(keyPath, 1);
                    else
                        delete obj[keyPath];
                }
                else
                    obj[keyPath] = value;
            }
        }
    }
    function delByKeyPath(obj, keyPath) {
        if (typeof keyPath === 'string')
            setByKeyPath(obj, keyPath, undefined);
        else if ('length' in keyPath)
            [].map.call(keyPath, function (kp) {
                setByKeyPath(obj, kp, undefined);
            });
    }
    function shallowClone(obj) {
        var rv = {};
        for (var m in obj) {
            if (hasOwn(obj, m))
                rv[m] = obj[m];
        }
        return rv;
    }
    var concat = [].concat;
    function flatten(a) {
        return concat.apply([], a);
    }
    var intrinsicTypeNames = "Boolean,String,Date,RegExp,Blob,File,FileList,ArrayBuffer,DataView,Uint8ClampedArray,ImageData,Map,Set"
        .split(',').concat(flatten([8, 16, 32, 64].map(function (num) { return ["Int", "Uint", "Float"].map(function (t) { return t + num + "Array"; }); }))).filter(function (t) { return _global[t]; });
    var intrinsicTypes = intrinsicTypeNames.map(function (t) { return _global[t]; });
    var intrinsicTypeNameSet = arrayToObject(intrinsicTypeNames, function (x) { return [x, true]; });
    function deepClone(any) {
        if (!any || typeof any !== 'object')
            return any;
        var rv;
        if (isArray(any)) {
            rv = [];
            for (var i = 0, l = any.length; i < l; ++i) {
                rv.push(deepClone(any[i]));
            }
        }
        else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
            rv = any;
        }
        else {
            rv = any.constructor ? Object.create(any.constructor.prototype) : {};
            for (var prop in any) {
                if (hasOwn(any, prop)) {
                    rv[prop] = deepClone(any[prop]);
                }
            }
        }
        return rv;
    }
    var toString = {}.toString;
    function toStringTag(o) {
        return toString.call(o).slice(8, -1);
    }
    var getValueOf = function (val, type) {
        return type === "Array" ? '' + val.map(function (v) { return getValueOf(v, toStringTag(v)); }) :
            type === "ArrayBuffer" ? '' + new Uint8Array(val) :
                type === "Date" ? val.getTime() :
                    ArrayBuffer.isView(val) ? '' + new Uint8Array(val.buffer) :
                        val;
    };
    function getObjectDiff(a, b, rv, prfx) {
        rv = rv || {};
        prfx = prfx || '';
        keys(a).forEach(function (prop) {
            if (!hasOwn(b, prop))
                rv[prfx + prop] = undefined;
            else {
                var ap = a[prop], bp = b[prop];
                if (typeof ap === 'object' && typeof bp === 'object' && ap && bp) {
                    var apTypeName = toStringTag(ap);
                    var bpTypeName = toStringTag(bp);
                    if (apTypeName === bpTypeName) {
                        if (intrinsicTypeNameSet[apTypeName]) {
                            if (getValueOf(ap, apTypeName) !== getValueOf(bp, bpTypeName)) {
                                rv[prfx + prop] = b[prop];
                            }
                        }
                        else {
                            getObjectDiff(ap, bp, rv, prfx + prop + ".");
                        }
                    }
                    else {
                        rv[prfx + prop] = b[prop];
                    }
                }
                else if (ap !== bp)
                    rv[prfx + prop] = b[prop];
            }
        });
        keys(b).forEach(function (prop) {
            if (!hasOwn(a, prop)) {
                rv[prfx + prop] = b[prop];
            }
        });
        return rv;
    }
    var iteratorSymbol = typeof Symbol !== 'undefined' && Symbol.iterator;
    var getIteratorOf = iteratorSymbol ? function (x) {
        var i;
        return x != null && (i = x[iteratorSymbol]) && i.apply(x);
    } : function () { return null; };
    var NO_CHAR_ARRAY = {};
    function getArrayOf(arrayLike) {
        var i, a, x, it;
        if (arguments.length === 1) {
            if (isArray(arrayLike))
                return arrayLike.slice();
            if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string')
                return [arrayLike];
            if ((it = getIteratorOf(arrayLike))) {
                a = [];
                while (x = it.next(), !x.done)
                    a.push(x.value);
                return a;
            }
            if (arrayLike == null)
                return [arrayLike];
            i = arrayLike.length;
            if (typeof i === 'number') {
                a = new Array(i);
                while (i--)
                    a[i] = arrayLike[i];
                return a;
            }
            return [arrayLike];
        }
        i = arguments.length;
        a = new Array(i);
        while (i--)
            a[i] = arguments[i];
        return a;
    }
    var isAsyncFunction = typeof Symbol !== 'undefined'
        ? function (fn) { return fn[Symbol.toStringTag] === 'AsyncFunction'; }
        : function () { return false; };

    var debug = typeof location !== 'undefined' &&
        /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
    function setDebug(value, filter) {
        debug = value;
        libraryFilter = filter;
    }
    var libraryFilter = function () { return true; };
    var NEEDS_THROW_FOR_STACK = !new Error("").stack;
    function getErrorWithStack() {
        if (NEEDS_THROW_FOR_STACK)
            try {
                throw new Error();
            }
            catch (e) {
                return e;
            }
        return new Error();
    }
    function prettyStack(exception, numIgnoredFrames) {
        var stack = exception.stack;
        if (!stack)
            return "";
        numIgnoredFrames = (numIgnoredFrames || 0);
        if (stack.indexOf(exception.name) === 0)
            numIgnoredFrames += (exception.name + exception.message).split('\n').length;
        return stack.split('\n')
            .slice(numIgnoredFrames)
            .filter(libraryFilter)
            .map(function (frame) { return "\n" + frame; })
            .join('');
    }

    var dexieErrorNames = [
        'Modify',
        'Bulk',
        'OpenFailed',
        'VersionChange',
        'Schema',
        'Upgrade',
        'InvalidTable',
        'MissingAPI',
        'NoSuchDatabase',
        'InvalidArgument',
        'SubTransaction',
        'Unsupported',
        'Internal',
        'DatabaseClosed',
        'PrematureCommit',
        'ForeignAwait'
    ];
    var idbDomErrorNames = [
        'Unknown',
        'Constraint',
        'Data',
        'TransactionInactive',
        'ReadOnly',
        'Version',
        'NotFound',
        'InvalidState',
        'InvalidAccess',
        'Abort',
        'Timeout',
        'QuotaExceeded',
        'Syntax',
        'DataClone'
    ];
    var errorList = dexieErrorNames.concat(idbDomErrorNames);
    var defaultTexts = {
        VersionChanged: "Database version changed by other database connection",
        DatabaseClosed: "Database has been closed",
        Abort: "Transaction aborted",
        TransactionInactive: "Transaction has already completed or failed"
    };
    function DexieError(name, msg) {
        this._e = getErrorWithStack();
        this.name = name;
        this.message = msg;
    }
    derive(DexieError).from(Error).extend({
        stack: {
            get: function () {
                return this._stack ||
                    (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
            }
        },
        toString: function () { return this.name + ": " + this.message; }
    });
    function getMultiErrorMessage(msg, failures) {
        return msg + ". Errors: " + Object.keys(failures)
            .map(function (key) { return failures[key].toString(); })
            .filter(function (v, i, s) { return s.indexOf(v) === i; })
            .join('\n');
    }
    function ModifyError(msg, failures, successCount, failedKeys) {
        this._e = getErrorWithStack();
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
        this.message = getMultiErrorMessage(msg, failures);
    }
    derive(ModifyError).from(DexieError);
    function BulkError(msg, failures) {
        this._e = getErrorWithStack();
        this.name = "BulkError";
        this.failures = failures;
        this.message = getMultiErrorMessage(msg, failures);
    }
    derive(BulkError).from(DexieError);
    var errnames = errorList.reduce(function (obj, name) { return (obj[name] = name + "Error", obj); }, {});
    var BaseException = DexieError;
    var exceptions = errorList.reduce(function (obj, name) {
        var fullName = name + "Error";
        function DexieError(msgOrInner, inner) {
            this._e = getErrorWithStack();
            this.name = fullName;
            if (!msgOrInner) {
                this.message = defaultTexts[name] || fullName;
                this.inner = null;
            }
            else if (typeof msgOrInner === 'string') {
                this.message = "" + msgOrInner + (!inner ? '' : '\n ' + inner);
                this.inner = inner || null;
            }
            else if (typeof msgOrInner === 'object') {
                this.message = msgOrInner.name + " " + msgOrInner.message;
                this.inner = msgOrInner;
            }
        }
        derive(DexieError).from(BaseException);
        obj[name] = DexieError;
        return obj;
    }, {});
    exceptions.Syntax = SyntaxError;
    exceptions.Type = TypeError;
    exceptions.Range = RangeError;
    var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
        obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});
    function mapError(domError, message) {
        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
            return domError;
        var rv = new exceptionMap[domError.name](message || domError.message, domError);
        if ("stack" in domError) {
            setProp(rv, "stack", { get: function () {
                    return this.inner.stack;
                } });
        }
        return rv;
    }
    var fullNameExceptions = errorList.reduce(function (obj, name) {
        if (["Syntax", "Type", "Range"].indexOf(name) === -1)
            obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});
    fullNameExceptions.ModifyError = ModifyError;
    fullNameExceptions.DexieError = DexieError;
    fullNameExceptions.BulkError = BulkError;

    function nop() { }
    function mirror(val) { return val; }
    function pureFunctionChain(f1, f2) {
        if (f1 == null || f1 === mirror)
            return f2;
        return function (val) {
            return f2(f1(val));
        };
    }
    function callBoth(on1, on2) {
        return function () {
            on1.apply(this, arguments);
            on2.apply(this, arguments);
        };
    }
    function hookCreatingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res !== undefined)
                arguments[0] = res;
            var onsuccess = this.onsuccess,
            onerror = this.onerror;
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res2 !== undefined ? res2 : res;
        };
    }
    function hookDeletingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            f1.apply(this, arguments);
            var onsuccess = this.onsuccess,
            onerror = this.onerror;
            this.onsuccess = this.onerror = null;
            f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        };
    }
    function hookUpdatingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function (modifications) {
            var res = f1.apply(this, arguments);
            extend(modifications, res);
            var onsuccess = this.onsuccess,
            onerror = this.onerror;
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res === undefined ?
                (res2 === undefined ? undefined : res2) :
                (extend(res, res2));
        };
    }
    function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            if (f2.apply(this, arguments) === false)
                return false;
            return f1.apply(this, arguments);
        };
    }

    function promisableChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res && typeof res.then === 'function') {
                var thiz = this, i = arguments.length, args = new Array(i);
                while (i--)
                    args[i] = arguments[i];
                return res.then(function () {
                    return f2.apply(thiz, args);
                });
            }
            return f2.apply(this, arguments);
        };
    }

    var INTERNAL = {};
    var LONG_STACKS_CLIP_LIMIT = 100;
    var MAX_LONG_STACKS = 20;
    var ZONE_ECHO_LIMIT = 100;
    var _a = typeof Promise === 'undefined' ?
        [] :
        (function () {
            var globalP = Promise.resolve();
            if (typeof crypto === 'undefined' || !crypto.subtle)
                return [globalP, globalP.__proto__, globalP];
            var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
            return [
                nativeP,
                nativeP.__proto__,
                globalP
            ];
        })();
    var resolvedNativePromise = _a[0];
    var nativePromiseProto = _a[1];
    var resolvedGlobalPromise = _a[2];
    var nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
    var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
    var patchGlobalPromise = !!resolvedGlobalPromise;
    var stack_being_generated = false;
    var schedulePhysicalTick = resolvedGlobalPromise ?
        function () { resolvedGlobalPromise.then(physicalTick); }
        :
            _global.setImmediate ?
                setImmediate.bind(null, physicalTick) :
                _global.MutationObserver ?
                    function () {
                        var hiddenDiv = document.createElement("div");
                        (new MutationObserver(function () {
                            physicalTick();
                            hiddenDiv = null;
                        })).observe(hiddenDiv, { attributes: true });
                        hiddenDiv.setAttribute('i', '1');
                    } :
                    function () { setTimeout(physicalTick, 0); };
    var asap$1 = function (callback, args) {
        microtickQueue.push([callback, args]);
        if (needsNewPhysicalTick) {
            schedulePhysicalTick();
            needsNewPhysicalTick = false;
        }
    };
    var isOutsideMicroTick = true;
    var needsNewPhysicalTick = true;
    var unhandledErrors = [];
    var rejectingErrors = [];
    var currentFulfiller = null;
    var rejectionMapper = mirror;
    var globalPSD = {
        id: 'global',
        global: true,
        ref: 0,
        unhandleds: [],
        onunhandled: globalError,
        pgp: false,
        env: {},
        finalize: function () {
            this.unhandleds.forEach(function (uh) {
                try {
                    globalError(uh[0], uh[1]);
                }
                catch (e) { }
            });
        }
    };
    var PSD = globalPSD;
    var microtickQueue = [];
    var numScheduledCalls = 0;
    var tickFinalizers = [];
    function DexiePromise(fn) {
        if (typeof this !== 'object')
            throw new TypeError('Promises must be constructed via new');
        this._listeners = [];
        this.onuncatched = nop;
        this._lib = false;
        var psd = (this._PSD = PSD);
        if (debug) {
            this._stackHolder = getErrorWithStack();
            this._prev = null;
            this._numPrev = 0;
        }
        if (typeof fn !== 'function') {
            if (fn !== INTERNAL)
                throw new TypeError('Not a function');
            this._state = arguments[1];
            this._value = arguments[2];
            if (this._state === false)
                handleRejection(this, this._value);
            return;
        }
        this._state = null;
        this._value = null;
        ++psd.ref;
        executePromiseTask(this, fn);
    }
    var thenProp = {
        get: function () {
            var psd = PSD, microTaskId = totalEchoes;
            function then(onFulfilled, onRejected) {
                var _this = this;
                var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
                var cleanup = possibleAwait && !decrementExpectedAwaits();
                var rv = new DexiePromise(function (resolve, reject) {
                    propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
                });
                debug && linkToPreviousPromise(rv, this);
                return rv;
            }
            then.prototype = INTERNAL;
            return then;
        },
        set: function (value) {
            setProp(this, 'then', value && value.prototype === INTERNAL ?
                thenProp :
                {
                    get: function () {
                        return value;
                    },
                    set: thenProp.set
                });
        }
    };
    props(DexiePromise.prototype, {
        then: thenProp,
        _then: function (onFulfilled, onRejected) {
            propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
        },
        catch: function (onRejected) {
            if (arguments.length === 1)
                return this.then(null, onRejected);
            var type = arguments[0], handler = arguments[1];
            return typeof type === 'function' ? this.then(null, function (err) {
                return err instanceof type ? handler(err) : PromiseReject(err);
            })
                : this.then(null, function (err) {
                    return err && err.name === type ? handler(err) : PromiseReject(err);
                });
        },
        finally: function (onFinally) {
            return this.then(function (value) {
                onFinally();
                return value;
            }, function (err) {
                onFinally();
                return PromiseReject(err);
            });
        },
        stack: {
            get: function () {
                if (this._stack)
                    return this._stack;
                try {
                    stack_being_generated = true;
                    var stacks = getStack(this, [], MAX_LONG_STACKS);
                    var stack = stacks.join("\nFrom previous: ");
                    if (this._state !== null)
                        this._stack = stack;
                    return stack;
                }
                finally {
                    stack_being_generated = false;
                }
            }
        },
        timeout: function (ms, msg) {
            var _this = this;
            return ms < Infinity ?
                new DexiePromise(function (resolve, reject) {
                    var handle = setTimeout(function () { return reject(new exceptions.Timeout(msg)); }, ms);
                    _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
                }) : this;
        }
    });
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
        setProp(DexiePromise.prototype, Symbol.toStringTag, 'Dexie.Promise');
    globalPSD.env = snapShot();
    function Listener(onFulfilled, onRejected, resolve, reject, zone) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
        this.psd = zone;
    }
    props(DexiePromise, {
        all: function () {
            var values = getArrayOf.apply(null, arguments)
                .map(onPossibleParallellAsync);
            return new DexiePromise(function (resolve, reject) {
                if (values.length === 0)
                    resolve([]);
                var remaining = values.length;
                values.forEach(function (a, i) { return DexiePromise.resolve(a).then(function (x) {
                    values[i] = x;
                    if (!--remaining)
                        resolve(values);
                }, reject); });
            });
        },
        resolve: function (value) {
            if (value instanceof DexiePromise)
                return value;
            if (value && typeof value.then === 'function')
                return new DexiePromise(function (resolve, reject) {
                    value.then(resolve, reject);
                });
            var rv = new DexiePromise(INTERNAL, true, value);
            linkToPreviousPromise(rv, currentFulfiller);
            return rv;
        },
        reject: PromiseReject,
        race: function () {
            var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function (resolve, reject) {
                values.map(function (value) { return DexiePromise.resolve(value).then(resolve, reject); });
            });
        },
        PSD: {
            get: function () { return PSD; },
            set: function (value) { return PSD = value; }
        },
        totalEchoes: { get: function () { return totalEchoes; } },
        newPSD: newScope,
        usePSD: usePSD,
        scheduler: {
            get: function () { return asap$1; },
            set: function (value) { asap$1 = value; }
        },
        rejectionMapper: {
            get: function () { return rejectionMapper; },
            set: function (value) { rejectionMapper = value; }
        },
        follow: function (fn, zoneProps) {
            return new DexiePromise(function (resolve, reject) {
                return newScope(function (resolve, reject) {
                    var psd = PSD;
                    psd.unhandleds = [];
                    psd.onunhandled = reject;
                    psd.finalize = callBoth(function () {
                        var _this = this;
                        run_at_end_of_this_or_next_physical_tick(function () {
                            _this.unhandleds.length === 0 ? resolve() : reject(_this.unhandleds[0]);
                        });
                    }, psd.finalize);
                    fn();
                }, zoneProps, resolve, reject);
            });
        }
    });
    if (NativePromise) {
        if (NativePromise.allSettled)
            setProp(DexiePromise, "allSettled", function () {
                var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
                return new DexiePromise(function (resolve) {
                    if (possiblePromises.length === 0)
                        resolve([]);
                    var remaining = possiblePromises.length;
                    var results = new Array(remaining);
                    possiblePromises.forEach(function (p, i) { return DexiePromise.resolve(p).then(function (value) { return results[i] = { status: "fulfilled", value: value }; }, function (reason) { return results[i] = { status: "rejected", reason: reason }; })
                        .then(function () { return --remaining || resolve(results); }); });
                });
            });
        if (NativePromise.any && typeof AggregateError !== 'undefined')
            setProp(DexiePromise, "any", function () {
                var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
                return new DexiePromise(function (resolve, reject) {
                    if (possiblePromises.length === 0)
                        reject(new AggregateError([]));
                    var remaining = possiblePromises.length;
                    var failures = new Array(remaining);
                    possiblePromises.forEach(function (p, i) { return DexiePromise.resolve(p).then(function (value) { return resolve(value); }, function (failure) {
                        failures[i] = failure;
                        if (!--remaining)
                            reject(new AggregateError(failures));
                    }); });
                });
            });
    }
    function executePromiseTask(promise, fn) {
        try {
            fn(function (value) {
                if (promise._state !== null)
                    return;
                if (value === promise)
                    throw new TypeError('A promise cannot be resolved with itself.');
                var shouldExecuteTick = promise._lib && beginMicroTickScope();
                if (value && typeof value.then === 'function') {
                    executePromiseTask(promise, function (resolve, reject) {
                        value instanceof DexiePromise ?
                            value._then(resolve, reject) :
                            value.then(resolve, reject);
                    });
                }
                else {
                    promise._state = true;
                    promise._value = value;
                    propagateAllListeners(promise);
                }
                if (shouldExecuteTick)
                    endMicroTickScope();
            }, handleRejection.bind(null, promise));
        }
        catch (ex) {
            handleRejection(promise, ex);
        }
    }
    function handleRejection(promise, reason) {
        rejectingErrors.push(reason);
        if (promise._state !== null)
            return;
        var shouldExecuteTick = promise._lib && beginMicroTickScope();
        reason = rejectionMapper(reason);
        promise._state = false;
        promise._value = reason;
        debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(function () {
            var origProp = getPropertyDescriptor(reason, "stack");
            reason._promise = promise;
            setProp(reason, "stack", {
                get: function () {
                    return stack_being_generated ?
                        origProp && (origProp.get ?
                            origProp.get.apply(reason) :
                            origProp.value) :
                        promise.stack;
                }
            });
        });
        addPossiblyUnhandledError(promise);
        propagateAllListeners(promise);
        if (shouldExecuteTick)
            endMicroTickScope();
    }
    function propagateAllListeners(promise) {
        var listeners = promise._listeners;
        promise._listeners = [];
        for (var i = 0, len = listeners.length; i < len; ++i) {
            propagateToListener(promise, listeners[i]);
        }
        var psd = promise._PSD;
        --psd.ref || psd.finalize();
        if (numScheduledCalls === 0) {
            ++numScheduledCalls;
            asap$1(function () {
                if (--numScheduledCalls === 0)
                    finalizePhysicalTick();
            }, []);
        }
    }
    function propagateToListener(promise, listener) {
        if (promise._state === null) {
            promise._listeners.push(listener);
            return;
        }
        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
        if (cb === null) {
            return (promise._state ? listener.resolve : listener.reject)(promise._value);
        }
        ++listener.psd.ref;
        ++numScheduledCalls;
        asap$1(callListener, [cb, promise, listener]);
    }
    function callListener(cb, promise, listener) {
        try {
            currentFulfiller = promise;
            var ret, value = promise._value;
            if (promise._state) {
                ret = cb(value);
            }
            else {
                if (rejectingErrors.length)
                    rejectingErrors = [];
                ret = cb(value);
                if (rejectingErrors.indexOf(value) === -1)
                    markErrorAsHandled(promise);
            }
            listener.resolve(ret);
        }
        catch (e) {
            listener.reject(e);
        }
        finally {
            currentFulfiller = null;
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
            --listener.psd.ref || listener.psd.finalize();
        }
    }
    function getStack(promise, stacks, limit) {
        if (stacks.length === limit)
            return stacks;
        var stack = "";
        if (promise._state === false) {
            var failure = promise._value, errorName, message;
            if (failure != null) {
                errorName = failure.name || "Error";
                message = failure.message || failure;
                stack = prettyStack(failure, 0);
            }
            else {
                errorName = failure;
                message = "";
            }
            stacks.push(errorName + (message ? ": " + message : "") + stack);
        }
        if (debug) {
            stack = prettyStack(promise._stackHolder, 2);
            if (stack && stacks.indexOf(stack) === -1)
                stacks.push(stack);
            if (promise._prev)
                getStack(promise._prev, stacks, limit);
        }
        return stacks;
    }
    function linkToPreviousPromise(promise, prev) {
        var numPrev = prev ? prev._numPrev + 1 : 0;
        if (numPrev < LONG_STACKS_CLIP_LIMIT) {
            promise._prev = prev;
            promise._numPrev = numPrev;
        }
    }
    function physicalTick() {
        beginMicroTickScope() && endMicroTickScope();
    }
    function beginMicroTickScope() {
        var wasRootExec = isOutsideMicroTick;
        isOutsideMicroTick = false;
        needsNewPhysicalTick = false;
        return wasRootExec;
    }
    function endMicroTickScope() {
        var callbacks, i, l;
        do {
            while (microtickQueue.length > 0) {
                callbacks = microtickQueue;
                microtickQueue = [];
                l = callbacks.length;
                for (i = 0; i < l; ++i) {
                    var item = callbacks[i];
                    item[0].apply(null, item[1]);
                }
            }
        } while (microtickQueue.length > 0);
        isOutsideMicroTick = true;
        needsNewPhysicalTick = true;
    }
    function finalizePhysicalTick() {
        var unhandledErrs = unhandledErrors;
        unhandledErrors = [];
        unhandledErrs.forEach(function (p) {
            p._PSD.onunhandled.call(null, p._value, p);
        });
        var finalizers = tickFinalizers.slice(0);
        var i = finalizers.length;
        while (i)
            finalizers[--i]();
    }
    function run_at_end_of_this_or_next_physical_tick(fn) {
        function finalizer() {
            fn();
            tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
        }
        tickFinalizers.push(finalizer);
        ++numScheduledCalls;
        asap$1(function () {
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
        }, []);
    }
    function addPossiblyUnhandledError(promise) {
        if (!unhandledErrors.some(function (p) { return p._value === promise._value; }))
            unhandledErrors.push(promise);
    }
    function markErrorAsHandled(promise) {
        var i = unhandledErrors.length;
        while (i)
            if (unhandledErrors[--i]._value === promise._value) {
                unhandledErrors.splice(i, 1);
                return;
            }
    }
    function PromiseReject(reason) {
        return new DexiePromise(INTERNAL, false, reason);
    }
    function wrap(fn, errorCatcher) {
        var psd = PSD;
        return function () {
            var wasRootExec = beginMicroTickScope(), outerScope = PSD;
            try {
                switchToZone(psd, true);
                return fn.apply(this, arguments);
            }
            catch (e) {
                errorCatcher && errorCatcher(e);
            }
            finally {
                switchToZone(outerScope, false);
                if (wasRootExec)
                    endMicroTickScope();
            }
        };
    }
    var task = { awaits: 0, echoes: 0, id: 0 };
    var taskCounter = 0;
    var zoneStack = [];
    var zoneEchoes = 0;
    var totalEchoes = 0;
    var zone_id_counter = 0;
    function newScope(fn, props$$1, a1, a2) {
        var parent = PSD, psd = Object.create(parent);
        psd.parent = parent;
        psd.ref = 0;
        psd.global = false;
        psd.id = ++zone_id_counter;
        var globalEnv = globalPSD.env;
        psd.env = patchGlobalPromise ? {
            Promise: DexiePromise,
            PromiseProp: { value: DexiePromise, configurable: true, writable: true },
            all: DexiePromise.all,
            race: DexiePromise.race,
            allSettled: DexiePromise.allSettled,
            any: DexiePromise.any,
            resolve: DexiePromise.resolve,
            reject: DexiePromise.reject,
            nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
            gthen: getPatchedPromiseThen(globalEnv.gthen, psd)
        } : {};
        if (props$$1)
            extend(psd, props$$1);
        ++parent.ref;
        psd.finalize = function () {
            --this.parent.ref || this.parent.finalize();
        };
        var rv = usePSD(psd, fn, a1, a2);
        if (psd.ref === 0)
            psd.finalize();
        return rv;
    }
    function incrementExpectedAwaits() {
        if (!task.id)
            task.id = ++taskCounter;
        ++task.awaits;
        task.echoes += ZONE_ECHO_LIMIT;
        return task.id;
    }
    function decrementExpectedAwaits() {
        if (!task.awaits)
            return false;
        if (--task.awaits === 0)
            task.id = 0;
        task.echoes = task.awaits * ZONE_ECHO_LIMIT;
        return true;
    }
    if (('' + nativePromiseThen).indexOf('[native code]') === -1) {
        incrementExpectedAwaits = decrementExpectedAwaits = nop;
    }
    function onPossibleParallellAsync(possiblePromise) {
        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
            incrementExpectedAwaits();
            return possiblePromise.then(function (x) {
                decrementExpectedAwaits();
                return x;
            }, function (e) {
                decrementExpectedAwaits();
                return rejection(e);
            });
        }
        return possiblePromise;
    }
    function zoneEnterEcho(targetZone) {
        ++totalEchoes;
        if (!task.echoes || --task.echoes === 0) {
            task.echoes = task.id = 0;
        }
        zoneStack.push(PSD);
        switchToZone(targetZone, true);
    }
    function zoneLeaveEcho() {
        var zone = zoneStack[zoneStack.length - 1];
        zoneStack.pop();
        switchToZone(zone, false);
    }
    function switchToZone(targetZone, bEnteringZone) {
        var currentZone = PSD;
        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
            enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
        }
        if (targetZone === PSD)
            return;
        PSD = targetZone;
        if (currentZone === globalPSD)
            globalPSD.env = snapShot();
        if (patchGlobalPromise) {
            var GlobalPromise_1 = globalPSD.env.Promise;
            var targetEnv = targetZone.env;
            nativePromiseProto.then = targetEnv.nthen;
            GlobalPromise_1.prototype.then = targetEnv.gthen;
            if (currentZone.global || targetZone.global) {
                Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);
                GlobalPromise_1.all = targetEnv.all;
                GlobalPromise_1.race = targetEnv.race;
                GlobalPromise_1.resolve = targetEnv.resolve;
                GlobalPromise_1.reject = targetEnv.reject;
                if (targetEnv.allSettled)
                    GlobalPromise_1.allSettled = targetEnv.allSettled;
                if (targetEnv.any)
                    GlobalPromise_1.any = targetEnv.any;
            }
        }
    }
    function snapShot() {
        var GlobalPromise = _global.Promise;
        return patchGlobalPromise ? {
            Promise: GlobalPromise,
            PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
            all: GlobalPromise.all,
            race: GlobalPromise.race,
            allSettled: GlobalPromise.allSettled,
            any: GlobalPromise.any,
            resolve: GlobalPromise.resolve,
            reject: GlobalPromise.reject,
            nthen: nativePromiseProto.then,
            gthen: GlobalPromise.prototype.then
        } : {};
    }
    function usePSD(psd, fn, a1, a2, a3) {
        var outerScope = PSD;
        try {
            switchToZone(psd, true);
            return fn(a1, a2, a3);
        }
        finally {
            switchToZone(outerScope, false);
        }
    }
    function enqueueNativeMicroTask(job) {
        nativePromiseThen.call(resolvedNativePromise, job);
    }
    function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
        return typeof fn !== 'function' ? fn : function () {
            var outerZone = PSD;
            if (possibleAwait)
                incrementExpectedAwaits();
            switchToZone(zone, true);
            try {
                return fn.apply(this, arguments);
            }
            finally {
                switchToZone(outerZone, false);
                if (cleanup)
                    enqueueNativeMicroTask(decrementExpectedAwaits);
            }
        };
    }
    function getPatchedPromiseThen(origThen, zone) {
        return function (onResolved, onRejected) {
            return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone), nativeAwaitCompatibleWrap(onRejected, zone));
        };
    }
    var UNHANDLEDREJECTION = "unhandledrejection";
    function globalError(err, promise) {
        var rv;
        try {
            rv = promise.onuncatched(err);
        }
        catch (e) { }
        if (rv !== false)
            try {
                var event, eventData = { promise: promise, reason: err };
                if (_global.document && document.createEvent) {
                    event = document.createEvent('Event');
                    event.initEvent(UNHANDLEDREJECTION, true, true);
                    extend(event, eventData);
                }
                else if (_global.CustomEvent) {
                    event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
                    extend(event, eventData);
                }
                if (event && _global.dispatchEvent) {
                    dispatchEvent(event);
                    if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
                        try {
                            _global.onunhandledrejection(event);
                        }
                        catch (_) { }
                }
                if (debug && event && !event.defaultPrevented) {
                    console.warn("Unhandled rejection: " + (err.stack || err));
                }
            }
            catch (e) { }
    }
    var rejection = DexiePromise.reject;

    function tempTransaction(db, mode, storeNames, fn) {
        if (!db._state.openComplete && (!PSD.letThrough)) {
            if (!db._state.isBeingOpened) {
                if (!db._options.autoOpen)
                    return rejection(new exceptions.DatabaseClosed());
                db.open().catch(nop);
            }
            return db._state.dbReadyPromise.then(function () { return tempTransaction(db, mode, storeNames, fn); });
        }
        else {
            var trans = db._createTransaction(mode, storeNames, db._dbSchema);
            try {
                trans.create();
            }
            catch (ex) {
                return rejection(ex);
            }
            return trans._promise(mode, function (resolve, reject) {
                return newScope(function () {
                    PSD.trans = trans;
                    return fn(resolve, reject, trans);
                });
            }).then(function (result) {
                return trans._completion.then(function () { return result; });
            });
        }
    }

    var DEXIE_VERSION = '3.0.3';
    var maxString = String.fromCharCode(65535);
    var minKey = -Infinity;
    var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
    var STRING_EXPECTED = "String expected.";
    var connections = [];
    var isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
    var hasIEDeleteObjectStoreBug = isIEOrEdge;
    var hangsOnDeleteLargeKeyRange = isIEOrEdge;
    var dexieStackFrameFilter = function (frame) { return !/(dexie\.js|dexie\.min\.js)/.test(frame); };
    var DBNAMES_DB = '__dbnames';
    var READONLY = 'readonly';
    var READWRITE = 'readwrite';

    function combine(filter1, filter2) {
        return filter1 ?
            filter2 ?
                function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } :
                filter1 :
            filter2;
    }

    var AnyRange = {
        type: 3          ,
        lower: -Infinity,
        lowerOpen: false,
        upper: [[]],
        upperOpen: false
    };

    function workaroundForUndefinedPrimKey(keyPath) {
        return function (obj) {
            if (getByKeyPath(obj, keyPath) === undefined) {
                obj = deepClone(obj);
                delByKeyPath(obj, keyPath);
            }
            return obj;
        };
    }

    var Table =               (function () {
        function Table() {
        }
        Table.prototype._trans = function (mode, fn, writeLocked) {
            var trans = this._tx || PSD.trans;
            var tableName = this.name;
            function checkTableInTransaction(resolve, reject, trans) {
                if (!trans.schema[tableName])
                    throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
                return fn(trans.idbtrans, trans);
            }
            var wasRootExec = beginMicroTickScope();
            try {
                return trans && trans.db === this.db ?
                    trans === PSD.trans ?
                        trans._promise(mode, checkTableInTransaction, writeLocked) :
                        newScope(function () { return trans._promise(mode, checkTableInTransaction, writeLocked); }, { trans: trans, transless: PSD.transless || PSD }) :
                    tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
            }
            finally {
                if (wasRootExec)
                    endMicroTickScope();
            }
        };
        Table.prototype.get = function (keyOrCrit, cb) {
            var _this = this;
            if (keyOrCrit && keyOrCrit.constructor === Object)
                return this.where(keyOrCrit).first(cb);
            return this._trans('readonly', function (trans) {
                return _this.core.get({ trans: trans, key: keyOrCrit })
                    .then(function (res) { return _this.hook.reading.fire(res); });
            }).then(cb);
        };
        Table.prototype.where = function (indexOrCrit) {
            if (typeof indexOrCrit === 'string')
                return new this.db.WhereClause(this, indexOrCrit);
            if (isArray(indexOrCrit))
                return new this.db.WhereClause(this, "[" + indexOrCrit.join('+') + "]");
            var keyPaths = keys(indexOrCrit);
            if (keyPaths.length === 1)
                return this
                    .where(keyPaths[0])
                    .equals(indexOrCrit[keyPaths[0]]);
            var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function (ix) {
                return ix.compound &&
                    keyPaths.every(function (keyPath) { return ix.keyPath.indexOf(keyPath) >= 0; }) &&
                    ix.keyPath.every(function (keyPath) { return keyPaths.indexOf(keyPath) >= 0; });
            })[0];
            if (compoundIndex && this.db._maxKey !== maxString)
                return this
                    .where(compoundIndex.name)
                    .equals(compoundIndex.keyPath.map(function (kp) { return indexOrCrit[kp]; }));
            if (!compoundIndex && debug)
                console.warn("The query " + JSON.stringify(indexOrCrit) + " on " + this.name + " would benefit of a " +
                    ("compound index [" + keyPaths.join('+') + "]"));
            var idxByName = this.schema.idxByName;
            var idb = this.db._deps.indexedDB;
            function equals(a, b) {
                try {
                    return idb.cmp(a, b) === 0;
                }
                catch (e) {
                    return false;
                }
            }
            var _a = keyPaths.reduce(function (_a, keyPath) {
                var prevIndex = _a[0], prevFilterFn = _a[1];
                var index = idxByName[keyPath];
                var value = indexOrCrit[keyPath];
                return [
                    prevIndex || index,
                    prevIndex || !index ?
                        combine(prevFilterFn, index && index.multi ?
                            function (x) {
                                var prop = getByKeyPath(x, keyPath);
                                return isArray(prop) && prop.some(function (item) { return equals(value, item); });
                            } : function (x) { return equals(value, getByKeyPath(x, keyPath)); })
                        : prevFilterFn
                ];
            }, [null, null]), idx = _a[0], filterFunction = _a[1];
            return idx ?
                this.where(idx.name).equals(indexOrCrit[idx.keyPath])
                    .filter(filterFunction) :
                compoundIndex ?
                    this.filter(filterFunction) :
                    this.where(keyPaths).equals('');
        };
        Table.prototype.filter = function (filterFunction) {
            return this.toCollection().and(filterFunction);
        };
        Table.prototype.count = function (thenShortcut) {
            return this.toCollection().count(thenShortcut);
        };
        Table.prototype.offset = function (offset) {
            return this.toCollection().offset(offset);
        };
        Table.prototype.limit = function (numRows) {
            return this.toCollection().limit(numRows);
        };
        Table.prototype.each = function (callback) {
            return this.toCollection().each(callback);
        };
        Table.prototype.toArray = function (thenShortcut) {
            return this.toCollection().toArray(thenShortcut);
        };
        Table.prototype.toCollection = function () {
            return new this.db.Collection(new this.db.WhereClause(this));
        };
        Table.prototype.orderBy = function (index) {
            return new this.db.Collection(new this.db.WhereClause(this, isArray(index) ?
                "[" + index.join('+') + "]" :
                index));
        };
        Table.prototype.reverse = function () {
            return this.toCollection().reverse();
        };
        Table.prototype.mapToClass = function (constructor) {
            this.schema.mappedClass = constructor;
            var readHook = function (obj) {
                if (!obj)
                    return obj;
                var res = Object.create(constructor.prototype);
                for (var m in obj)
                    if (hasOwn(obj, m))
                        try {
                            res[m] = obj[m];
                        }
                        catch (_) { }
                return res;
            };
            if (this.schema.readHook) {
                this.hook.reading.unsubscribe(this.schema.readHook);
            }
            this.schema.readHook = readHook;
            this.hook("reading", readHook);
            return constructor;
        };
        Table.prototype.defineClass = function () {
            function Class(content) {
                extend(this, content);
            }
            
            return this.mapToClass(Class);
        };
        Table.prototype.add = function (obj, key) {
            var _this = this;
            var _a = this.schema.primKey, auto = _a.auto, keyPath = _a.keyPath;
            var objToAdd = obj;
            if (keyPath && auto) {
                objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
            }
            return this._trans('readwrite', function (trans) {
                return _this.core.mutate({ trans: trans, type: 'add', keys: key != null ? [key] : null, values: [objToAdd] });
            }).then(function (res) { return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult; })
                .then(function (lastResult) {
                if (keyPath) {
                    try {
                        setByKeyPath(obj, keyPath, lastResult);
                    }
                    catch (_) { }
                    
                }
                return lastResult;
            });
        };
        Table.prototype.update = function (keyOrObject, modifications) {
            if (typeof modifications !== 'object' || isArray(modifications))
                throw new exceptions.InvalidArgument("Modifications must be an object.");
            if (typeof keyOrObject === 'object' && !isArray(keyOrObject)) {
                keys(modifications).forEach(function (keyPath) {
                    setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                });
                var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                if (key === undefined)
                    return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
                return this.where(":id").equals(key).modify(modifications);
            }
            else {
                return this.where(":id").equals(keyOrObject).modify(modifications);
            }
        };
        Table.prototype.put = function (obj, key) {
            var _this = this;
            var _a = this.schema.primKey, auto = _a.auto, keyPath = _a.keyPath;
            var objToAdd = obj;
            if (keyPath && auto) {
                objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
            }
            return this._trans('readwrite', function (trans) { return _this.core.mutate({ trans: trans, type: 'put', values: [objToAdd], keys: key != null ? [key] : null }); })
                .then(function (res) { return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult; })
                .then(function (lastResult) {
                if (keyPath) {
                    try {
                        setByKeyPath(obj, keyPath, lastResult);
                    }
                    catch (_) { }
                    
                }
                return lastResult;
            });
        };
        Table.prototype.delete = function (key) {
            var _this = this;
            return this._trans('readwrite', function (trans) { return _this.core.mutate({ trans: trans, type: 'delete', keys: [key] }); })
                .then(function (res) { return res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined; });
        };
        Table.prototype.clear = function () {
            var _this = this;
            return this._trans('readwrite', function (trans) { return _this.core.mutate({ trans: trans, type: 'deleteRange', range: AnyRange }); })
                .then(function (res) { return res.numFailures ? DexiePromise.reject(res.failures[0]) : undefined; });
        };
        Table.prototype.bulkGet = function (keys$$1) {
            var _this = this;
            return this._trans('readonly', function (trans) {
                return _this.core.getMany({
                    keys: keys$$1,
                    trans: trans
                }).then(function (result) { return result.map(function (res) { return _this.hook.reading.fire(res); }); });
            });
        };
        Table.prototype.bulkAdd = function (objects, keysOrOptions, options) {
            var _this = this;
            var keys$$1 = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
            options = options || (keys$$1 ? undefined : keysOrOptions);
            var wantResults = options ? options.allKeys : undefined;
            return this._trans('readwrite', function (trans) {
                var _a = _this.schema.primKey, auto = _a.auto, keyPath = _a.keyPath;
                if (keyPath && keys$$1)
                    throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
                if (keys$$1 && keys$$1.length !== objects.length)
                    throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                var numObjects = objects.length;
                var objectsToAdd = keyPath && auto ?
                    objects.map(workaroundForUndefinedPrimKey(keyPath)) :
                    objects;
                return _this.core.mutate({ trans: trans, type: 'add', keys: keys$$1, values: objectsToAdd, wantResults: wantResults })
                    .then(function (_a) {
                    var numFailures = _a.numFailures, results = _a.results, lastResult = _a.lastResult, failures = _a.failures;
                    var result = wantResults ? results : lastResult;
                    if (numFailures === 0)
                        return result;
                    throw new BulkError(_this.name + ".bulkAdd(): " + numFailures + " of " + numObjects + " operations failed", Object.keys(failures).map(function (pos) { return failures[pos]; }));
                });
            });
        };
        Table.prototype.bulkPut = function (objects, keysOrOptions, options) {
            var _this = this;
            var keys$$1 = Array.isArray(keysOrOptions) ? keysOrOptions : undefined;
            options = options || (keys$$1 ? undefined : keysOrOptions);
            var wantResults = options ? options.allKeys : undefined;
            return this._trans('readwrite', function (trans) {
                var _a = _this.schema.primKey, auto = _a.auto, keyPath = _a.keyPath;
                if (keyPath && keys$$1)
                    throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
                if (keys$$1 && keys$$1.length !== objects.length)
                    throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                var numObjects = objects.length;
                var objectsToPut = keyPath && auto ?
                    objects.map(workaroundForUndefinedPrimKey(keyPath)) :
                    objects;
                return _this.core.mutate({ trans: trans, type: 'put', keys: keys$$1, values: objectsToPut, wantResults: wantResults })
                    .then(function (_a) {
                    var numFailures = _a.numFailures, results = _a.results, lastResult = _a.lastResult, failures = _a.failures;
                    var result = wantResults ? results : lastResult;
                    if (numFailures === 0)
                        return result;
                    throw new BulkError(_this.name + ".bulkPut(): " + numFailures + " of " + numObjects + " operations failed", Object.keys(failures).map(function (pos) { return failures[pos]; }));
                });
            });
        };
        Table.prototype.bulkDelete = function (keys$$1) {
            var _this = this;
            var numKeys = keys$$1.length;
            return this._trans('readwrite', function (trans) {
                return _this.core.mutate({ trans: trans, type: 'delete', keys: keys$$1 });
            }).then(function (_a) {
                var numFailures = _a.numFailures, lastResult = _a.lastResult, failures = _a.failures;
                if (numFailures === 0)
                    return lastResult;
                throw new BulkError(_this.name + ".bulkDelete(): " + numFailures + " of " + numKeys + " operations failed", failures);
            });
        };
        return Table;
    }());

    function Events(ctx) {
        var evs = {};
        var rv = function (eventName, subscriber) {
            if (subscriber) {
                var i = arguments.length, args = new Array(i - 1);
                while (--i)
                    args[i - 1] = arguments[i];
                evs[eventName].subscribe.apply(null, args);
                return ctx;
            }
            else if (typeof (eventName) === 'string') {
                return evs[eventName];
            }
        };
        rv.addEventType = add;
        for (var i = 1, l = arguments.length; i < l; ++i) {
            add(arguments[i]);
        }
        return rv;
        function add(eventName, chainFunction, defaultFunction) {
            if (typeof eventName === 'object')
                return addConfiguredEvents(eventName);
            if (!chainFunction)
                chainFunction = reverseStoppableEventChain;
            if (!defaultFunction)
                defaultFunction = nop;
            var context = {
                subscribers: [],
                fire: defaultFunction,
                subscribe: function (cb) {
                    if (context.subscribers.indexOf(cb) === -1) {
                        context.subscribers.push(cb);
                        context.fire = chainFunction(context.fire, cb);
                    }
                },
                unsubscribe: function (cb) {
                    context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
                    context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
                }
            };
            evs[eventName] = rv[eventName] = context;
            return context;
        }
        function addConfiguredEvents(cfg) {
            keys(cfg).forEach(function (eventName) {
                var args = cfg[eventName];
                if (isArray(args)) {
                    add(eventName, cfg[eventName][0], cfg[eventName][1]);
                }
                else if (args === 'asap') {
                    var context = add(eventName, mirror, function fire() {
                        var i = arguments.length, args = new Array(i);
                        while (i--)
                            args[i] = arguments[i];
                        context.subscribers.forEach(function (fn) {
                            asap(function fireEvent() {
                                fn.apply(null, args);
                            });
                        });
                    });
                }
                else
                    throw new exceptions.InvalidArgument("Invalid event config");
            });
        }
    }

    function makeClassConstructor(prototype, constructor) {
        derive(constructor).from({ prototype: prototype });
        return constructor;
    }

    function createTableConstructor(db) {
        return makeClassConstructor(Table.prototype, function Table$$1(name, tableSchema, trans) {
            this.db = db;
            this._tx = trans;
            this.name = name;
            this.schema = tableSchema;
            this.hook = db._allTables[name] ? db._allTables[name].hook : Events(null, {
                "creating": [hookCreatingChain, nop],
                "reading": [pureFunctionChain, mirror],
                "updating": [hookUpdatingChain, nop],
                "deleting": [hookDeletingChain, nop]
            });
        });
    }

    function isPlainKeyRange(ctx, ignoreLimitFilter) {
        return !(ctx.filter || ctx.algorithm || ctx.or) &&
            (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
    }
    function addFilter(ctx, fn) {
        ctx.filter = combine(ctx.filter, fn);
    }
    function addReplayFilter(ctx, factory, isLimitFilter) {
        var curr = ctx.replayFilter;
        ctx.replayFilter = curr ? function () { return combine(curr(), factory()); } : factory;
        ctx.justLimit = isLimitFilter && !curr;
    }
    function addMatchFilter(ctx, fn) {
        ctx.isMatch = combine(ctx.isMatch, fn);
    }
    function getIndexOrStore(ctx, coreSchema) {
        if (ctx.isPrimKey)
            return coreSchema.primaryKey;
        var index = coreSchema.getIndexByKeyPath(ctx.index);
        if (!index)
            throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
        return index;
    }
    function openCursor(ctx, coreTable, trans) {
        var index = getIndexOrStore(ctx, coreTable.schema);
        return coreTable.openCursor({
            trans: trans,
            values: !ctx.keysOnly,
            reverse: ctx.dir === 'prev',
            unique: !!ctx.unique,
            query: {
                index: index,
                range: ctx.range
            }
        });
    }
    function iter(ctx, fn, coreTrans, coreTable) {
        var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
        if (!ctx.or) {
            return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter), fn, !ctx.keysOnly && ctx.valueMapper);
        }
        else {
            var set_1 = {};
            var union = function (item, cursor, advance) {
                if (!filter || filter(cursor, advance, function (result) { return cursor.stop(result); }, function (err) { return cursor.fail(err); })) {
                    var primaryKey = cursor.primaryKey;
                    var key = '' + primaryKey;
                    if (key === '[object ArrayBuffer]')
                        key = '' + new Uint8Array(primaryKey);
                    if (!hasOwn(set_1, key)) {
                        set_1[key] = true;
                        fn(item, cursor, advance);
                    }
                }
            };
            return Promise.all([
                ctx.or._iterate(union, coreTrans),
                iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
            ]);
        }
    }
    function iterate(cursorPromise, filter, fn, valueMapper) {
        var mappedFn = valueMapper ? function (x, c, a) { return fn(valueMapper(x), c, a); } : fn;
        var wrappedFn = wrap(mappedFn);
        return cursorPromise.then(function (cursor) {
            if (cursor) {
                return cursor.start(function () {
                    var c = function () { return cursor.continue(); };
                    if (!filter || filter(cursor, function (advancer) { return c = advancer; }, function (val) { cursor.stop(val); c = nop; }, function (e) { cursor.fail(e); c = nop; }))
                        wrappedFn(cursor.value, cursor, function (advancer) { return c = advancer; });
                    c();
                });
            }
        });
    }

    var Collection =               (function () {
        function Collection() {
        }
        Collection.prototype._read = function (fn, cb) {
            var ctx = this._ctx;
            return ctx.error ?
                ctx.table._trans(null, rejection.bind(null, ctx.error)) :
                ctx.table._trans('readonly', fn).then(cb);
        };
        Collection.prototype._write = function (fn) {
            var ctx = this._ctx;
            return ctx.error ?
                ctx.table._trans(null, rejection.bind(null, ctx.error)) :
                ctx.table._trans('readwrite', fn, "locked");
        };
        Collection.prototype._addAlgorithm = function (fn) {
            var ctx = this._ctx;
            ctx.algorithm = combine(ctx.algorithm, fn);
        };
        Collection.prototype._iterate = function (fn, coreTrans) {
            return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
        };
        Collection.prototype.clone = function (props$$1) {
            var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
            if (props$$1)
                extend(ctx, props$$1);
            rv._ctx = ctx;
            return rv;
        };
        Collection.prototype.raw = function () {
            this._ctx.valueMapper = null;
            return this;
        };
        Collection.prototype.each = function (fn) {
            var ctx = this._ctx;
            return this._read(function (trans) { return iter(ctx, fn, trans, ctx.table.core); });
        };
        Collection.prototype.count = function (cb) {
            var _this = this;
            return this._read(function (trans) {
                var ctx = _this._ctx;
                var coreTable = ctx.table.core;
                if (isPlainKeyRange(ctx, true)) {
                    return coreTable.count({
                        trans: trans,
                        query: {
                            index: getIndexOrStore(ctx, coreTable.schema),
                            range: ctx.range
                        }
                    }).then(function (count) { return Math.min(count, ctx.limit); });
                }
                else {
                    var count = 0;
                    return iter(ctx, function () { ++count; return false; }, trans, coreTable)
                        .then(function () { return count; });
                }
            }).then(cb);
        };
        Collection.prototype.sortBy = function (keyPath, cb) {
            var parts = keyPath.split('.').reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
            function getval(obj, i) {
                if (i)
                    return getval(obj[parts[i]], i - 1);
                return obj[lastPart];
            }
            var order = this._ctx.dir === "next" ? 1 : -1;
            function sorter(a, b) {
                var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
                return aVal < bVal ? -order : aVal > bVal ? order : 0;
            }
            return this.toArray(function (a) {
                return a.sort(sorter);
            }).then(cb);
        };
        Collection.prototype.toArray = function (cb) {
            var _this = this;
            return this._read(function (trans) {
                var ctx = _this._ctx;
                if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                    var valueMapper_1 = ctx.valueMapper;
                    var index = getIndexOrStore(ctx, ctx.table.core.schema);
                    return ctx.table.core.query({
                        trans: trans,
                        limit: ctx.limit,
                        values: true,
                        query: {
                            index: index,
                            range: ctx.range
                        }
                    }).then(function (_a) {
                        var result = _a.result;
                        return valueMapper_1 ? result.map(valueMapper_1) : result;
                    });
                }
                else {
                    var a_1 = [];
                    return iter(ctx, function (item) { return a_1.push(item); }, trans, ctx.table.core).then(function () { return a_1; });
                }
            }, cb);
        };
        Collection.prototype.offset = function (offset) {
            var ctx = this._ctx;
            if (offset <= 0)
                return this;
            ctx.offset += offset;
            if (isPlainKeyRange(ctx)) {
                addReplayFilter(ctx, function () {
                    var offsetLeft = offset;
                    return function (cursor, advance) {
                        if (offsetLeft === 0)
                            return true;
                        if (offsetLeft === 1) {
                            --offsetLeft;
                            return false;
                        }
                        advance(function () {
                            cursor.advance(offsetLeft);
                            offsetLeft = 0;
                        });
                        return false;
                    };
                });
            }
            else {
                addReplayFilter(ctx, function () {
                    var offsetLeft = offset;
                    return function () { return (--offsetLeft < 0); };
                });
            }
            return this;
        };
        Collection.prototype.limit = function (numRows) {
            this._ctx.limit = Math.min(this._ctx.limit, numRows);
            addReplayFilter(this._ctx, function () {
                var rowsLeft = numRows;
                return function (cursor, advance, resolve) {
                    if (--rowsLeft <= 0)
                        advance(resolve);
                    return rowsLeft >= 0;
                };
            }, true);
            return this;
        };
        Collection.prototype.until = function (filterFunction, bIncludeStopEntry) {
            addFilter(this._ctx, function (cursor, advance, resolve) {
                if (filterFunction(cursor.value)) {
                    advance(resolve);
                    return bIncludeStopEntry;
                }
                else {
                    return true;
                }
            });
            return this;
        };
        Collection.prototype.first = function (cb) {
            return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
        };
        Collection.prototype.last = function (cb) {
            return this.reverse().first(cb);
        };
        Collection.prototype.filter = function (filterFunction) {
            addFilter(this._ctx, function (cursor) {
                return filterFunction(cursor.value);
            });
            addMatchFilter(this._ctx, filterFunction);
            return this;
        };
        Collection.prototype.and = function (filter) {
            return this.filter(filter);
        };
        Collection.prototype.or = function (indexName) {
            return new this.db.WhereClause(this._ctx.table, indexName, this);
        };
        Collection.prototype.reverse = function () {
            this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
            if (this._ondirectionchange)
                this._ondirectionchange(this._ctx.dir);
            return this;
        };
        Collection.prototype.desc = function () {
            return this.reverse();
        };
        Collection.prototype.eachKey = function (cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            return this.each(function (val, cursor) { cb(cursor.key, cursor); });
        };
        Collection.prototype.eachUniqueKey = function (cb) {
            this._ctx.unique = "unique";
            return this.eachKey(cb);
        };
        Collection.prototype.eachPrimaryKey = function (cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            return this.each(function (val, cursor) { cb(cursor.primaryKey, cursor); });
        };
        Collection.prototype.keys = function (cb) {
            var ctx = this._ctx;
            ctx.keysOnly = !ctx.isMatch;
            var a = [];
            return this.each(function (item, cursor) {
                a.push(cursor.key);
            }).then(function () {
                return a;
            }).then(cb);
        };
        Collection.prototype.primaryKeys = function (cb) {
            var ctx = this._ctx;
            if (ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                return this._read(function (trans) {
                    var index = getIndexOrStore(ctx, ctx.table.core.schema);
                    return ctx.table.core.query({
                        trans: trans,
                        values: false,
                        limit: ctx.limit,
                        query: {
                            index: index,
                            range: ctx.range
                        }
                    });
                }).then(function (_a) {
                    var result = _a.result;
                    return result;
                }).then(cb);
            }
            ctx.keysOnly = !ctx.isMatch;
            var a = [];
            return this.each(function (item, cursor) {
                a.push(cursor.primaryKey);
            }).then(function () {
                return a;
            }).then(cb);
        };
        Collection.prototype.uniqueKeys = function (cb) {
            this._ctx.unique = "unique";
            return this.keys(cb);
        };
        Collection.prototype.firstKey = function (cb) {
            return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
        };
        Collection.prototype.lastKey = function (cb) {
            return this.reverse().firstKey(cb);
        };
        Collection.prototype.distinct = function () {
            var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
            if (!idx || !idx.multi)
                return this;
            var set = {};
            addFilter(this._ctx, function (cursor) {
                var strKey = cursor.primaryKey.toString();
                var found = hasOwn(set, strKey);
                set[strKey] = true;
                return !found;
            });
            return this;
        };
        Collection.prototype.modify = function (changes) {
            var _this = this;
            var ctx = this._ctx;
            return this._write(function (trans) {
                var modifyer;
                if (typeof changes === 'function') {
                    modifyer = changes;
                }
                else {
                    var keyPaths = keys(changes);
                    var numKeys = keyPaths.length;
                    modifyer = function (item) {
                        var anythingModified = false;
                        for (var i = 0; i < numKeys; ++i) {
                            var keyPath = keyPaths[i], val = changes[keyPath];
                            if (getByKeyPath(item, keyPath) !== val) {
                                setByKeyPath(item, keyPath, val);
                                anythingModified = true;
                            }
                        }
                        return anythingModified;
                    };
                }
                var coreTable = ctx.table.core;
                var _a = coreTable.schema.primaryKey, outbound = _a.outbound, extractKey = _a.extractKey;
                var limit = 'testmode' in Dexie ? 1 : 2000;
                var cmp = _this.db.core.cmp;
                var totalFailures = [];
                var successCount = 0;
                var failedKeys = [];
                var applyMutateResult = function (expectedCount, res) {
                    var failures = res.failures, numFailures = res.numFailures;
                    successCount += expectedCount - numFailures;
                    for (var _i = 0, _a = keys(failures); _i < _a.length; _i++) {
                        var pos = _a[_i];
                        totalFailures.push(failures[pos]);
                    }
                };
                return _this.clone().primaryKeys().then(function (keys$$1) {
                    var nextChunk = function (offset) {
                        var count = Math.min(limit, keys$$1.length - offset);
                        return coreTable.getMany({ trans: trans, keys: keys$$1.slice(offset, offset + count) }).then(function (values) {
                            var addValues = [];
                            var putValues = [];
                            var putKeys = outbound ? [] : null;
                            var deleteKeys = [];
                            for (var i = 0; i < count; ++i) {
                                var origValue = values[i];
                                var ctx_1 = {
                                    value: deepClone(origValue),
                                    primKey: keys$$1[offset + i]
                                };
                                if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
                                    if (ctx_1.value == null) {
                                        deleteKeys.push(keys$$1[offset + i]);
                                    }
                                    else if (!outbound && cmp(extractKey(origValue), extractKey(ctx_1.value)) !== 0) {
                                        deleteKeys.push(keys$$1[offset + i]);
                                        addValues.push(ctx_1.value);
                                    }
                                    else {
                                        putValues.push(ctx_1.value);
                                        if (outbound)
                                            putKeys.push(keys$$1[offset + i]);
                                    }
                                }
                            }
                            return Promise.resolve(addValues.length > 0 &&
                                coreTable.mutate({ trans: trans, type: 'add', values: addValues })
                                    .then(function (res) {
                                    for (var pos in res.failures) {
                                        deleteKeys.splice(parseInt(pos), 1);
                                    }
                                    applyMutateResult(addValues.length, res);
                                })).then(function (res) { return putValues.length > 0 &&
                                coreTable.mutate({ trans: trans, type: 'put', keys: putKeys, values: putValues })
                                    .then(function (res) { return applyMutateResult(putValues.length, res); }); }).then(function () { return deleteKeys.length > 0 &&
                                coreTable.mutate({ trans: trans, type: 'delete', keys: deleteKeys })
                                    .then(function (res) { return applyMutateResult(deleteKeys.length, res); }); }).then(function () {
                                return keys$$1.length > offset + count && nextChunk(offset + limit);
                            });
                        });
                    };
                    return nextChunk(0).then(function () {
                        if (totalFailures.length > 0)
                            throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                        return keys$$1.length;
                    });
                });
            });
        };
        Collection.prototype.delete = function () {
            var ctx = this._ctx, range = ctx.range;
            if (isPlainKeyRange(ctx) &&
                ((ctx.isPrimKey && !hangsOnDeleteLargeKeyRange) || range.type === 3          ))
             {
                return this._write(function (trans) {
                    var primaryKey = ctx.table.core.schema.primaryKey;
                    var coreRange = range;
                    return ctx.table.core.count({ trans: trans, query: { index: primaryKey, range: coreRange } }).then(function (count) {
                        return ctx.table.core.mutate({ trans: trans, type: 'deleteRange', range: coreRange })
                            .then(function (_a) {
                            var failures = _a.failures; _a.lastResult; _a.results; var numFailures = _a.numFailures;
                            if (numFailures)
                                throw new ModifyError("Could not delete some values", Object.keys(failures).map(function (pos) { return failures[pos]; }), count - numFailures);
                            return count - numFailures;
                        });
                    });
                });
            }
            return this.modify(function (value, ctx) { return ctx.value = null; });
        };
        return Collection;
    }());

    function createCollectionConstructor(db) {
        return makeClassConstructor(Collection.prototype, function Collection$$1(whereClause, keyRangeGenerator) {
            this.db = db;
            var keyRange = AnyRange, error = null;
            if (keyRangeGenerator)
                try {
                    keyRange = keyRangeGenerator();
                }
                catch (ex) {
                    error = ex;
                }
            var whereCtx = whereClause._ctx;
            var table = whereCtx.table;
            var readingHook = table.hook.reading.fire;
            this._ctx = {
                table: table,
                index: whereCtx.index,
                isPrimKey: (!whereCtx.index || (table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name)),
                range: keyRange,
                keysOnly: false,
                dir: "next",
                unique: "",
                algorithm: null,
                filter: null,
                replayFilter: null,
                justLimit: true,
                isMatch: null,
                offset: 0,
                limit: Infinity,
                error: error,
                or: whereCtx.or,
                valueMapper: readingHook !== mirror ? readingHook : null
            };
        });
    }

    function simpleCompare(a, b) {
        return a < b ? -1 : a === b ? 0 : 1;
    }
    function simpleCompareReverse(a, b) {
        return a > b ? -1 : a === b ? 0 : 1;
    }

    function fail(collectionOrWhereClause, err, T) {
        var collection = collectionOrWhereClause instanceof WhereClause ?
            new collectionOrWhereClause.Collection(collectionOrWhereClause) :
            collectionOrWhereClause;
        collection._ctx.error = T ? new T(err) : new TypeError(err);
        return collection;
    }
    function emptyCollection(whereClause) {
        return new whereClause.Collection(whereClause, function () { return rangeEqual(""); }).limit(0);
    }
    function upperFactory(dir) {
        return dir === "next" ?
            function (s) { return s.toUpperCase(); } :
            function (s) { return s.toLowerCase(); };
    }
    function lowerFactory(dir) {
        return dir === "next" ?
            function (s) { return s.toLowerCase(); } :
            function (s) { return s.toUpperCase(); };
    }
    function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
        var length = Math.min(key.length, lowerNeedle.length);
        var llp = -1;
        for (var i = 0; i < length; ++i) {
            var lwrKeyChar = lowerKey[i];
            if (lwrKeyChar !== lowerNeedle[i]) {
                if (cmp(key[i], upperNeedle[i]) < 0)
                    return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                if (cmp(key[i], lowerNeedle[i]) < 0)
                    return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                if (llp >= 0)
                    return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                return null;
            }
            if (cmp(key[i], lwrKeyChar) < 0)
                llp = i;
        }
        if (length < lowerNeedle.length && dir === "next")
            return key + upperNeedle.substr(key.length);
        if (length < key.length && dir === "prev")
            return key.substr(0, upperNeedle.length);
        return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
    }
    function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
        var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
        if (!needles.every(function (s) { return typeof s === 'string'; })) {
            return fail(whereClause, STRING_EXPECTED);
        }
        function initDirection(dir) {
            upper = upperFactory(dir);
            lower = lowerFactory(dir);
            compare = (dir === "next" ? simpleCompare : simpleCompareReverse);
            var needleBounds = needles.map(function (needle) {
                return { lower: lower(needle), upper: upper(needle) };
            }).sort(function (a, b) {
                return compare(a.lower, b.lower);
            });
            upperNeedles = needleBounds.map(function (nb) { return nb.upper; });
            lowerNeedles = needleBounds.map(function (nb) { return nb.lower; });
            direction = dir;
            nextKeySuffix = (dir === "next" ? "" : suffix);
        }
        initDirection("next");
        var c = new whereClause.Collection(whereClause, function () { return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix); });
        c._ondirectionchange = function (direction) {
            initDirection(direction);
        };
        var firstPossibleNeedle = 0;
        c._addAlgorithm(function (cursor, advance, resolve) {
            var key = cursor.key;
            if (typeof key !== 'string')
                return false;
            var lowerKey = lower(key);
            if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
                return true;
            }
            else {
                var lowestPossibleCasing = null;
                for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                    var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                    if (casing === null && lowestPossibleCasing === null)
                        firstPossibleNeedle = i + 1;
                    else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                        lowestPossibleCasing = casing;
                    }
                }
                if (lowestPossibleCasing !== null) {
                    advance(function () { cursor.continue(lowestPossibleCasing + nextKeySuffix); });
                }
                else {
                    advance(resolve);
                }
                return false;
            }
        });
        return c;
    }
    function createRange(lower, upper, lowerOpen, upperOpen) {
        return {
            type: 2            ,
            lower: lower,
            upper: upper,
            lowerOpen: lowerOpen,
            upperOpen: upperOpen
        };
    }
    function rangeEqual(value) {
        return {
            type: 1            ,
            lower: value,
            upper: value
        };
    }

    var WhereClause =               (function () {
        function WhereClause() {
        }
        Object.defineProperty(WhereClause.prototype, "Collection", {
            get: function () {
                return this._ctx.table.db.Collection;
            },
            enumerable: true,
            configurable: true
        });
        WhereClause.prototype.between = function (lower, upper, includeLower, includeUpper) {
            includeLower = includeLower !== false;
            includeUpper = includeUpper === true;
            try {
                if ((this._cmp(lower, upper) > 0) ||
                    (this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)))
                    return emptyCollection(this);
                return new this.Collection(this, function () { return createRange(lower, upper, !includeLower, !includeUpper); });
            }
            catch (e) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
        };
        WhereClause.prototype.equals = function (value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () { return rangeEqual(value); });
        };
        WhereClause.prototype.above = function (value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () { return createRange(value, undefined, true); });
        };
        WhereClause.prototype.aboveOrEqual = function (value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () { return createRange(value, undefined, false); });
        };
        WhereClause.prototype.below = function (value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () { return createRange(undefined, value, false, true); });
        };
        WhereClause.prototype.belowOrEqual = function (value) {
            if (value == null)
                return fail(this, INVALID_KEY_ARGUMENT);
            return new this.Collection(this, function () { return createRange(undefined, value); });
        };
        WhereClause.prototype.startsWith = function (str) {
            if (typeof str !== 'string')
                return fail(this, STRING_EXPECTED);
            return this.between(str, str + maxString, true, true);
        };
        WhereClause.prototype.startsWithIgnoreCase = function (str) {
            if (str === "")
                return this.startsWith(str);
            return addIgnoreCaseAlgorithm(this, function (x, a) { return x.indexOf(a[0]) === 0; }, [str], maxString);
        };
        WhereClause.prototype.equalsIgnoreCase = function (str) {
            return addIgnoreCaseAlgorithm(this, function (x, a) { return x === a[0]; }, [str], "");
        };
        WhereClause.prototype.anyOfIgnoreCase = function () {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0)
                return emptyCollection(this);
            return addIgnoreCaseAlgorithm(this, function (x, a) { return a.indexOf(x) !== -1; }, set, "");
        };
        WhereClause.prototype.startsWithAnyOfIgnoreCase = function () {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0)
                return emptyCollection(this);
            return addIgnoreCaseAlgorithm(this, function (x, a) { return a.some(function (n) { return x.indexOf(n) === 0; }); }, set, maxString);
        };
        WhereClause.prototype.anyOf = function () {
            var _this = this;
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            var compare = this._cmp;
            try {
                set.sort(compare);
            }
            catch (e) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
            if (set.length === 0)
                return emptyCollection(this);
            var c = new this.Collection(this, function () { return createRange(set[0], set[set.length - 1]); });
            c._ondirectionchange = function (direction) {
                compare = (direction === "next" ?
                    _this._ascending :
                    _this._descending);
                set.sort(compare);
            };
            var i = 0;
            c._addAlgorithm(function (cursor, advance, resolve) {
                var key = cursor.key;
                while (compare(key, set[i]) > 0) {
                    ++i;
                    if (i === set.length) {
                        advance(resolve);
                        return false;
                    }
                }
                if (compare(key, set[i]) === 0) {
                    return true;
                }
                else {
                    advance(function () { cursor.continue(set[i]); });
                    return false;
                }
            });
            return c;
        };
        WhereClause.prototype.notEqual = function (value) {
            return this.inAnyRange([[minKey, value], [value, this.db._maxKey]], { includeLowers: false, includeUppers: false });
        };
        WhereClause.prototype.noneOf = function () {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (set.length === 0)
                return new this.Collection(this);
            try {
                set.sort(this._ascending);
            }
            catch (e) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
            var ranges = set.reduce(function (res, val) { return res ?
                res.concat([[res[res.length - 1][1], val]]) :
                [[minKey, val]]; }, null);
            ranges.push([set[set.length - 1], this.db._maxKey]);
            return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
        };
        WhereClause.prototype.inAnyRange = function (ranges, options) {
            var _this = this;
            var cmp = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
            if (ranges.length === 0)
                return emptyCollection(this);
            if (!ranges.every(function (range) {
                return range[0] !== undefined &&
                    range[1] !== undefined &&
                    ascending(range[0], range[1]) <= 0;
            })) {
                return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
            }
            var includeLowers = !options || options.includeLowers !== false;
            var includeUppers = options && options.includeUppers === true;
            function addRange(ranges, newRange) {
                var i = 0, l = ranges.length;
                for (; i < l; ++i) {
                    var range = ranges[i];
                    if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
                        range[0] = min(range[0], newRange[0]);
                        range[1] = max(range[1], newRange[1]);
                        break;
                    }
                }
                if (i === l)
                    ranges.push(newRange);
                return ranges;
            }
            var sortDirection = ascending;
            function rangeSorter(a, b) { return sortDirection(a[0], b[0]); }
            var set;
            try {
                set = ranges.reduce(addRange, []);
                set.sort(rangeSorter);
            }
            catch (ex) {
                return fail(this, INVALID_KEY_ARGUMENT);
            }
            var rangePos = 0;
            var keyIsBeyondCurrentEntry = includeUppers ?
                function (key) { return ascending(key, set[rangePos][1]) > 0; } :
                function (key) { return ascending(key, set[rangePos][1]) >= 0; };
            var keyIsBeforeCurrentEntry = includeLowers ?
                function (key) { return descending(key, set[rangePos][0]) > 0; } :
                function (key) { return descending(key, set[rangePos][0]) >= 0; };
            function keyWithinCurrentRange(key) {
                return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
            }
            var checkKey = keyIsBeyondCurrentEntry;
            var c = new this.Collection(this, function () { return createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers); });
            c._ondirectionchange = function (direction) {
                if (direction === "next") {
                    checkKey = keyIsBeyondCurrentEntry;
                    sortDirection = ascending;
                }
                else {
                    checkKey = keyIsBeforeCurrentEntry;
                    sortDirection = descending;
                }
                set.sort(rangeSorter);
            };
            c._addAlgorithm(function (cursor, advance, resolve) {
                var key = cursor.key;
                while (checkKey(key)) {
                    ++rangePos;
                    if (rangePos === set.length) {
                        advance(resolve);
                        return false;
                    }
                }
                if (keyWithinCurrentRange(key)) {
                    return true;
                }
                else if (_this._cmp(key, set[rangePos][1]) === 0 || _this._cmp(key, set[rangePos][0]) === 0) {
                    return false;
                }
                else {
                    advance(function () {
                        if (sortDirection === ascending)
                            cursor.continue(set[rangePos][0]);
                        else
                            cursor.continue(set[rangePos][1]);
                    });
                    return false;
                }
            });
            return c;
        };
        WhereClause.prototype.startsWithAnyOf = function () {
            var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
            if (!set.every(function (s) { return typeof s === 'string'; })) {
                return fail(this, "startsWithAnyOf() only works with strings");
            }
            if (set.length === 0)
                return emptyCollection(this);
            return this.inAnyRange(set.map(function (str) { return [str, str + maxString]; }));
        };
        return WhereClause;
    }());

    function createWhereClauseConstructor(db) {
        return makeClassConstructor(WhereClause.prototype, function WhereClause$$1(table, index, orCollection) {
            this.db = db;
            this._ctx = {
                table: table,
                index: index === ":id" ? null : index,
                or: orCollection
            };
            var indexedDB = db._deps.indexedDB;
            if (!indexedDB)
                throw new exceptions.MissingAPI("indexedDB API missing");
            this._cmp = this._ascending = indexedDB.cmp.bind(indexedDB);
            this._descending = function (a, b) { return indexedDB.cmp(b, a); };
            this._max = function (a, b) { return indexedDB.cmp(a, b) > 0 ? a : b; };
            this._min = function (a, b) { return indexedDB.cmp(a, b) < 0 ? a : b; };
            this._IDBKeyRange = db._deps.IDBKeyRange;
        });
    }

    function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
    }

    function getMaxKey(IdbKeyRange) {
        try {
            IdbKeyRange.only([[]]);
            return [[]];
        }
        catch (e) {
            return maxString;
        }
    }

    function eventRejectHandler(reject) {
        return wrap(function (event) {
            preventDefault(event);
            reject(event.target.error);
            return false;
        });
    }



    function preventDefault(event) {
        if (event.stopPropagation)
            event.stopPropagation();
        if (event.preventDefault)
            event.preventDefault();
    }

    var Transaction =               (function () {
        function Transaction() {
        }
        Transaction.prototype._lock = function () {
            assert(!PSD.global);
            ++this._reculock;
            if (this._reculock === 1 && !PSD.global)
                PSD.lockOwnerFor = this;
            return this;
        };
        Transaction.prototype._unlock = function () {
            assert(!PSD.global);
            if (--this._reculock === 0) {
                if (!PSD.global)
                    PSD.lockOwnerFor = null;
                while (this._blockedFuncs.length > 0 && !this._locked()) {
                    var fnAndPSD = this._blockedFuncs.shift();
                    try {
                        usePSD(fnAndPSD[1], fnAndPSD[0]);
                    }
                    catch (e) { }
                }
            }
            return this;
        };
        Transaction.prototype._locked = function () {
            return this._reculock && PSD.lockOwnerFor !== this;
        };
        Transaction.prototype.create = function (idbtrans) {
            var _this = this;
            if (!this.mode)
                return this;
            var idbdb = this.db.idbdb;
            var dbOpenError = this.db._state.dbOpenError;
            assert(!this.idbtrans);
            if (!idbtrans && !idbdb) {
                switch (dbOpenError && dbOpenError.name) {
                    case "DatabaseClosedError":
                        throw new exceptions.DatabaseClosed(dbOpenError);
                    case "MissingAPIError":
                        throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                    default:
                        throw new exceptions.OpenFailed(dbOpenError);
                }
            }
            if (!this.active)
                throw new exceptions.TransactionInactive();
            assert(this._completion._state === null);
            idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
            idbtrans.onerror = wrap(function (ev) {
                preventDefault(ev);
                _this._reject(idbtrans.error);
            });
            idbtrans.onabort = wrap(function (ev) {
                preventDefault(ev);
                _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
                _this.active = false;
                _this.on("abort").fire(ev);
            });
            idbtrans.oncomplete = wrap(function () {
                _this.active = false;
                _this._resolve();
            });
            return this;
        };
        Transaction.prototype._promise = function (mode, fn, bWriteLock) {
            var _this = this;
            if (mode === 'readwrite' && this.mode !== 'readwrite')
                return rejection(new exceptions.ReadOnly("Transaction is readonly"));
            if (!this.active)
                return rejection(new exceptions.TransactionInactive());
            if (this._locked()) {
                return new DexiePromise(function (resolve, reject) {
                    _this._blockedFuncs.push([function () {
                            _this._promise(mode, fn, bWriteLock).then(resolve, reject);
                        }, PSD]);
                });
            }
            else if (bWriteLock) {
                return newScope(function () {
                    var p = new DexiePromise(function (resolve, reject) {
                        _this._lock();
                        var rv = fn(resolve, reject, _this);
                        if (rv && rv.then)
                            rv.then(resolve, reject);
                    });
                    p.finally(function () { return _this._unlock(); });
                    p._lib = true;
                    return p;
                });
            }
            else {
                var p = new DexiePromise(function (resolve, reject) {
                    var rv = fn(resolve, reject, _this);
                    if (rv && rv.then)
                        rv.then(resolve, reject);
                });
                p._lib = true;
                return p;
            }
        };
        Transaction.prototype._root = function () {
            return this.parent ? this.parent._root() : this;
        };
        Transaction.prototype.waitFor = function (promiseLike) {
            var root = this._root();
            var promise = DexiePromise.resolve(promiseLike);
            if (root._waitingFor) {
                root._waitingFor = root._waitingFor.then(function () { return promise; });
            }
            else {
                root._waitingFor = promise;
                root._waitingQueue = [];
                var store = root.idbtrans.objectStore(root.storeNames[0]);
                (function spin() {
                    ++root._spinCount;
                    while (root._waitingQueue.length)
                        (root._waitingQueue.shift())();
                    if (root._waitingFor)
                        store.get(-Infinity).onsuccess = spin;
                }());
            }
            var currentWaitPromise = root._waitingFor;
            return new DexiePromise(function (resolve, reject) {
                promise.then(function (res) { return root._waitingQueue.push(wrap(resolve.bind(null, res))); }, function (err) { return root._waitingQueue.push(wrap(reject.bind(null, err))); }).finally(function () {
                    if (root._waitingFor === currentWaitPromise) {
                        root._waitingFor = null;
                    }
                });
            });
        };
        Transaction.prototype.abort = function () {
            this.active && this._reject(new exceptions.Abort());
            this.active = false;
        };
        Transaction.prototype.table = function (tableName) {
            var memoizedTables = (this._memoizedTables || (this._memoizedTables = {}));
            if (hasOwn(memoizedTables, tableName))
                return memoizedTables[tableName];
            var tableSchema = this.schema[tableName];
            if (!tableSchema) {
                throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            }
            var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
            transactionBoundTable.core = this.db.core.table(tableName);
            memoizedTables[tableName] = transactionBoundTable;
            return transactionBoundTable;
        };
        return Transaction;
    }());

    function createTransactionConstructor(db) {
        return makeClassConstructor(Transaction.prototype, function Transaction$$1(mode, storeNames, dbschema, parent) {
            var _this = this;
            this.db = db;
            this.mode = mode;
            this.storeNames = storeNames;
            this.schema = dbschema;
            this.idbtrans = null;
            this.on = Events(this, "complete", "error", "abort");
            this.parent = parent || null;
            this.active = true;
            this._reculock = 0;
            this._blockedFuncs = [];
            this._resolve = null;
            this._reject = null;
            this._waitingFor = null;
            this._waitingQueue = null;
            this._spinCount = 0;
            this._completion = new DexiePromise(function (resolve, reject) {
                _this._resolve = resolve;
                _this._reject = reject;
            });
            this._completion.then(function () {
                _this.active = false;
                _this.on.complete.fire();
            }, function (e) {
                var wasActive = _this.active;
                _this.active = false;
                _this.on.error.fire(e);
                _this.parent ?
                    _this.parent._reject(e) :
                    wasActive && _this.idbtrans && _this.idbtrans.abort();
                return rejection(e);
            });
        });
    }

    function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey) {
        return {
            name: name,
            keyPath: keyPath,
            unique: unique,
            multi: multi,
            auto: auto,
            compound: compound,
            src: (unique && !isPrimKey ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + nameFromKeyPath(keyPath)
        };
    }
    function nameFromKeyPath(keyPath) {
        return typeof keyPath === 'string' ?
            keyPath :
            keyPath ? ('[' + [].join.call(keyPath, '+') + ']') : "";
    }

    function createTableSchema(name, primKey, indexes) {
        return {
            name: name,
            primKey: primKey,
            indexes: indexes,
            mappedClass: null,
            idxByName: arrayToObject(indexes, function (index) { return [index.name, index]; })
        };
    }

    function getKeyExtractor(keyPath) {
        if (keyPath == null) {
            return function () { return undefined; };
        }
        else if (typeof keyPath === 'string') {
            return getSinglePathKeyExtractor(keyPath);
        }
        else {
            return function (obj) { return getByKeyPath(obj, keyPath); };
        }
    }
    function getSinglePathKeyExtractor(keyPath) {
        var split = keyPath.split('.');
        if (split.length === 1) {
            return function (obj) { return obj[keyPath]; };
        }
        else {
            return function (obj) { return getByKeyPath(obj, keyPath); };
        }
    }

    function getEffectiveKeys(primaryKey, req) {
        if (req.type === 'delete')
            return req.keys;
        return req.keys || req.values.map(primaryKey.extractKey);
    }
    function getExistingValues(table, req, effectiveKeys) {
        return req.type === 'add' ? Promise.resolve(new Array(req.values.length)) :
            table.getMany({ trans: req.trans, keys: effectiveKeys });
    }

    function arrayify(arrayLike) {
        return [].slice.call(arrayLike);
    }

    var _id_counter = 0;
    function getKeyPathAlias(keyPath) {
        return keyPath == null ?
            ":id" :
            typeof keyPath === 'string' ?
                keyPath :
                "[" + keyPath.join('+') + "]";
    }
    function createDBCore(db, indexedDB, IdbKeyRange, tmpTrans) {
        var cmp = indexedDB.cmp.bind(indexedDB);
        function extractSchema(db, trans) {
            var tables = arrayify(db.objectStoreNames);
            return {
                schema: {
                    name: db.name,
                    tables: tables.map(function (table) { return trans.objectStore(table); }).map(function (store) {
                        var keyPath = store.keyPath, autoIncrement = store.autoIncrement;
                        var compound = isArray(keyPath);
                        var outbound = keyPath == null;
                        var indexByKeyPath = {};
                        var result = {
                            name: store.name,
                            primaryKey: {
                                name: null,
                                isPrimaryKey: true,
                                outbound: outbound,
                                compound: compound,
                                keyPath: keyPath,
                                autoIncrement: autoIncrement,
                                unique: true,
                                extractKey: getKeyExtractor(keyPath)
                            },
                            indexes: arrayify(store.indexNames).map(function (indexName) { return store.index(indexName); })
                                .map(function (index) {
                                var name = index.name, unique = index.unique, multiEntry = index.multiEntry, keyPath = index.keyPath;
                                var compound = isArray(keyPath);
                                var result = {
                                    name: name,
                                    compound: compound,
                                    keyPath: keyPath,
                                    unique: unique,
                                    multiEntry: multiEntry,
                                    extractKey: getKeyExtractor(keyPath)
                                };
                                indexByKeyPath[getKeyPathAlias(keyPath)] = result;
                                return result;
                            }),
                            getIndexByKeyPath: function (keyPath) { return indexByKeyPath[getKeyPathAlias(keyPath)]; }
                        };
                        indexByKeyPath[":id"] = result.primaryKey;
                        if (keyPath != null) {
                            indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
                        }
                        return result;
                    })
                },
                hasGetAll: tables.length > 0 && ('getAll' in trans.objectStore(tables[0])) &&
                    !(typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
                        !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
                        [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604)
            };
        }
        function makeIDBKeyRange(range) {
            if (range.type === 3          )
                return null;
            if (range.type === 4            )
                throw new Error("Cannot convert never type to IDBKeyRange");
            var lower = range.lower, upper = range.upper, lowerOpen = range.lowerOpen, upperOpen = range.upperOpen;
            var idbRange = lower === undefined ?
                upper === undefined ?
                    null :
                    IdbKeyRange.upperBound(upper, !!upperOpen) :
                upper === undefined ?
                    IdbKeyRange.lowerBound(lower, !!lowerOpen) :
                    IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
            return idbRange;
        }
        function createDbCoreTable(tableSchema) {
            var tableName = tableSchema.name;
            function mutate(_a) {
                var trans = _a.trans, type = _a.type, keys$$1 = _a.keys, values = _a.values, range = _a.range, wantResults = _a.wantResults;
                return new Promise(function (resolve, reject) {
                    resolve = wrap(resolve);
                    var store = trans.objectStore(tableName);
                    var outbound = store.keyPath == null;
                    var isAddOrPut = type === "put" || type === "add";
                    if (!isAddOrPut && type !== 'delete' && type !== 'deleteRange')
                        throw new Error("Invalid operation type: " + type);
                    var length = (keys$$1 || values || { length: 1 }).length;
                    if (keys$$1 && values && keys$$1.length !== values.length) {
                        throw new Error("Given keys array must have same length as given values array.");
                    }
                    if (length === 0)
                        return resolve({ numFailures: 0, failures: {}, results: [], lastResult: undefined });
                    var results = wantResults && __spreadArrays((keys$$1 ?
                        keys$$1 :
                        getEffectiveKeys(tableSchema.primaryKey, { type: type, keys: keys$$1, values: values })));
                    var req;
                    var failures = [];
                    var numFailures = 0;
                    var errorHandler = function (event) {
                        ++numFailures;
                        preventDefault(event);
                        if (results)
                            results[event.target._reqno] = undefined;
                        failures[event.target._reqno] = event.target.error;
                    };
                    var setResult = function (_a) {
                        var target = _a.target;
                        results[target._reqno] = target.result;
                    };
                    if (type === 'deleteRange') {
                        if (range.type === 4            )
                            return resolve({ numFailures: numFailures, failures: failures, results: results, lastResult: undefined });
                        if (range.type === 3          )
                            req = store.clear();
                        else
                            req = store.delete(makeIDBKeyRange(range));
                    }
                    else {
                        var _a = isAddOrPut ?
                            outbound ?
                                [values, keys$$1] :
                                [values, null] :
                            [keys$$1, null], args1 = _a[0], args2 = _a[1];
                        if (isAddOrPut) {
                            for (var i = 0; i < length; ++i) {
                                req = (args2 && args2[i] !== undefined ?
                                    store[type](args1[i], args2[i]) :
                                    store[type](args1[i]));
                                req._reqno = i;
                                if (results && results[i] === undefined) {
                                    req.onsuccess = setResult;
                                }
                                req.onerror = errorHandler;
                            }
                        }
                        else {
                            for (var i = 0; i < length; ++i) {
                                req = store[type](args1[i]);
                                req._reqno = i;
                                req.onerror = errorHandler;
                            }
                        }
                    }
                    var done = function (event) {
                        var lastResult = event.target.result;
                        if (results)
                            results[length - 1] = lastResult;
                        resolve({
                            numFailures: numFailures,
                            failures: failures,
                            results: results,
                            lastResult: lastResult
                        });
                    };
                    req.onerror = function (event) {
                        errorHandler(event);
                        done(event);
                    };
                    req.onsuccess = done;
                });
            }
            function openCursor(_a) {
                var trans = _a.trans, values = _a.values, query = _a.query, reverse = _a.reverse, unique = _a.unique;
                return new Promise(function (resolve, reject) {
                    resolve = wrap(resolve);
                    var index = query.index, range = query.range;
                    var store = trans.objectStore(tableName);
                    var source = index.isPrimaryKey ?
                        store :
                        store.index(index.name);
                    var direction = reverse ?
                        unique ?
                            "prevunique" :
                            "prev" :
                        unique ?
                            "nextunique" :
                            "next";
                    var req = values || !('openKeyCursor' in source) ?
                        source.openCursor(makeIDBKeyRange(range), direction) :
                        source.openKeyCursor(makeIDBKeyRange(range), direction);
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = wrap(function (ev) {
                        var cursor = req.result;
                        if (!cursor) {
                            resolve(null);
                            return;
                        }
                        cursor.___id = ++_id_counter;
                        cursor.done = false;
                        var _cursorContinue = cursor.continue.bind(cursor);
                        var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                        if (_cursorContinuePrimaryKey)
                            _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                        var _cursorAdvance = cursor.advance.bind(cursor);
                        var doThrowCursorIsNotStarted = function () { throw new Error("Cursor not started"); };
                        var doThrowCursorIsStopped = function () { throw new Error("Cursor not stopped"); };
                        cursor.trans = trans;
                        cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                        cursor.fail = wrap(reject);
                        cursor.next = function () {
                            var _this = this;
                            var gotOne = 1;
                            return this.start(function () { return gotOne-- ? _this.continue() : _this.stop(); }).then(function () { return _this; });
                        };
                        cursor.start = function (callback) {
                            var iterationPromise = new Promise(function (resolveIteration, rejectIteration) {
                                resolveIteration = wrap(resolveIteration);
                                req.onerror = eventRejectHandler(rejectIteration);
                                cursor.fail = rejectIteration;
                                cursor.stop = function (value) {
                                    cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                                    resolveIteration(value);
                                };
                            });
                            var guardedCallback = function () {
                                if (req.result) {
                                    try {
                                        callback();
                                    }
                                    catch (err) {
                                        cursor.fail(err);
                                    }
                                }
                                else {
                                    cursor.done = true;
                                    cursor.start = function () { throw new Error("Cursor behind last entry"); };
                                    cursor.stop();
                                }
                            };
                            req.onsuccess = wrap(function (ev) {
                                req.onsuccess = guardedCallback;
                                guardedCallback();
                            });
                            cursor.continue = _cursorContinue;
                            cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                            cursor.advance = _cursorAdvance;
                            guardedCallback();
                            return iterationPromise;
                        };
                        resolve(cursor);
                    }, reject);
                });
            }
            function query(hasGetAll) {
                return function (request) {
                    return new Promise(function (resolve, reject) {
                        resolve = wrap(resolve);
                        var trans = request.trans, values = request.values, limit = request.limit, query = request.query;
                        var nonInfinitLimit = limit === Infinity ? undefined : limit;
                        var index = query.index, range = query.range;
                        var store = trans.objectStore(tableName);
                        var source = index.isPrimaryKey ? store : store.index(index.name);
                        var idbKeyRange = makeIDBKeyRange(range);
                        if (limit === 0)
                            return resolve({ result: [] });
                        if (hasGetAll) {
                            var req = values ?
                                source.getAll(idbKeyRange, nonInfinitLimit) :
                                source.getAllKeys(idbKeyRange, nonInfinitLimit);
                            req.onsuccess = function (event) { return resolve({ result: event.target.result }); };
                            req.onerror = eventRejectHandler(reject);
                        }
                        else {
                            var count_1 = 0;
                            var req_1 = values || !('openKeyCursor' in source) ?
                                source.openCursor(idbKeyRange) :
                                source.openKeyCursor(idbKeyRange);
                            var result_1 = [];
                            req_1.onsuccess = function (event) {
                                var cursor = req_1.result;
                                if (!cursor)
                                    return resolve({ result: result_1 });
                                result_1.push(values ? cursor.value : cursor.primaryKey);
                                if (++count_1 === limit)
                                    return resolve({ result: result_1 });
                                cursor.continue();
                            };
                            req_1.onerror = eventRejectHandler(reject);
                        }
                    });
                };
            }
            return {
                name: tableName,
                schema: tableSchema,
                mutate: mutate,
                getMany: function (_a) {
                    var trans = _a.trans, keys$$1 = _a.keys;
                    return new Promise(function (resolve, reject) {
                        resolve = wrap(resolve);
                        var store = trans.objectStore(tableName);
                        var length = keys$$1.length;
                        var result = new Array(length);
                        var keyCount = 0;
                        var callbackCount = 0;
                        var req;
                        var successHandler = function (event) {
                            var req = event.target;
                            if ((result[req._pos] = req.result) != null)
                                ;
                            if (++callbackCount === keyCount)
                                resolve(result);
                        };
                        var errorHandler = eventRejectHandler(reject);
                        for (var i = 0; i < length; ++i) {
                            var key = keys$$1[i];
                            if (key != null) {
                                req = store.get(keys$$1[i]);
                                req._pos = i;
                                req.onsuccess = successHandler;
                                req.onerror = errorHandler;
                                ++keyCount;
                            }
                        }
                        if (keyCount === 0)
                            resolve(result);
                    });
                },
                get: function (_a) {
                    var trans = _a.trans, key = _a.key;
                    return new Promise(function (resolve, reject) {
                        resolve = wrap(resolve);
                        var store = trans.objectStore(tableName);
                        var req = store.get(key);
                        req.onsuccess = function (event) { return resolve(event.target.result); };
                        req.onerror = eventRejectHandler(reject);
                    });
                },
                query: query(hasGetAll),
                openCursor: openCursor,
                count: function (_a) {
                    var query = _a.query, trans = _a.trans;
                    var index = query.index, range = query.range;
                    return new Promise(function (resolve, reject) {
                        var store = trans.objectStore(tableName);
                        var source = index.isPrimaryKey ? store : store.index(index.name);
                        var idbKeyRange = makeIDBKeyRange(range);
                        var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                        req.onsuccess = wrap(function (ev) { return resolve(ev.target.result); });
                        req.onerror = eventRejectHandler(reject);
                    });
                }
            };
        }
        var _a = extractSchema(db, tmpTrans), schema = _a.schema, hasGetAll = _a.hasGetAll;
        var tables = schema.tables.map(function (tableSchema) { return createDbCoreTable(tableSchema); });
        var tableMap = {};
        tables.forEach(function (table) { return tableMap[table.name] = table; });
        return {
            stack: "dbcore",
            transaction: db.transaction.bind(db),
            table: function (name) {
                var result = tableMap[name];
                if (!result)
                    throw new Error("Table '" + name + "' not found");
                return tableMap[name];
            },
            cmp: cmp,
            MIN_KEY: -Infinity,
            MAX_KEY: getMaxKey(IdbKeyRange),
            schema: schema
        };
    }

    function createMiddlewareStack(stackImpl, middlewares) {
        return middlewares.reduce(function (down, _a) {
            var create = _a.create;
            return (__assign(__assign({}, down), create(down)));
        }, stackImpl);
    }
    function createMiddlewareStacks(middlewares, idbdb, _a, tmpTrans) {
        var IDBKeyRange = _a.IDBKeyRange, indexedDB = _a.indexedDB;
        var dbcore = createMiddlewareStack(createDBCore(idbdb, indexedDB, IDBKeyRange, tmpTrans), middlewares.dbcore);
        return {
            dbcore: dbcore
        };
    }
    function generateMiddlewareStacks(db, tmpTrans) {
        var idbdb = tmpTrans.db;
        var stacks = createMiddlewareStacks(db._middlewares, idbdb, db._deps, tmpTrans);
        db.core = stacks.dbcore;
        db.tables.forEach(function (table) {
            var tableName = table.name;
            if (db.core.schema.tables.some(function (tbl) { return tbl.name === tableName; })) {
                table.core = db.core.table(tableName);
                if (db[tableName] instanceof db.Table) {
                    db[tableName].core = table.core;
                }
            }
        });
    }

    function setApiOnPlace(db, objs, tableNames, dbschema) {
        tableNames.forEach(function (tableName) {
            var schema = dbschema[tableName];
            objs.forEach(function (obj) {
                var propDesc = getPropertyDescriptor(obj, tableName);
                if (!propDesc || ("value" in propDesc && propDesc.value === undefined)) {
                    if (obj === db.Transaction.prototype || obj instanceof db.Transaction) {
                        setProp(obj, tableName, {
                            get: function () { return this.table(tableName); },
                            set: function (value) {
                                defineProperty(this, tableName, { value: value, writable: true, configurable: true, enumerable: true });
                            }
                        });
                    }
                    else {
                        obj[tableName] = new db.Table(tableName, schema);
                    }
                }
            });
        });
    }
    function removeTablesApi(db, objs) {
        objs.forEach(function (obj) {
            for (var key in obj) {
                if (obj[key] instanceof db.Table)
                    delete obj[key];
            }
        });
    }
    function lowerVersionFirst(a, b) {
        return a._cfg.version - b._cfg.version;
    }
    function runUpgraders(db, oldVersion, idbUpgradeTrans, reject) {
        var globalSchema = db._dbSchema;
        var trans = db._createTransaction('readwrite', db._storeNames, globalSchema);
        trans.create(idbUpgradeTrans);
        trans._completion.catch(reject);
        var rejectTransaction = trans._reject.bind(trans);
        var transless = PSD.transless || PSD;
        newScope(function () {
            PSD.trans = trans;
            PSD.transless = transless;
            if (oldVersion === 0) {
                keys(globalSchema).forEach(function (tableName) {
                    createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                });
                generateMiddlewareStacks(db, idbUpgradeTrans);
                DexiePromise.follow(function () { return db.on.populate.fire(trans); }).catch(rejectTransaction);
            }
            else
                updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans).catch(rejectTransaction);
        });
    }
    function updateTablesAndIndexes(db, oldVersion, trans, idbUpgradeTrans) {
        var queue = [];
        var versions = db._versions;
        var globalSchema = db._dbSchema = buildGlobalSchema(db, db.idbdb, idbUpgradeTrans);
        var anyContentUpgraderHasRun = false;
        var versToRun = versions.filter(function (v) { return v._cfg.version >= oldVersion; });
        versToRun.forEach(function (version) {
            queue.push(function () {
                var oldSchema = globalSchema;
                var newSchema = version._cfg.dbschema;
                adjustToExistingIndexNames(db, oldSchema, idbUpgradeTrans);
                adjustToExistingIndexNames(db, newSchema, idbUpgradeTrans);
                globalSchema = db._dbSchema = newSchema;
                var diff = getSchemaDiff(oldSchema, newSchema);
                diff.add.forEach(function (tuple) {
                    createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                });
                diff.change.forEach(function (change) {
                    if (change.recreate) {
                        throw new exceptions.Upgrade("Not yet support for changing primary key");
                    }
                    else {
                        var store_1 = idbUpgradeTrans.objectStore(change.name);
                        change.add.forEach(function (idx) { return addIndex(store_1, idx); });
                        change.change.forEach(function (idx) {
                            store_1.deleteIndex(idx.name);
                            addIndex(store_1, idx);
                        });
                        change.del.forEach(function (idxName) { return store_1.deleteIndex(idxName); });
                    }
                });
                var contentUpgrade = version._cfg.contentUpgrade;
                if (contentUpgrade && version._cfg.version > oldVersion) {
                    generateMiddlewareStacks(db, idbUpgradeTrans);
                    trans._memoizedTables = {};
                    anyContentUpgraderHasRun = true;
                    var upgradeSchema_1 = shallowClone(newSchema);
                    diff.del.forEach(function (table) {
                        upgradeSchema_1[table] = oldSchema[table];
                    });
                    removeTablesApi(db, [db.Transaction.prototype]);
                    setApiOnPlace(db, [db.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
                    trans.schema = upgradeSchema_1;
                    var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
                    if (contentUpgradeIsAsync_1) {
                        incrementExpectedAwaits();
                    }
                    var returnValue_1;
                    var promiseFollowed = DexiePromise.follow(function () {
                        returnValue_1 = contentUpgrade(trans);
                        if (returnValue_1) {
                            if (contentUpgradeIsAsync_1) {
                                var decrementor = decrementExpectedAwaits.bind(null, null);
                                returnValue_1.then(decrementor, decrementor);
                            }
                        }
                    });
                    return (returnValue_1 && typeof returnValue_1.then === 'function' ?
                        DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function () { return returnValue_1; }));
                }
            });
            queue.push(function (idbtrans) {
                if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
                    var newSchema = version._cfg.dbschema;
                    deleteRemovedTables(newSchema, idbtrans);
                }
                removeTablesApi(db, [db.Transaction.prototype]);
                setApiOnPlace(db, [db.Transaction.prototype], db._storeNames, db._dbSchema);
                trans.schema = db._dbSchema;
            });
        });
        function runQueue() {
            return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) :
                DexiePromise.resolve();
        }
        return runQueue().then(function () {
            createMissingTables(globalSchema, idbUpgradeTrans);
        });
    }
    function getSchemaDiff(oldSchema, newSchema) {
        var diff = {
            del: [],
            add: [],
            change: []
        };
        var table;
        for (table in oldSchema) {
            if (!newSchema[table])
                diff.del.push(table);
        }
        for (table in newSchema) {
            var oldDef = oldSchema[table], newDef = newSchema[table];
            if (!oldDef) {
                diff.add.push([table, newDef]);
            }
            else {
                var change = {
                    name: table,
                    def: newDef,
                    recreate: false,
                    del: [],
                    add: [],
                    change: []
                };
                if ((
                '' + (oldDef.primKey.keyPath || '')) !== ('' + (newDef.primKey.keyPath || '')) ||
                    (oldDef.primKey.auto !== newDef.primKey.auto && !isIEOrEdge))
                 {
                    change.recreate = true;
                    diff.change.push(change);
                }
                else {
                    var oldIndexes = oldDef.idxByName;
                    var newIndexes = newDef.idxByName;
                    var idxName = void 0;
                    for (idxName in oldIndexes) {
                        if (!newIndexes[idxName])
                            change.del.push(idxName);
                    }
                    for (idxName in newIndexes) {
                        var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                        if (!oldIdx)
                            change.add.push(newIdx);
                        else if (oldIdx.src !== newIdx.src)
                            change.change.push(newIdx);
                    }
                    if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                        diff.change.push(change);
                    }
                }
            }
        }
        return diff;
    }
    function createTable(idbtrans, tableName, primKey, indexes) {
        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ?
            { keyPath: primKey.keyPath, autoIncrement: primKey.auto } :
            { autoIncrement: primKey.auto });
        indexes.forEach(function (idx) { return addIndex(store, idx); });
        return store;
    }
    function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(function (tableName) {
            if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
            }
        });
    }
    function deleteRemovedTables(newSchema, idbtrans) {
        for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
            var storeName = idbtrans.db.objectStoreNames[i];
            if (newSchema[storeName] == null) {
                idbtrans.db.deleteObjectStore(storeName);
            }
        }
    }
    function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
    }
    function buildGlobalSchema(db, idbdb, tmpTrans) {
        var globalSchema = {};
        var dbStoreNames = slice(idbdb.objectStoreNames, 0);
        dbStoreNames.forEach(function (storeName) {
            var store = tmpTrans.objectStore(storeName);
            var keyPath = store.keyPath;
            var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
            var indexes = [];
            for (var j = 0; j < store.indexNames.length; ++j) {
                var idbindex = store.index(store.indexNames[j]);
                keyPath = idbindex.keyPath;
                var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
                indexes.push(index);
            }
            globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
        });
        return globalSchema;
    }
    function readGlobalSchema(db, idbdb, tmpTrans) {
        db.verno = idbdb.version / 10;
        var globalSchema = db._dbSchema = buildGlobalSchema(db, idbdb, tmpTrans);
        db._storeNames = slice(idbdb.objectStoreNames, 0);
        setApiOnPlace(db, [db._allTables], keys(globalSchema), globalSchema);
    }
    function verifyInstalledSchema(db, tmpTrans) {
        var installedSchema = buildGlobalSchema(db, db.idbdb, tmpTrans);
        var diff = getSchemaDiff(installedSchema, db._dbSchema);
        return !(diff.add.length || diff.change.some(function (ch) { return ch.add.length || ch.change.length; }));
    }
    function adjustToExistingIndexNames(db, schema, idbtrans) {
        var storeNames = idbtrans.db.objectStoreNames;
        for (var i = 0; i < storeNames.length; ++i) {
            var storeName = storeNames[i];
            var store = idbtrans.objectStore(storeName);
            db._hasGetAll = 'getAll' in store;
            for (var j = 0; j < store.indexNames.length; ++j) {
                var indexName = store.indexNames[j];
                var keyPath = store.index(indexName).keyPath;
                var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
                if (schema[storeName]) {
                    var indexSpec = schema[storeName].idxByName[dexieName];
                    if (indexSpec) {
                        indexSpec.name = indexName;
                        delete schema[storeName].idxByName[dexieName];
                        schema[storeName].idxByName[indexName] = indexSpec;
                    }
                }
            }
        }
        if (typeof navigator !== 'undefined' && /Safari/.test(navigator.userAgent) &&
            !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
            _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope &&
            [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
            db._hasGetAll = false;
        }
    }
    function parseIndexSyntax(primKeyAndIndexes) {
        return primKeyAndIndexes.split(',').map(function (index, indexNum) {
            index = index.trim();
            var name = index.replace(/([&*]|\+\+)/g, "");
            var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;
            return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray(keyPath), indexNum === 0);
        });
    }

    var Version =               (function () {
        function Version() {
        }
        Version.prototype._parseStoresSpec = function (stores, outSchema) {
            keys(stores).forEach(function (tableName) {
                if (stores[tableName] !== null) {
                    var indexes = parseIndexSyntax(stores[tableName]);
                    var primKey = indexes.shift();
                    if (primKey.multi)
                        throw new exceptions.Schema("Primary key cannot be multi-valued");
                    indexes.forEach(function (idx) {
                        if (idx.auto)
                            throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                        if (!idx.keyPath)
                            throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                    });
                    outSchema[tableName] = createTableSchema(tableName, primKey, indexes);
                }
            });
        };
        Version.prototype.stores = function (stores) {
            var db = this.db;
            this._cfg.storesSource = this._cfg.storesSource ?
                extend(this._cfg.storesSource, stores) :
                stores;
            var versions = db._versions;
            var storesSpec = {};
            var dbschema = {};
            versions.forEach(function (version) {
                extend(storesSpec, version._cfg.storesSource);
                dbschema = (version._cfg.dbschema = {});
                version._parseStoresSpec(storesSpec, dbschema);
            });
            db._dbSchema = dbschema;
            removeTablesApi(db, [db._allTables, db, db.Transaction.prototype]);
            setApiOnPlace(db, [db._allTables, db, db.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
            db._storeNames = keys(dbschema);
            return this;
        };
        Version.prototype.upgrade = function (upgradeFunction) {
            this._cfg.contentUpgrade = upgradeFunction;
            return this;
        };
        return Version;
    }());

    function createVersionConstructor(db) {
        return makeClassConstructor(Version.prototype, function Version$$1(versionNumber) {
            this.db = db;
            this._cfg = {
                version: versionNumber,
                storesSource: null,
                dbschema: {},
                tables: {},
                contentUpgrade: null
            };
        });
    }

    var databaseEnumerator;
    function DatabaseEnumerator(indexedDB) {
        var hasDatabasesNative = indexedDB && typeof indexedDB.databases === 'function';
        var dbNamesTable;
        if (!hasDatabasesNative) {
            var db = new Dexie(DBNAMES_DB, { addons: [] });
            db.version(1).stores({ dbnames: 'name' });
            dbNamesTable = db.table('dbnames');
        }
        return {
            getDatabaseNames: function () {
                return hasDatabasesNative
                    ?
                        DexiePromise.resolve(indexedDB.databases()).then(function (infos) { return infos
                            .map(function (info) { return info.name; })
                            .filter(function (name) { return name !== DBNAMES_DB; }); })
                    :
                        dbNamesTable.toCollection().primaryKeys();
            },
            add: function (name) {
                return !hasDatabasesNative && name !== DBNAMES_DB && dbNamesTable.put({ name: name }).catch(nop);
            },
            remove: function (name) {
                return !hasDatabasesNative && name !== DBNAMES_DB && dbNamesTable.delete(name).catch(nop);
            }
        };
    }
    function initDatabaseEnumerator(indexedDB) {
        try {
            databaseEnumerator = DatabaseEnumerator(indexedDB);
        }
        catch (e) { }
    }

    function vip(fn) {
        return newScope(function () {
            PSD.letThrough = true;
            return fn();
        });
    }

    function dexieOpen(db) {
        var state = db._state;
        var indexedDB = db._deps.indexedDB;
        if (state.isBeingOpened || db.idbdb)
            return state.dbReadyPromise.then(function () { return state.dbOpenError ?
                rejection(state.dbOpenError) :
                db; });
        debug && (state.openCanceller._stackHolder = getErrorWithStack());
        state.isBeingOpened = true;
        state.dbOpenError = null;
        state.openComplete = false;
        var resolveDbReady = state.dbReadyResolve,
        upgradeTransaction = null;
        return DexiePromise.race([state.openCanceller, new DexiePromise(function (resolve, reject) {
                if (!indexedDB)
                    throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL " +
                        "(not locally). If using old Safari versions, make sure to include indexedDB polyfill.");
                var dbName = db.name;
                var req = state.autoSchema ?
                    indexedDB.open(dbName) :
                    indexedDB.open(dbName, Math.round(db.verno * 10));
                if (!req)
                    throw new exceptions.MissingAPI("IndexedDB API not available");
                req.onerror = eventRejectHandler(reject);
                req.onblocked = wrap(db._fireOnBlocked);
                req.onupgradeneeded = wrap(function (e) {
                    upgradeTransaction = req.transaction;
                    if (state.autoSchema && !db._options.allowEmptyDB) {
                        req.onerror = preventDefault;
                        upgradeTransaction.abort();
                        req.result.close();
                        var delreq = indexedDB.deleteDatabase(dbName);
                        delreq.onsuccess = delreq.onerror = wrap(function () {
                            reject(new exceptions.NoSuchDatabase("Database " + dbName + " doesnt exist"));
                        });
                    }
                    else {
                        upgradeTransaction.onerror = eventRejectHandler(reject);
                        var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
                        db.idbdb = req.result;
                        runUpgraders(db, oldVer / 10, upgradeTransaction, reject);
                    }
                }, reject);
                req.onsuccess = wrap(function () {
                    upgradeTransaction = null;
                    var idbdb = db.idbdb = req.result;
                    var objectStoreNames = slice(idbdb.objectStoreNames);
                    if (objectStoreNames.length > 0)
                        try {
                            var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), 'readonly');
                            if (state.autoSchema)
                                readGlobalSchema(db, idbdb, tmpTrans);
                            else {
                                adjustToExistingIndexNames(db, db._dbSchema, tmpTrans);
                                if (!verifyInstalledSchema(db, tmpTrans)) {
                                    console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Some queries may fail.");
                                }
                            }
                            generateMiddlewareStacks(db, tmpTrans);
                        }
                        catch (e) {
                        }
                    connections.push(db);
                    idbdb.onversionchange = wrap(function (ev) {
                        state.vcFired = true;
                        db.on("versionchange").fire(ev);
                    });
                    databaseEnumerator.add(dbName);
                    resolve();
                }, reject);
            })]).then(function () {
            state.onReadyBeingFired = [];
            return DexiePromise.resolve(vip(db.on.ready.fire)).then(function fireRemainders() {
                if (state.onReadyBeingFired.length > 0) {
                    var remainders = state.onReadyBeingFired.reduce(promisableChain, nop);
                    state.onReadyBeingFired = [];
                    return DexiePromise.resolve(vip(remainders)).then(fireRemainders);
                }
            });
        }).finally(function () {
            state.onReadyBeingFired = null;
        }).then(function () {
            state.isBeingOpened = false;
            return db;
        }).catch(function (err) {
            try {
                upgradeTransaction && upgradeTransaction.abort();
            }
            catch (e) { }
            state.isBeingOpened = false;
            db.close();
            state.dbOpenError = err;
            return rejection(state.dbOpenError);
        }).finally(function () {
            state.openComplete = true;
            resolveDbReady();
        });
    }

    function awaitIterator(iterator) {
        var callNext = function (result) { return iterator.next(result); }, doThrow = function (error) { return iterator.throw(error); }, onSuccess = step(callNext), onError = step(doThrow);
        function step(getNext) {
            return function (val) {
                var next = getNext(val), value = next.value;
                return next.done ? value :
                    (!value || typeof value.then !== 'function' ?
                        isArray(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) :
                        value.then(onSuccess, onError));
            };
        }
        return step(callNext)();
    }

    function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
        var i = arguments.length;
        if (i < 2)
            throw new exceptions.InvalidArgument("Too few arguments");
        var args = new Array(i - 1);
        while (--i)
            args[i - 1] = arguments[i];
        scopeFunc = args.pop();
        var tables = flatten(args);
        return [mode, tables, scopeFunc];
    }
    function enterTransactionScope(db, mode, storeNames, parentTransaction, scopeFunc) {
        return DexiePromise.resolve().then(function () {
            var transless = PSD.transless || PSD;
            var trans = db._createTransaction(mode, storeNames, db._dbSchema, parentTransaction);
            var zoneProps = {
                trans: trans,
                transless: transless
            };
            if (parentTransaction) {
                trans.idbtrans = parentTransaction.idbtrans;
            }
            else {
                trans.create();
            }
            var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
            if (scopeFuncIsAsync) {
                incrementExpectedAwaits();
            }
            var returnValue;
            var promiseFollowed = DexiePromise.follow(function () {
                returnValue = scopeFunc.call(trans, trans);
                if (returnValue) {
                    if (scopeFuncIsAsync) {
                        var decrementor = decrementExpectedAwaits.bind(null, null);
                        returnValue.then(decrementor, decrementor);
                    }
                    else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
                        returnValue = awaitIterator(returnValue);
                    }
                }
            }, zoneProps);
            return (returnValue && typeof returnValue.then === 'function' ?
                DexiePromise.resolve(returnValue).then(function (x) { return trans.active ?
                    x
                    : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn")); })
                : promiseFollowed.then(function () { return returnValue; })).then(function (x) {
                if (parentTransaction)
                    trans._resolve();
                return trans._completion.then(function () { return x; });
            }).catch(function (e) {
                trans._reject(e);
                return rejection(e);
            });
        });
    }

    function pad(a, value, count) {
        var result = isArray(a) ? a.slice() : [a];
        for (var i = 0; i < count; ++i)
            result.push(value);
        return result;
    }
    function createVirtualIndexMiddleware(down) {
        return __assign(__assign({}, down), { table: function (tableName) {
                var table = down.table(tableName);
                var schema = table.schema;
                var indexLookup = {};
                var allVirtualIndexes = [];
                function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
                    var keyPathAlias = getKeyPathAlias(keyPath);
                    var indexList = (indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || []);
                    var keyLength = keyPath == null ? 0 : typeof keyPath === 'string' ? 1 : keyPath.length;
                    var isVirtual = keyTail > 0;
                    var virtualIndex = __assign(__assign({}, lowLevelIndex), { isVirtual: isVirtual, isPrimaryKey: !isVirtual && lowLevelIndex.isPrimaryKey, keyTail: keyTail,
                        keyLength: keyLength, extractKey: getKeyExtractor(keyPath), unique: !isVirtual && lowLevelIndex.unique });
                    indexList.push(virtualIndex);
                    if (!virtualIndex.isPrimaryKey) {
                        allVirtualIndexes.push(virtualIndex);
                    }
                    if (keyLength > 1) {
                        var virtualKeyPath = keyLength === 2 ?
                            keyPath[0] :
                            keyPath.slice(0, keyLength - 1);
                        addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
                    }
                    indexList.sort(function (a, b) { return a.keyTail - b.keyTail; });
                    return virtualIndex;
                }
                var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
                indexLookup[":id"] = [primaryKey];
                for (var _i = 0, _a = schema.indexes; _i < _a.length; _i++) {
                    var index = _a[_i];
                    addVirtualIndexes(index.keyPath, 0, index);
                }
                function findBestIndex(keyPath) {
                    var result = indexLookup[getKeyPathAlias(keyPath)];
                    return result && result[0];
                }
                function translateRange(range, keyTail) {
                    return {
                        type: range.type === 1             ?
                            2             :
                            range.type,
                        lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
                        lowerOpen: true,
                        upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
                        upperOpen: true
                    };
                }
                function translateRequest(req) {
                    var index = req.query.index;
                    return index.isVirtual ? __assign(__assign({}, req), { query: {
                            index: index,
                            range: translateRange(req.query.range, index.keyTail)
                        } }) : req;
                }
                var result = __assign(__assign({}, table), { schema: __assign(__assign({}, schema), { primaryKey: primaryKey, indexes: allVirtualIndexes, getIndexByKeyPath: findBestIndex }), count: function (req) {
                        return table.count(translateRequest(req));
                    },
                    query: function (req) {
                        return table.query(translateRequest(req));
                    },
                    openCursor: function (req) {
                        var _a = req.query.index, keyTail = _a.keyTail, isVirtual = _a.isVirtual, keyLength = _a.keyLength;
                        if (!isVirtual)
                            return table.openCursor(req);
                        function createVirtualCursor(cursor) {
                            function _continue(key) {
                                key != null ?
                                    cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) :
                                    req.unique ?
                                        cursor.continue(pad(cursor.key, req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) :
                                        cursor.continue();
                            }
                            var virtualCursor = Object.create(cursor, {
                                continue: { value: _continue },
                                continuePrimaryKey: {
                                    value: function (key, primaryKey) {
                                        cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey);
                                    }
                                },
                                key: {
                                    get: function () {
                                        var key = cursor.key;
                                        return keyLength === 1 ?
                                            key[0] :
                                            key.slice(0, keyLength);
                                    }
                                },
                                value: {
                                    get: function () {
                                        return cursor.value;
                                    }
                                }
                            });
                            return virtualCursor;
                        }
                        return table.openCursor(translateRequest(req))
                            .then(function (cursor) { return cursor && createVirtualCursor(cursor); });
                    } });
                return result;
            } });
    }
    var virtualIndexMiddleware = {
        stack: "dbcore",
        name: "VirtualIndexMiddleware",
        level: 1,
        create: createVirtualIndexMiddleware
    };

    var hooksMiddleware = {
        stack: "dbcore",
        name: "HooksMiddleware",
        level: 2,
        create: function (downCore) { return (__assign(__assign({}, downCore), { table: function (tableName) {
                var downTable = downCore.table(tableName);
                var primaryKey = downTable.schema.primaryKey;
                var tableMiddleware = __assign(__assign({}, downTable), { mutate: function (req) {
                        var dxTrans = PSD.trans;
                        var _a = dxTrans.table(tableName).hook, deleting = _a.deleting, creating = _a.creating, updating = _a.updating;
                        switch (req.type) {
                            case 'add':
                                if (creating.fire === nop)
                                    break;
                                return dxTrans._promise('readwrite', function () { return addPutOrDelete(req); }, true);
                            case 'put':
                                if (creating.fire === nop && updating.fire === nop)
                                    break;
                                return dxTrans._promise('readwrite', function () { return addPutOrDelete(req); }, true);
                            case 'delete':
                                if (deleting.fire === nop)
                                    break;
                                return dxTrans._promise('readwrite', function () { return addPutOrDelete(req); }, true);
                            case 'deleteRange':
                                if (deleting.fire === nop)
                                    break;
                                return dxTrans._promise('readwrite', function () { return deleteRange(req); }, true);
                        }
                        return downTable.mutate(req);
                        function addPutOrDelete(req) {
                            var dxTrans = PSD.trans;
                            var keys$$1 = req.keys || getEffectiveKeys(primaryKey, req);
                            if (!keys$$1)
                                throw new Error("Keys missing");
                            req = req.type === 'add' || req.type === 'put' ? __assign(__assign({}, req), { keys: keys$$1, wantResults: true }) :
                             __assign({}, req);
                            if (req.type !== 'delete')
                                req.values = __spreadArrays(req.values);
                            if (req.keys)
                                req.keys = __spreadArrays(req.keys);
                            return getExistingValues(downTable, req, keys$$1).then(function (existingValues) {
                                var contexts = keys$$1.map(function (key, i) {
                                    var existingValue = existingValues[i];
                                    var ctx = { onerror: null, onsuccess: null };
                                    if (req.type === 'delete') {
                                        deleting.fire.call(ctx, key, existingValue, dxTrans);
                                    }
                                    else if (req.type === 'add' || existingValue === undefined) {
                                        var generatedPrimaryKey = creating.fire.call(ctx, key, req.values[i], dxTrans);
                                        if (key == null && generatedPrimaryKey != null) {
                                            key = generatedPrimaryKey;
                                            req.keys[i] = key;
                                            if (!primaryKey.outbound) {
                                                setByKeyPath(req.values[i], primaryKey.keyPath, key);
                                            }
                                        }
                                    }
                                    else {
                                        var objectDiff = getObjectDiff(existingValue, req.values[i]);
                                        var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans);
                                        if (additionalChanges_1) {
                                            var requestedValue_1 = req.values[i];
                                            Object.keys(additionalChanges_1).forEach(function (keyPath) {
                                                if (hasOwn(requestedValue_1, keyPath)) {
                                                    requestedValue_1[keyPath] = additionalChanges_1[keyPath];
                                                }
                                                else {
                                                    setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
                                                }
                                            });
                                        }
                                    }
                                    return ctx;
                                });
                                return downTable.mutate(req).then(function (_a) {
                                    var failures = _a.failures, results = _a.results, numFailures = _a.numFailures, lastResult = _a.lastResult;
                                    for (var i = 0; i < keys$$1.length; ++i) {
                                        var primKey = results ? results[i] : keys$$1[i];
                                        var ctx = contexts[i];
                                        if (primKey == null) {
                                            ctx.onerror && ctx.onerror(failures[i]);
                                        }
                                        else {
                                            ctx.onsuccess && ctx.onsuccess(req.type === 'put' && existingValues[i] ?
                                                req.values[i] :
                                                primKey
                                            );
                                        }
                                    }
                                    return { failures: failures, results: results, numFailures: numFailures, lastResult: lastResult };
                                }).catch(function (error) {
                                    contexts.forEach(function (ctx) { return ctx.onerror && ctx.onerror(error); });
                                    return Promise.reject(error);
                                });
                            });
                        }
                        function deleteRange(req) {
                            return deleteNextChunk(req.trans, req.range, 10000);
                        }
                        function deleteNextChunk(trans, range, limit) {
                            return downTable.query({ trans: trans, values: false, query: { index: primaryKey, range: range }, limit: limit })
                                .then(function (_a) {
                                var result = _a.result;
                                return addPutOrDelete({ type: 'delete', keys: result, trans: trans }).then(function (res) {
                                    if (res.numFailures > 0)
                                        return Promise.reject(res.failures[0]);
                                    if (result.length < limit) {
                                        return { failures: [], numFailures: 0, lastResult: undefined };
                                    }
                                    else {
                                        return deleteNextChunk(trans, __assign(__assign({}, range), { lower: result[result.length - 1], lowerOpen: true }), limit);
                                    }
                                });
                            });
                        }
                    } });
                return tableMiddleware;
            } })); }
    };

    var Dexie =               (function () {
        function Dexie(name, options) {
            var _this = this;
            this._middlewares = {};
            this.verno = 0;
            var deps = Dexie.dependencies;
            this._options = options = __assign({
                addons: Dexie.addons, autoOpen: true,
                indexedDB: deps.indexedDB, IDBKeyRange: deps.IDBKeyRange }, options);
            this._deps = {
                indexedDB: options.indexedDB,
                IDBKeyRange: options.IDBKeyRange
            };
            var addons = options.addons;
            this._dbSchema = {};
            this._versions = [];
            this._storeNames = [];
            this._allTables = {};
            this.idbdb = null;
            var state = {
                dbOpenError: null,
                isBeingOpened: false,
                onReadyBeingFired: null,
                openComplete: false,
                dbReadyResolve: nop,
                dbReadyPromise: null,
                cancelOpen: nop,
                openCanceller: null,
                autoSchema: true
            };
            state.dbReadyPromise = new DexiePromise(function (resolve) {
                state.dbReadyResolve = resolve;
            });
            state.openCanceller = new DexiePromise(function (_, reject) {
                state.cancelOpen = reject;
            });
            this._state = state;
            this.name = name;
            this.on = Events(this, "populate", "blocked", "versionchange", { ready: [promisableChain, nop] });
            this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
                return function (subscriber, bSticky) {
                    Dexie.vip(function () {
                        var state = _this._state;
                        if (state.openComplete) {
                            if (!state.dbOpenError)
                                DexiePromise.resolve().then(subscriber);
                            if (bSticky)
                                subscribe(subscriber);
                        }
                        else if (state.onReadyBeingFired) {
                            state.onReadyBeingFired.push(subscriber);
                            if (bSticky)
                                subscribe(subscriber);
                        }
                        else {
                            subscribe(subscriber);
                            var db_1 = _this;
                            if (!bSticky)
                                subscribe(function unsubscribe() {
                                    db_1.on.ready.unsubscribe(subscriber);
                                    db_1.on.ready.unsubscribe(unsubscribe);
                                });
                        }
                    });
                };
            });
            this.Collection = createCollectionConstructor(this);
            this.Table = createTableConstructor(this);
            this.Transaction = createTransactionConstructor(this);
            this.Version = createVersionConstructor(this);
            this.WhereClause = createWhereClauseConstructor(this);
            this.on("versionchange", function (ev) {
                if (ev.newVersion > 0)
                    console.warn("Another connection wants to upgrade database '" + _this.name + "'. Closing db now to resume the upgrade.");
                else
                    console.warn("Another connection wants to delete database '" + _this.name + "'. Closing db now to resume the delete request.");
                _this.close();
            });
            this.on("blocked", function (ev) {
                if (!ev.newVersion || ev.newVersion < ev.oldVersion)
                    console.warn("Dexie.delete('" + _this.name + "') was blocked");
                else
                    console.warn("Upgrade '" + _this.name + "' blocked by other connection holding version " + ev.oldVersion / 10);
            });
            this._maxKey = getMaxKey(options.IDBKeyRange);
            this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) { return new _this.Transaction(mode, storeNames, dbschema, parentTransaction); };
            this._fireOnBlocked = function (ev) {
                _this.on("blocked").fire(ev);
                connections
                    .filter(function (c) { return c.name === _this.name && c !== _this && !c._state.vcFired; })
                    .map(function (c) { return c.on("versionchange").fire(ev); });
            };
            this.use(virtualIndexMiddleware);
            this.use(hooksMiddleware);
            addons.forEach(function (addon) { return addon(_this); });
        }
        Dexie.prototype.version = function (versionNumber) {
            if (isNaN(versionNumber) || versionNumber < 0.1)
                throw new exceptions.Type("Given version is not a positive number");
            versionNumber = Math.round(versionNumber * 10) / 10;
            if (this.idbdb || this._state.isBeingOpened)
                throw new exceptions.Schema("Cannot add version when database is open");
            this.verno = Math.max(this.verno, versionNumber);
            var versions = this._versions;
            var versionInstance = versions.filter(function (v) { return v._cfg.version === versionNumber; })[0];
            if (versionInstance)
                return versionInstance;
            versionInstance = new this.Version(versionNumber);
            versions.push(versionInstance);
            versions.sort(lowerVersionFirst);
            versionInstance.stores({});
            this._state.autoSchema = false;
            return versionInstance;
        };
        Dexie.prototype._whenReady = function (fn) {
            var _this = this;
            return this._state.openComplete || PSD.letThrough ? fn() : new DexiePromise(function (resolve, reject) {
                if (!_this._state.isBeingOpened) {
                    if (!_this._options.autoOpen) {
                        reject(new exceptions.DatabaseClosed());
                        return;
                    }
                    _this.open().catch(nop);
                }
                _this._state.dbReadyPromise.then(resolve, reject);
            }).then(fn);
        };
        Dexie.prototype.use = function (_a) {
            var stack = _a.stack, create = _a.create, level = _a.level, name = _a.name;
            if (name)
                this.unuse({ stack: stack, name: name });
            var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
            middlewares.push({ stack: stack, create: create, level: level == null ? 10 : level, name: name });
            middlewares.sort(function (a, b) { return a.level - b.level; });
            return this;
        };
        Dexie.prototype.unuse = function (_a) {
            var stack = _a.stack, name = _a.name, create = _a.create;
            if (stack && this._middlewares[stack]) {
                this._middlewares[stack] = this._middlewares[stack].filter(function (mw) {
                    return create ? mw.create !== create :
                        name ? mw.name !== name :
                            false;
                });
            }
            return this;
        };
        Dexie.prototype.open = function () {
            return dexieOpen(this);
        };
        Dexie.prototype.close = function () {
            var idx = connections.indexOf(this), state = this._state;
            if (idx >= 0)
                connections.splice(idx, 1);
            if (this.idbdb) {
                try {
                    this.idbdb.close();
                }
                catch (e) { }
                this.idbdb = null;
            }
            this._options.autoOpen = false;
            state.dbOpenError = new exceptions.DatabaseClosed();
            if (state.isBeingOpened)
                state.cancelOpen(state.dbOpenError);
            state.dbReadyPromise = new DexiePromise(function (resolve) {
                state.dbReadyResolve = resolve;
            });
            state.openCanceller = new DexiePromise(function (_, reject) {
                state.cancelOpen = reject;
            });
        };
        Dexie.prototype.delete = function () {
            var _this = this;
            var hasArguments = arguments.length > 0;
            var state = this._state;
            return new DexiePromise(function (resolve, reject) {
                var doDelete = function () {
                    _this.close();
                    var req = _this._deps.indexedDB.deleteDatabase(_this.name);
                    req.onsuccess = wrap(function () {
                        databaseEnumerator.remove(_this.name);
                        resolve();
                    });
                    req.onerror = eventRejectHandler(reject);
                    req.onblocked = _this._fireOnBlocked;
                };
                if (hasArguments)
                    throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
                if (state.isBeingOpened) {
                    state.dbReadyPromise.then(doDelete);
                }
                else {
                    doDelete();
                }
            });
        };
        Dexie.prototype.backendDB = function () {
            return this.idbdb;
        };
        Dexie.prototype.isOpen = function () {
            return this.idbdb !== null;
        };
        Dexie.prototype.hasBeenClosed = function () {
            var dbOpenError = this._state.dbOpenError;
            return dbOpenError && (dbOpenError.name === 'DatabaseClosed');
        };
        Dexie.prototype.hasFailed = function () {
            return this._state.dbOpenError !== null;
        };
        Dexie.prototype.dynamicallyOpened = function () {
            return this._state.autoSchema;
        };
        Object.defineProperty(Dexie.prototype, "tables", {
            get: function () {
                var _this = this;
                return keys(this._allTables).map(function (name) { return _this._allTables[name]; });
            },
            enumerable: true,
            configurable: true
        });
        Dexie.prototype.transaction = function () {
            var args = extractTransactionArgs.apply(this, arguments);
            return this._transaction.apply(this, args);
        };
        Dexie.prototype._transaction = function (mode, tables, scopeFunc) {
            var _this = this;
            var parentTransaction = PSD.trans;
            if (!parentTransaction || parentTransaction.db !== this || mode.indexOf('!') !== -1)
                parentTransaction = null;
            var onlyIfCompatible = mode.indexOf('?') !== -1;
            mode = mode.replace('!', '').replace('?', '');
            var idbMode, storeNames;
            try {
                storeNames = tables.map(function (table) {
                    var storeName = table instanceof _this.Table ? table.name : table;
                    if (typeof storeName !== 'string')
                        throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                    return storeName;
                });
                if (mode == "r" || mode === READONLY)
                    idbMode = READONLY;
                else if (mode == "rw" || mode == READWRITE)
                    idbMode = READWRITE;
                else
                    throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
                if (parentTransaction) {
                    if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                        if (onlyIfCompatible) {
                            parentTransaction = null;
                        }
                        else
                            throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                    }
                    if (parentTransaction) {
                        storeNames.forEach(function (storeName) {
                            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                                if (onlyIfCompatible) {
                                    parentTransaction = null;
                                }
                                else
                                    throw new exceptions.SubTransaction("Table " + storeName +
                                        " not included in parent transaction.");
                            }
                        });
                    }
                    if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                        parentTransaction = null;
                    }
                }
            }
            catch (e) {
                return parentTransaction ?
                    parentTransaction._promise(null, function (_, reject) { reject(e); }) :
                    rejection(e);
            }
            var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
            return (parentTransaction ?
                parentTransaction._promise(idbMode, enterTransaction, "lock") :
                PSD.trans ?
                    usePSD(PSD.transless, function () { return _this._whenReady(enterTransaction); }) :
                    this._whenReady(enterTransaction));
        };
        Dexie.prototype.table = function (tableName) {
            if (!hasOwn(this._allTables, tableName)) {
                throw new exceptions.InvalidTable("Table " + tableName + " does not exist");
            }
            return this._allTables[tableName];
        };
        return Dexie;
    }());

    var Dexie$1 = Dexie;
    props(Dexie$1, __assign(__assign({}, fullNameExceptions), {
        delete: function (databaseName) {
            var db = new Dexie$1(databaseName);
            return db.delete();
        },
        exists: function (name) {
            return new Dexie$1(name, { addons: [] }).open().then(function (db) {
                db.close();
                return true;
            }).catch('NoSuchDatabaseError', function () { return false; });
        },
        getDatabaseNames: function (cb) {
            return databaseEnumerator ?
                databaseEnumerator.getDatabaseNames().then(cb) :
                DexiePromise.resolve([]);
        },
        defineClass: function () {
            function Class(content) {
                extend(this, content);
            }
            return Class;
        },
        ignoreTransaction: function (scopeFunc) {
            return PSD.trans ?
                usePSD(PSD.transless, scopeFunc) :
                scopeFunc();
        },
        vip: vip, async: function (generatorFn) {
            return function () {
                try {
                    var rv = awaitIterator(generatorFn.apply(this, arguments));
                    if (!rv || typeof rv.then !== 'function')
                        return DexiePromise.resolve(rv);
                    return rv;
                }
                catch (e) {
                    return rejection(e);
                }
            };
        }, spawn: function (generatorFn, args, thiz) {
            try {
                var rv = awaitIterator(generatorFn.apply(thiz, args || []));
                if (!rv || typeof rv.then !== 'function')
                    return DexiePromise.resolve(rv);
                return rv;
            }
            catch (e) {
                return rejection(e);
            }
        },
        currentTransaction: {
            get: function () { return PSD.trans || null; }
        }, waitFor: function (promiseOrFunction, optionalTimeout) {
            var promise = DexiePromise.resolve(typeof promiseOrFunction === 'function' ?
                Dexie$1.ignoreTransaction(promiseOrFunction) :
                promiseOrFunction)
                .timeout(optionalTimeout || 60000);
            return PSD.trans ?
                PSD.trans.waitFor(promise) :
                promise;
        },
        Promise: DexiePromise,
        debug: {
            get: function () { return debug; },
            set: function (value) {
                setDebug(value, value === 'dexie' ? function () { return true; } : dexieStackFrameFilter);
            }
        },
        derive: derive, extend: extend, props: props, override: override,
        Events: Events,
        getByKeyPath: getByKeyPath, setByKeyPath: setByKeyPath, delByKeyPath: delByKeyPath, shallowClone: shallowClone, deepClone: deepClone, getObjectDiff: getObjectDiff, asap: asap,
        minKey: minKey,
        addons: [],
        connections: connections,
        errnames: errnames,
        dependencies: (function () {
            try {
                return {
                    indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
                    IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
                };
            }
            catch (e) {
                return { indexedDB: null, IDBKeyRange: null };
            }
        })(),
        semVer: DEXIE_VERSION, version: DEXIE_VERSION.split('.')
            .map(function (n) { return parseInt(n); })
            .reduce(function (p, c, i) { return p + (c / Math.pow(10, i * 2)); }),
        default: Dexie$1,
        Dexie: Dexie$1 }));
    Dexie$1.maxKey = getMaxKey(Dexie$1.dependencies.IDBKeyRange);

    initDatabaseEnumerator(Dexie.dependencies.indexedDB);
    DexiePromise.rejectionMapper = mapError;
    setDebug(debug, dexieStackFrameFilter);

    const skillToSlotLevel = {
      '無し':               0,

      '龍耐性':             1,
      '氷耐性':             1,
      '雷耐性':             1,
      '水耐性':             1,
      '火耐性':             1,
      '毒耐性':             1,
      '麻痺耐性':           1,
      '睡眠耐性':           1,
      '爆破やられ耐性':     1,
      '植生学':             1,
      '地質学':             1,
      '飛び込み':           1,
      '陽動':               1,
      '泥雪耐性':           1,
      '満足感':             1,
      '腹減り耐性':         1,
      '剥ぎ取り鉄人':       1,
      '防御':               1,
      '龍属性攻撃強化':     1,
      '氷属性攻撃強化':     1,
      '雷属性攻撃強化':     1,
      '水属性攻撃強化':     1,
      '火属性攻撃強化':     1,
      'ボマー':             1,
      '滑走強化':           1,
      '毒属性強化':         1,
      'スタミナ奪取':       1,
      '笛吹き名人':         1,
      '回復速度':           1,
      '砥石使用高速化':     1,
      '風圧耐性':           1,
      'ひるみ軽減':         1,
      'ブレ抑制':           1,
      '気絶耐性':           1,
      '装填速度':           1,
      '反動軽減':           1,

      '不屈':               2,
      '乗り名人':           2,
      '体術':               2,
      '体力回復量UP':       2,
      'アイテム使用強化':   2,
      '翔蟲使い':           2,
      '壁面移動':           2,
      '精霊の加護':         2,
      '早食い':             2,
      '属性やられ耐性':     2,
      '破壊王':             2,
      '広域化':             2,
      'KO術':               2,
      '納刀術':             2,
      '回避性能':           2,
      '回避距離UP':         2,
      '抜刀術【力】':       2,
      '泡沫の舞':           2,
      '逆襲':               2,
      '耐震':               2,
      '鈍器使い':           2,
      '高速変形':           2,
      '見切り':             2,
      '攻撃':               2,
      '渾身':               2,
      '強化持続':           2,
      'スタミナ急速回復':   2,
      'ガード性能':         2,
      'ガード強化':         2,
      '砲弾装填':           2,
      '特殊射撃強化':       2,
      '火事場力':           2,
      '心眼':               2,
      '集中':               2,
      'ランナー':           2,
      '砲術':               2,
      '会心撃【属性】':     2,
      '弾導強化':           2,
      '超会心':             2,
      '弱点特効':           2,
      '挑戦者':             2,
      'フルチャージ':       2,
      '逆恨み':             2,
      '死中に活':           2,
      '力の解放':           2,
      '麻痺属性強化':       2,
      '睡眠属性強化':       2,
      '爆破属性強化':       2,
      '剛刃研磨':           2,
      '業物':               2,
      '弾丸節約':           2,
      '達人芸':             2,

      '耳栓':               3,
      '抜刀術【技】':       3,
      'キノコ大好き':       3,
      '攻めの守勢':         3,
      '装填拡張':           3,
      '通常弾・連射矢強化': 3,
      '貫通弾・貫通矢強化': 3,
      '散弾・拡散矢強化':   3,
      '速射強化':           3,
      'ジャンプ鉄人':       3,
      '鬼火纏':             3,
      '幸運':               3,
      '匠':                 3,
    };

    class MHRiseCharmManager {
      MAX_SKILLS = 2
      MAX_SLOTS  = 3

      db        = null              // WebSQL
      indexeddb = null              // IndexedDB
      charms    = null

      charmTableName = 'charms'


      constructor(params = {}) {
        const {isDemoMode} = params;

        if ( isDemoMode ) {
          this.charmTableName = 'demoCharms';
        }

        this._init();
      }


      sql(query, placeholderValues) {
        return new Promise((resolve, reject) => {
          this.db.transaction(
            tx => tx.executeSql(
              query,
              placeholderValues,
              (tx, result) => resolve({tx, result}),
              (...args) => reject(args)
            )
          );
        })
      }


      async _init() {
        this.db = openDatabase('mhrise-charm-manager', '', 'MHRise charm manager', 5000);
        await this._createTable();
        await this.sql(`alter table ${this.charmTableName} add column imagename varchar(128)`).catch(() => {}); // for old schema

        this.indexeddb = new Dexie(this.charmTableName);
        this.indexeddb.version(1).stores({images: 'name'});

        this.updateCharmArray();
      }


      async reset() {
        await this.sql(`drop table if exists ${this.charmTableName}`);
        await this._createTable();
      }


      async registerCharms(charms) {
        const values = charms
              .map(c => {
                const slots = Array.isArray(c.slots)      ? c.slots.join(', ')
                            : typeof c.slots === 'string' ? c.slots.replace(/-/g, ', ')
                            :                               c.slots;

                const image = c.imageName ? `"${c.imageName}"` : 'NULL';

                return '(' + [
                  `"${c.skills[0]}"`,
                  c.skillLevels[0],
                  `"${c.skills[1]}"`,
                  c.skillLevels[1],
                  slots,
                  image,
                ].join(', ') + ')'
              })
              .join(',\n');

        console.log(values);
        await this.sql(`insert or ignore into ${this.charmTableName} values ${values}`);

        this.updateCharmArray();
      }


      async searchCharms(query) {
        const {tx, result} = await this.sql(query);
        return result.rows
      }


      async _createTable() {
        await this.sql(`create table if not exists ${this.charmTableName}(
               skill1      varchar(20),
               skill1Level int,
               skill2      varchar(20),
               skill2Level int,
               slot1       int,
               slot2       int,
               slot3       int,
               imagename   varchar(128),
               unique (skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3))`);

        await this.sql(`create index if not exists '${this.charmTableName}.skill1' on ${this.charmTableName}(skill1, skill1Level)`);
        await this.sql(`create index if not exists '${this.charmTableName}.skill2' on ${this.charmTableName}(skill2, skill2Level)`);
        await this.sql(`create index if not exists '${this.charmTableName}.slots'  on ${this.charmTableName}(slot1, slot2, slot3)`);
      }


      async getScreenshot(name) {
        const result = await this.indexeddb.images.get(name);
        const img = cv.matFromArray(result.rows, result.cols, result.type, result.data);

        return img
      }


      async findSubstitutableCharms(charm) {
        // interface Charm {
        //   skills:      string[]
        //   skillLevels: number[]
        //   slots:       number[]
        // }
        const sl = [];
        const substitutableCharms = [];

        for (sl[0] = charm.skillLevels[0]; sl[0] >= 0; sl[0]--) {
          for (sl[1] = charm.skillLevels[1]; sl[1] >= 0; sl[1]--) {
            // console.log(sl[0], sl[1])
            // 装飾品で実現するスキルレベル
            const skillLevelsRequiredInDecorations = [...Array(this.MAX_SKILLS).keys()].map(i => charm.skillLevels[i] - sl[i]);

            // スキル用の要求スロット数
            const slotRequirementForSkill = skillLevelsRequiredInDecorations.reduce(((a, b) => a + b), 0);

            // 装飾品の要求スロット数 + charm のスロット数 > 3 なら実現不可能
            if ( slotRequirementForSkill + charm.slots.filter(i => i).length > this.MAX_SLOTS ) {
              // それ以上 sl (=スキル要求) を減らして探索しても意味がない
              break
            }

            const requiredSlots = [
              ...charm.slots,
              ...Array.from( {length: skillLevelsRequiredInDecorations[0]}, () => skillToSlotLevel[charm.skills[0]] ),
              ...Array.from( {length: skillLevelsRequiredInDecorations[1]}, () => skillToSlotLevel[charm.skills[1]] ),
            ].filter(i => i).sort().reverse();

            // conbination にしないといけない
            const skill1Constraints = sl[0] ? `(skill1 = '${charm.skills[0]}' and skill1Level >= ${sl[0]})` : '';
            const skill2Constraints = sl[1] ? `(skill2 = '${charm.skills[1]}' and skill2Level >= ${sl[1]})` : '';
            const skillConstraints = [skill1Constraints, skill2Constraints].filter(i => i).join(' and ');

            const skill1ConstraintsRev = sl[1] ? `(skill1 = '${charm.skills[1]}' and skill1Level >= ${sl[1]})` : '';
            const skill2ConstraintsRev = sl[0] ? `(skill2 = '${charm.skills[0]}' and skill2Level >= ${sl[0]})` : '';
            const skillConstraintsRev  = [skill1ConstraintsRev, skill2ConstraintsRev].filter(i => i).join(' and ');

            const sc = skillConstraints.length
                  ? '(' + [`(${skillConstraints})`, `(${skillConstraintsRev})`].filter(i => i).join(' or ') + ') and '
                  : '';

            const query =`select rowid,* from ${this.charmTableName} where ${sc} slot1 >= ${requiredSlots[0] || 0} and slot2 >= ${requiredSlots[1] || 0} and slot3 >= ${requiredSlots[2] || 0}`;
            // console.log(query)
            const {result} = await this.sql(query);
            // console.log(result.rows)

            substitutableCharms.push(
              ...[...result.rows].filter(i => !this._isSameCharm(this._row2obj(i), charm))
            );
            // TODO: 合計スキルレベルの条件 (WebSQL 用) は必要？
          }
        }

        return substitutableCharms.sort((a, b) => (a.rowid < b.rowid) ? -1 : (a.rowid > b.rowid) ? 1 : 0)
      }


      async updateCharmArray() {
        this.charms = [
          ...(await this.searchCharms(`select rowid,* from ${this.charmTableName}`))
        ].map(row => {
          row.evaluation = skillToSlotLevel[row.skill1] * row.skill1Level
                         + skillToSlotLevel[row.skill2] * row.skill2Level
                         + row.slot1
                         + row.slot2
                         + row.slot3;
          return row
        });

        this.searchSubstitutableCharms();
      }


      async searchSubstitutableCharms() {
        while ( typeof Module.getSubstitutesAll !== 'function' ) {
          await new Promise(r => setTimeout(r, 100));
        }

        const res = Module.getSubstitutesAll( JSON.stringify(this.charms) ); // use wasm module
        const substitutes = JSON.parse(res);

        for (const i in this.charms) {
          const [baseId, upperIds] = substitutes[0] || [Number.MAX_SAFE_INTEGER, []];

          if ( this.charms[i].rowid > baseId ) {
            console.log('internal error');
          }
          else if ( this.charms[i].rowid < baseId ) {
            this.charms[i].substitutableCharms = [];
          }
          else {
            this.charms[i].substitutableCharms = upperIds.map(u => this.charms[u - 1]);
            substitutes.shift();
          }
        }

        // for (const [baseId, upperIds] of substitutes) {
        //   charms[baseId - 1].substitutableCharms = upperIds.map(i => charms[i - 1])
        // }
      }

      // async exportIdx() {
      //   const blob = await exportDB(this.indexeddb, {
      //     filter: (table) => table === 'images'
      //   })
      // }

      // async importIdx() {
      // }


      // TODO: charm class 作ってコンストラクタでやる
      _row2obj(row) {
        return {
          skills:      [row.skill1, row.skill2],
          skillLevels: [row.skill1Level, row.skill2Level],
          slots:       [row.slot1, row.slot2, row.slot3],
        }
      }

      _isSameCharm(a, b) {
        return JSON.stringify(a) === JSON.stringify(b)
      }
    }

    function fetchImage(path) {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = path;

        img.onload = () => {
          // console.log(`fetched ${path}`)
          const imgmat = cv.imread(img);
    	    resolve(imgmat);
        };
      })
    }


    function countImageDiffAtPoint(image, templateImage, point, maskBinaryThreshold, diffBinaryThreshold) {
      const size = new cv.Size(templateImage.cols, templateImage.rows);
      const rect = new cv.Rect(point, size);
      const trimmed = image.roi(rect);

      const templateMask = new cv.Mat();
      cv.threshold(templateImage, templateMask, maskBinaryThreshold, 255, cv.THRESH_BINARY);

      const masked = new cv.Mat();
      trimmed.copyTo(masked, templateMask);

      const diff = new cv.Mat();
      cv.absdiff(templateImage, masked, diff);
      cv.cvtColor(diff, diff, cv.COLOR_BGR2GRAY);

      const result = new cv.Mat();
      cv.threshold(diff, result, diffBinaryThreshold, 255, cv.THRESH_BINARY);
      // // cv::imwrite("./tmp/debug.png", diff); // for debug

      diff.delete();
      masked.delete();
      templateMask.delete();
      trimmed.delete();

      return result;
    }


    function getMostMatchedImage(image, templates, point, maskBinaryThreshold = 63, diffBinaryThreshold = 63, debug = ()=>{}) {
      let minDiffCount = Number.MAX_SAFE_INTEGER;
      let candidate = null;

      // console.log(templates)
      for (const [name, template] of Object.entries(templates)) {
        const diff = countImageDiffAtPoint(image, template, point, maskBinaryThreshold, diffBinaryThreshold);
        debug(diff, name);
        const diffCount = cv.countNonZero(diff);

        if ( minDiffCount > diffCount ) {
          minDiffCount = diffCount;
          candidate = name;
        }

        diff.delete();
      }

      return candidate;
    }



    function promiseAllRecursive(value) {
      if (value instanceof Promise) {
        return value
      }

      if (Array.isArray(value)) {
        return Promise.all(value.map(promiseAllRecursive))
      }

      if (typeof value === 'object') {
        return resolveObject(value)
      }

      return Promise.resolve(value)
    }

    function resolveObject(object) {
      const promises = Object.keys(object).map(key => {
        return promiseAllRecursive(object[key]).then(value => ({ key, value }))
      });

      return Promise.all(promises).then(results => {
        return results.reduce((obj, pair) => {
          obj[pair.key] = pair.value;
          return obj
        }, {})
      })
    }

    class MHRiseCharmScanner {
      MAX_PAGE = 34
      COLUMNS_PER_PAGE = 10
      ROWS_PER_PAGE    = 5

      POINT_RARITY       = new cv.Point(1190, 176)
      POINT_SLOTS        = new cv.Point(1160, 200)
      POINT_SKILL1       = new cv.Point(1033, 266)
      POINT_SKILL2       = new cv.Point(1033, 317)
      POINT_SKILL_LEVEL1 = new cv.Point(1190, 290)
      POINT_SKILL_LEVEL2 = new cv.Point(1190, 340)
      POINT_PAGE         = new cv.Point(787, 582)

      POINT_CHARM_AREA_LEFT_TOP = new cv.Point(634, 359)
      SIZE_CHARM_AREA           = new cv.Size(357, 199)

      indexeddb = null
      nCharms = 0
      charms = {}
      templates = null

      // page = -1
      // col = -1
      // row = -1

      async init() {
        this.templates = {
          frame: fetchImage('img/templates/frame.png'),
          rare: {
            7:                    fetchImage('img/templates/rare/7.jpg'),
            6:                    fetchImage('img/templates/rare/6.jpg'),
            5:                    fetchImage('img/templates/rare/5.jpg'),
            4:                    fetchImage('img/templates/rare/4.jpg'),
          },
          lvl: {
            0:                    fetchImage('img/templates/lvl/0.jpg'),
            1:                    fetchImage('img/templates/lvl/1.jpg'),
            2:                    fetchImage('img/templates/lvl/2.jpg'),
            3:                    fetchImage('img/templates/lvl/3.jpg'),
            4:                    fetchImage('img/templates/lvl/4.jpg'),
            5:                    fetchImage('img/templates/lvl/5.jpg'),
          },
          slot: {
            '0-0-0':              fetchImage('img/templates/slot/0.jpg'),
            '1-0-0':              fetchImage('img/templates/slot/1.jpg'),
            '1-1-0':              fetchImage('img/templates/slot/11.jpg'),
            '1-1-1':              fetchImage('img/templates/slot/111.jpg'),
            '2-0-0':              fetchImage('img/templates/slot/2.jpg'),
            '2-1-0':              fetchImage('img/templates/slot/21.jpg'),
            '2-1-1':              fetchImage('img/templates/slot/211.jpg'),
            '2-2-0':              fetchImage('img/templates/slot/22.jpg'),
            '2-2-1':              fetchImage('img/templates/slot/221.jpg'),
            '3-0-0':              fetchImage('img/templates/slot/3.jpg'),
            '3-1-0':              fetchImage('img/templates/slot/31.jpg'),
            '3-1-1':              fetchImage('img/templates/slot/311.jpg'),
            '3-2-0':              fetchImage('img/templates/slot/32.jpg'),
            '3-2-1':              fetchImage('img/templates/slot/321.jpg'),
          },
          skill: {
            'KO術':               fetchImage('img/templates/skill/KO術.jpg'),
            '匠':                 fetchImage('img/templates/skill/匠.jpg'),
            '不屈':               fetchImage('img/templates/skill/不屈.jpg'),
            '体術':               fetchImage('img/templates/skill/体術.jpg'),
            '幸運':               fetchImage('img/templates/skill/幸運.jpg'),
            '心眼':               fetchImage('img/templates/skill/心眼.jpg'),
            '攻撃':               fetchImage('img/templates/skill/攻撃.jpg'),
            '業物':               fetchImage('img/templates/skill/業物.jpg'),
            '渾身':               fetchImage('img/templates/skill/渾身.jpg'),
            '無し':               fetchImage('img/templates/skill/無し.jpg'),
            '砲術':               fetchImage('img/templates/skill/砲術.jpg'),
            '耐震':               fetchImage('img/templates/skill/耐震.jpg'),
            '耳栓':               fetchImage('img/templates/skill/耳栓.jpg'),
            '逆襲':               fetchImage('img/templates/skill/逆襲.jpg'),
            '防御':               fetchImage('img/templates/skill/防御.jpg'),
            '陽動':               fetchImage('img/templates/skill/陽動.jpg'),
            '集中':               fetchImage('img/templates/skill/集中.jpg'),
            'ボマー':             fetchImage('img/templates/skill/ボマー.jpg'),
            '地質学':             fetchImage('img/templates/skill/地質学.jpg'),
            '広域化':             fetchImage('img/templates/skill/広域化.jpg'),
            '挑戦者':             fetchImage('img/templates/skill/挑戦者.jpg'),
            '早食い':             fetchImage('img/templates/skill/早食い.jpg'),
            '植生学':             fetchImage('img/templates/skill/植生学.jpg'),
            '毒耐性':             fetchImage('img/templates/skill/毒耐性.jpg'),
            '水耐性':             fetchImage('img/templates/skill/水耐性.jpg'),
            '氷耐性':             fetchImage('img/templates/skill/氷耐性.jpg'),
            '満足感':             fetchImage('img/templates/skill/満足感.jpg'),
            '火耐性':             fetchImage('img/templates/skill/火耐性.jpg'),
            '破壊王':             fetchImage('img/templates/skill/破壊王.jpg'),
            '納刀術':             fetchImage('img/templates/skill/納刀術.jpg'),
            '見切り':             fetchImage('img/templates/skill/見切り.jpg'),
            '超会心':             fetchImage('img/templates/skill/超会心.jpg'),
            '逆恨み':             fetchImage('img/templates/skill/逆恨み.jpg'),
            '達人芸':             fetchImage('img/templates/skill/達人芸.jpg'),
            '雷耐性':             fetchImage('img/templates/skill/雷耐性.jpg'),
            '鬼火纏':             fetchImage('img/templates/skill/鬼火纏.jpg'),
            '龍耐性':             fetchImage('img/templates/skill/龍耐性.jpg'),
            'ブレ抑制':           fetchImage('img/templates/skill/ブレ抑制.jpg'),
            'ランナー':           fetchImage('img/templates/skill/ランナー.jpg'),
            '乗り名人':           fetchImage('img/templates/skill/乗り名人.jpg'),
            '剛刃研磨':           fetchImage('img/templates/skill/剛刃研磨.jpg'),
            '力の解放':           fetchImage('img/templates/skill/力の解放.jpg'),
            '反動軽減':           fetchImage('img/templates/skill/反動軽減.jpg'),
            '回復速度':           fetchImage('img/templates/skill/回復速度.jpg'),
            '回避性能':           fetchImage('img/templates/skill/回避性能.jpg'),
            '壁面移動':           fetchImage('img/templates/skill/壁面移動.jpg'),
            '弱点特効':           fetchImage('img/templates/skill/弱点特効.jpg'),
            '強化持続':           fetchImage('img/templates/skill/強化持続.jpg'),
            '弾丸節約':           fetchImage('img/templates/skill/弾丸節約.jpg'),
            '弾導強化':           fetchImage('img/templates/skill/弾導強化.jpg'),
            '死中に活':           fetchImage('img/templates/skill/死中に活.jpg'),
            '気絶耐性':           fetchImage('img/templates/skill/気絶耐性.jpg'),
            '泡沫の舞':           fetchImage('img/templates/skill/泡沫の舞.jpg'),
            '泥雪耐性':           fetchImage('img/templates/skill/泥雪耐性.jpg'),
            '滑走強化':           fetchImage('img/templates/skill/滑走強化.jpg'),
            '火事場力':           fetchImage('img/templates/skill/火事場力.jpg'),
            '睡眠耐性':           fetchImage('img/templates/skill/睡眠耐性.jpg'),
            '砲弾装填':           fetchImage('img/templates/skill/砲弾装填.jpg'),
            '翔蟲使い':           fetchImage('img/templates/skill/翔蟲使い.jpg'),
            '装填拡張':           fetchImage('img/templates/skill/装填拡張.jpg'),
            '装填速度':           fetchImage('img/templates/skill/装填速度.jpg'),
            '速射強化':           fetchImage('img/templates/skill/速射強化.jpg'),
            '鈍器使い':           fetchImage('img/templates/skill/鈍器使い.jpg'),
            '風圧耐性':           fetchImage('img/templates/skill/風圧耐性.jpg'),
            '飛び込み':           fetchImage('img/templates/skill/飛び込み.jpg'),
            '高速変形':           fetchImage('img/templates/skill/高速変形.jpg'),
            '麻痺耐性':           fetchImage('img/templates/skill/麻痺耐性.jpg'),
            '回避距離UP':         fetchImage('img/templates/skill/回避距離UP.jpg'),
            'ひるみ軽減':         fetchImage('img/templates/skill/ひるみ軽減.jpg'),
            'ガード強化':         fetchImage('img/templates/skill/ガード強化.jpg'),
            'ガード性能':         fetchImage('img/templates/skill/ガード性能.jpg'),
            '攻めの守勢':         fetchImage('img/templates/skill/攻めの守勢.jpg'),
            '毒属性強化':         fetchImage('img/templates/skill/毒属性強化.jpg'),
            '笛吹き名人':         fetchImage('img/templates/skill/笛吹き名人.jpg'),
            '精霊の加護':         fetchImage('img/templates/skill/精霊の加護.jpg'),
            '腹減り耐性':         fetchImage('img/templates/skill/腹減り耐性.jpg'),
            '体力回復量UP':       fetchImage('img/templates/skill/体力回復量UP.jpg'),
            'キノコ大好き':       fetchImage('img/templates/skill/キノコ大好き.jpg'),
            'ジャンプ鉄人':       fetchImage('img/templates/skill/ジャンプ鉄人.jpg'),
            'スタミナ奪取':       fetchImage('img/templates/skill/スタミナ奪取.jpg'),
            'フルチャージ':       fetchImage('img/templates/skill/フルチャージ.jpg'),
            '剥ぎ取り鉄人':       fetchImage('img/templates/skill/剥ぎ取り鉄人.jpg'),
            '抜刀術【力】':       fetchImage('img/templates/skill/抜刀術【力】.jpg'),
            '抜刀術【技】':       fetchImage('img/templates/skill/抜刀術【技】.jpg'),
            '爆破属性強化':       fetchImage('img/templates/skill/爆破属性強化.jpg'),
            '特殊射撃強化':       fetchImage('img/templates/skill/特殊射撃強化.jpg'),
            '睡眠属性強化':       fetchImage('img/templates/skill/睡眠属性強化.jpg'),
            '麻痺属性強化':       fetchImage('img/templates/skill/麻痺属性強化.jpg'),
            '会心撃【属性】':     fetchImage('img/templates/skill/会心撃【属性】.jpg'),
            '属性やられ耐性':     fetchImage('img/templates/skill/属性やられ耐性.jpg'),
            '水属性攻撃強化':     fetchImage('img/templates/skill/水属性攻撃強化.jpg'),
            '氷属性攻撃強化':     fetchImage('img/templates/skill/氷属性攻撃強化.jpg'),
            '火属性攻撃強化':     fetchImage('img/templates/skill/火属性攻撃強化.jpg'),
            '爆破やられ耐性':     fetchImage('img/templates/skill/爆破やられ耐性.jpg'),
            '砥石使用高速化':     fetchImage('img/templates/skill/砥石使用高速化.jpg'),
            '雷属性攻撃強化':     fetchImage('img/templates/skill/雷属性攻撃強化.jpg'),
            '龍属性攻撃強化':     fetchImage('img/templates/skill/龍属性攻撃強化.jpg'),
            'アイテム使用強化':   fetchImage('img/templates/skill/アイテム使用強化.jpg'),
            'スタミナ急速回復':   fetchImage('img/templates/skill/スタミナ急速回復.jpg'),
            '散弾・拡散矢強化':   fetchImage('img/templates/skill/散弾・拡散矢強化.jpg'),
            '貫通弾・貫通矢強化': fetchImage('img/templates/skill/貫通弾・貫通矢強化.jpg'),
            '通常弾・連射矢強化': fetchImage('img/templates/skill/通常弾・連射矢強化.jpg'),
          },
        };

        this.templates.page = {};
        for (let i = 1; i <= this.MAX_PAGE; i++) {
          this.templates.page[i] = fetchImage(`img/templates/page/${i}.png`);
        }

        this.templates = await promiseAllRecursive(this.templates);
        this.reset();

        this.indexeddb = new Dexie('charms');
        this.indexeddb.version(1).stores({images: 'name'});
      }

      reset() {
        this.nCharms = 0;
        this.charms = {};
        for (let p = 1; p <= this.MAX_PAGE; p++) {
          this.charms[p] = {};
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            this.charms[p][r] = {};
          }
        }
      }

      isScaned(page, row, col) {
        return this.charms[page][row][col] != null
      }

      store(charmData, metadata) {
        const {page, row, col} = charmData;
        const {screenshot, movieName} = metadata;

        const name = `${movieName}_${page}-${row}-${col}`;
        // console.log({movieName, row, col})

        this.indexeddb.images.put({
          name,
          rows: screenshot.rows,
          cols: screenshot.cols,
          type: screenshot.type(),
          data: screenshot.data.slice(0),
        });
        this.charms[page][row][col] = {...charmData, imageName: name};
        this.nCharms++;
      }

      scan(screenshot, movieName) {
        const page          = this._getCurrentPage(screenshot);
        const [pos, match]  = this._getCurrentCharmPos(screenshot);

        if ( match < 0.35 ) {
          // 放置すると blink するので一致度が低い時はスキップ
          // console.log(`low match degress ${match} for charm position searching. skip`)
          return null
        }

        const [col, row]    = pos;
        // this.page = page; this.col = col; this.row = row
        if (this.isScaned(page, row, col)) {
          // console.log(`this charm is already scanned. skip: p${page} (${row}, ${col})`);
          return null
        }

        const rarity        = this._getRarity(screenshot);
        const slots         = this._getSlots(screenshot);
        const skills        = this._getSkills(screenshot);
        const skillLevels   = this._getSkillLevels(screenshot);

        // console.log(`scaned ${row} ${col}`)

        // console.log({col, row, match, page, rarity, slots, skills, skillLevels})
        this.store({page, row, col, rarity, slots, skills, skillLevels}, {screenshot, movieName});
      }

      countCharms() {
        return this.nCharms
      }

      generateInsertScript() {
        const buf = [];

        for (let p = 1; p <= this.MAX_PAGE; p++) {
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
              const charm = this.charms[p][r][c];
              if ( charm == null ) { continue }

              // console.log(`${charm.slots} ${charm.skills[0]} ${charm.skillLevels[0]} ${charm.skills[1]} ${charm.skillLevels[1]}`)
              buf.push({
                "第一スキル":         charm.skills[0],
                "第一スキルポイント": charm.skillLevels[0],
                "第二スキル":         charm.skills[1],
                "第二スキルポイント": charm.skillLevels[1],
                "スロット":           charm.slots,
              });
            }
          }
        }

        return `const inputs = ${JSON.stringify(buf)}

eval( await (await fetch('https://code.jquery.com/jquery-3.6.0.slim.min.js')).text() )

for (const input of inputs) {
  Object.entries(input).forEach(([key, value]) => {
    \$(\`select[aria-label="\${key}"]\`).val(value)
    \$(\`select[aria-label="\${key}"]\`)[0].dispatchEvent(new Event('change', { bubbles: true }))
  })

  \$('button:contains("追加")').click()
}`
      }

      exportAsText() {
        const buf = [];

        for (let p = 1; p <= this.MAX_PAGE; p++) {
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
              const charm = this.charms[p][r][c];
              if ( charm == null ) { continue }

              buf.push(`${charm.skills[0]},${charm.skillLevels[0]},${charm.skills[1]},${charm.skillLevels[1]},${charm.slots.replace(/-/g, ',')}`);
            }
          }
        }

        return buf.join('\n')
      }

      getCharms() {
        const buf = [];

        for (let p = 1; p <= this.MAX_PAGE; p++) {
          for (let r = 1; r <= this.ROWS_PER_PAGE; r++) {
            for (let c = 1; c <= this.COLUMNS_PER_PAGE; c++) {
              const charm = this.charms[p][r][c];
              if ( charm == null ) { continue }

              buf.push(charm);
            }
          }
        }

        return buf
      }

      _getRarity(screenshot) {
        return getMostMatchedImage(screenshot, this.templates.rare, this.POINT_RARITY, 63, 63)
      }

      _getSlots(screenshot) {
        return getMostMatchedImage(screenshot, this.templates.slot, this.POINT_SLOTS, 0, 63)
      }

      _getSkills(screenshot) {
        return [
          getMostMatchedImage(screenshot, this.templates.skill, this.POINT_SKILL1, 0, 63),
          getMostMatchedImage(screenshot, this.templates.skill, this.POINT_SKILL2, 0, 63),
        ]
      }

      _getSkillLevels(screenshot) {
        // const debug = (this.page === "1" && this.row === 1 && this.col === 7)
        //       ? ((diff, name) => { console.log(`debug${name}`); cv.imshow(document.getElementById(`debug${name}`), diff) })
        //       : (() => {})

        return [
          getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL1, 0, 127),
          getMostMatchedImage(screenshot, this.templates.lvl, this.POINT_SKILL_LEVEL2, 0, 127),
        ]
      }

      _getCurrentPage(screenshot) {
        return getMostMatchedImage(screenshot, this.templates.page, this.POINT_PAGE, 31, 63)
      }


      _getCurrentCharmPos(screenshot) {
        const rect = new cv.Rect(this.POINT_CHARM_AREA_LEFT_TOP, this.SIZE_CHARM_AREA);
        const trimmed = screenshot.roi(rect);

        const result = new cv.Mat();
        cv.matchTemplate(trimmed, this.templates.frame, result, cv.TM_CCOEFF_NORMED);

        const {maxLoc, maxVal} = cv.minMaxLoc(result);
        // console.log({maxVal, maxLoc})

        result.delete();
        trimmed.delete();

        return [
          [
            1 + Math.floor(0.5 + maxLoc.x / 36.0),
            1 + Math.floor(0.5 + maxLoc.y / 41.0),
          ],
          maxVal,
        ]
      }
    }

    /* src/Hamburger.svelte generated by Svelte v3.38.2 */

    const file$n = "src/Hamburger.svelte";

    function create_fragment$q(ctx) {
    	let div;
    	let label;
    	let input;
    	let t;
    	let svg;
    	let circle;
    	let path0;
    	let path1;
    	let path2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			input = element("input");
    			t = space();
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-vpaeku");
    			add_location(input, file$n, 7, 4, 95);
    			attr_dev(circle, "cx", "50");
    			attr_dev(circle, "cy", "50");
    			attr_dev(circle, "r", "30");
    			attr_dev(circle, "class", "svelte-vpaeku");
    			add_location(circle, file$n, 9, 6, 214);
    			attr_dev(path0, "class", "line--1 svelte-vpaeku");
    			attr_dev(path0, "d", "M0 55l14-10c4.7-3.3 9-5 13-5h72");
    			add_location(path0, file$n, 10, 6, 254);
    			attr_dev(path1, "class", "line--2 svelte-vpaeku");
    			attr_dev(path1, "d", "M0 50h99");
    			add_location(path1, file$n, 11, 6, 321);
    			attr_dev(path2, "class", "line--3 svelte-vpaeku");
    			attr_dev(path2, "d", "M0 45l14 10c4.7 3.3 9 5 13 5h72");
    			add_location(path2, file$n, 12, 6, 365);
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$n, 8, 4, 145);
    			attr_dev(label, "class", "svelte-vpaeku");
    			add_location(label, file$n, 6, 2, 83);
    			attr_dev(div, "class", "menu toggle-back svelte-vpaeku");
    			add_location(div, file$n, 5, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, input);
    			input.checked = /*isOpen*/ ctx[0];
    			append_dev(label, t);
    			append_dev(label, svg);
    			append_dev(svg, circle);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isOpen*/ 1) {
    				input.checked = /*isOpen*/ ctx[0];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Hamburger", slots, []);
    	let { isOpen = false } = $$props;
    	const writable_props = ["isOpen"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hamburger> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		isOpen = this.checked;
    		$$invalidate(0, isOpen);
    	}

    	$$self.$$set = $$props => {
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    	};

    	$$self.$capture_state = () => ({ isOpen });

    	$$self.$inject_state = $$props => {
    		if ("isOpen" in $$props) $$invalidate(0, isOpen = $$props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isOpen, input_change_handler];
    }

    class Hamburger extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$q, create_fragment$q, safe_not_equal, { isOpen: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hamburger",
    			options,
    			id: create_fragment$q.name
    		});
    	}

    	get isOpen() {
    		throw new Error("<Hamburger>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<Hamburger>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/LightboxThumbnail.svelte generated by Svelte v3.38.2 */
    const file$m = "node_modules/svelte-lightbox/src/LightboxThumbnail.svelte";

    function create_fragment$p(ctx) {
    	let div1;
    	let div0;
    	let div0_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*thumbnailClasses*/ ctx[0]) + " svelte-1u332e1"));
    			attr_dev(div0, "style", /*thumbnailStyle*/ ctx[1]);
    			toggle_class(div0, "svelte-lightbox-unselectable", /*protect*/ ctx[2]);
    			add_location(div0, file$m, 10, 4, 290);
    			attr_dev(div1, "class", "clickable svelte-1u332e1");
    			add_location(div1, file$m, 9, 0, 225);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*thumbnailClasses*/ 1 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*thumbnailClasses*/ ctx[0]) + " svelte-1u332e1"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*thumbnailStyle*/ 2) {
    				attr_dev(div0, "style", /*thumbnailStyle*/ ctx[1]);
    			}

    			if (dirty & /*thumbnailClasses, protect*/ 5) {
    				toggle_class(div0, "svelte-lightbox-unselectable", /*protect*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$p($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxThumbnail", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { thumbnailClasses = "" } = $$props;
    	let { thumbnailStyle = "" } = $$props;
    	let { protect = false } = $$props;
    	const writable_props = ["thumbnailClasses", "thumbnailStyle", "protect"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxThumbnail> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("click");

    	$$self.$$set = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("protect" in $$props) $$invalidate(2, protect = $$props.protect);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		thumbnailClasses,
    		thumbnailStyle,
    		protect
    	});

    	$$self.$inject_state = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("protect" in $$props) $$invalidate(2, protect = $$props.protect);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		thumbnailClasses,
    		thumbnailStyle,
    		protect,
    		dispatch,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class LightboxThumbnail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {
    			thumbnailClasses: 0,
    			thumbnailStyle: 1,
    			protect: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxThumbnail",
    			options,
    			id: create_fragment$p.name
    		});
    	}

    	get thumbnailClasses() {
    		throw new Error("<LightboxThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailClasses(value) {
    		throw new Error("<LightboxThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnailStyle() {
    		throw new Error("<LightboxThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailStyle(value) {
    		throw new Error("<LightboxThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<LightboxThumbnail>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<LightboxThumbnail>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* node_modules/svelte-lightbox/src/Modal/LightboxHeader.svelte generated by Svelte v3.38.2 */
    const file$l = "node_modules/svelte-lightbox/src/Modal/LightboxHeader.svelte";

    function create_fragment$o(ctx) {
    	let div;
    	let button;
    	let t;
    	let button_class_value;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text("×");
    			attr_dev(button, "size", /*size*/ ctx[0]);
    			attr_dev(button, "style", /*style*/ ctx[1]);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*buttonClasses*/ ctx[3]) + " svelte-12yipzn"));
    			add_location(button, file$l, 11, 4, 304);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("svelte-lightbox-header " + /*headerClasses*/ ctx[2]) + " svelte-12yipzn"));
    			add_location(div, file$l, 10, 0, 244);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 1) {
    				attr_dev(button, "size", /*size*/ ctx[0]);
    			}

    			if (dirty & /*style*/ 2) {
    				attr_dev(button, "style", /*style*/ ctx[1]);
    			}

    			if (dirty & /*buttonClasses*/ 8 && button_class_value !== (button_class_value = "" + (null_to_empty(/*buttonClasses*/ ctx[3]) + " svelte-12yipzn"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*headerClasses*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty("svelte-lightbox-header " + /*headerClasses*/ ctx[2]) + " svelte-12yipzn"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxHeader", slots, []);
    	const dispatch = createEventDispatcher();
    	let { size = "xs" } = $$props;
    	let { style = "" } = $$props;
    	let { headerClasses = "" } = $$props;
    	let { buttonClasses = "" } = $$props;
    	const writable_props = ["size", "style", "headerClasses", "buttonClasses"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxHeader> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("close");

    	$$self.$$set = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("headerClasses" in $$props) $$invalidate(2, headerClasses = $$props.headerClasses);
    		if ("buttonClasses" in $$props) $$invalidate(3, buttonClasses = $$props.buttonClasses);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		size,
    		style,
    		headerClasses,
    		buttonClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("style" in $$props) $$invalidate(1, style = $$props.style);
    		if ("headerClasses" in $$props) $$invalidate(2, headerClasses = $$props.headerClasses);
    		if ("buttonClasses" in $$props) $$invalidate(3, buttonClasses = $$props.buttonClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, style, headerClasses, buttonClasses, dispatch, click_handler];
    }

    class LightboxHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {
    			size: 0,
    			style: 1,
    			headerClasses: 2,
    			buttonClasses: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxHeader",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get size() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get headerClasses() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerClasses(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get buttonClasses() {
    		throw new Error("<LightboxHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set buttonClasses(value) {
    		throw new Error("<LightboxHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/LightboxBody.svelte generated by Svelte v3.38.2 */

    const file$k = "node_modules/svelte-lightbox/src/Modal/LightboxBody.svelte";

    // (10:4) {:else}
    function create_else_block$9(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-x9zrc7");
    			toggle_class(div, "svelte-lightbox-image-portrait", /*portrait*/ ctx[2]);
    			add_location(div, file$k, 10, 8, 318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (dirty & /*portrait*/ 4) {
    				toggle_class(div, "svelte-lightbox-image-portrait", /*portrait*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$9.name,
    		type: "else",
    		source: "(10:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (8:4) {#if image.src}
    function create_if_block$b(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let img_style_value;
    	let img_class_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*image*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*image*/ ctx[0].alt);
    			attr_dev(img, "style", img_style_value = /*image*/ ctx[0].style);
    			attr_dev(img, "class", img_class_value = /*image*/ ctx[0].class);
    			add_location(img, file$k, 8, 8, 220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*image*/ 1 && img.src !== (img_src_value = /*image*/ ctx[0].src)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*image*/ 1 && img_alt_value !== (img_alt_value = /*image*/ ctx[0].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*image*/ 1 && img_style_value !== (img_style_value = /*image*/ ctx[0].style)) {
    				attr_dev(img, "style", img_style_value);
    			}

    			if (dirty & /*image*/ 1 && img_class_value !== (img_class_value = /*image*/ ctx[0].class)) {
    				attr_dev(img, "class", img_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(8:4) {#if image.src}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$b, create_else_block$9];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*image*/ ctx[0].src) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "svelte-lightbox-body svelte-x9zrc7");
    			toggle_class(div, "svelte-lightbox-unselectable", /*protect*/ ctx[1]);
    			add_location(div, file$k, 6, 0, 112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (dirty & /*protect*/ 2) {
    				toggle_class(div, "svelte-lightbox-unselectable", /*protect*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxBody", slots, ['default']);
    	let { image = {} } = $$props;
    	let { protect = false } = $$props;
    	let { portrait = false } = $$props;
    	const writable_props = ["image", "protect", "portrait"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxBody> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(1, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(2, portrait = $$props.portrait);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ image, protect, portrait });

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(0, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(1, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(2, portrait = $$props.portrait);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [image, protect, portrait, $$scope, slots];
    }

    class LightboxBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, { image: 0, protect: 1, portrait: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxBody",
    			options,
    			id: create_fragment$n.name
    		});
    	}

    	get image() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portrait() {
    		throw new Error("<LightboxBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portrait(value) {
    		throw new Error("<LightboxBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/LightboxFooter.svelte generated by Svelte v3.38.2 */

    const file$j = "node_modules/svelte-lightbox/src/Modal/LightboxFooter.svelte";

    // (18:4) {#if galleryLength}
    function create_if_block$a(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*activeImage*/ ctx[3] + 1 + "";
    	let t1;
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Image ");
    			t1 = text(t1_value);
    			t2 = text(" of ");
    			t3 = text(/*galleryLength*/ ctx[2]);
    			add_location(p, file$j, 18, 8, 373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*activeImage*/ 8 && t1_value !== (t1_value = /*activeImage*/ ctx[3] + 1 + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*galleryLength*/ 4) set_data_dev(t3, /*galleryLength*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(18:4) {#if galleryLength}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div;
    	let h2;
    	let t0;
    	let h5;
    	let t1;
    	let div_class_value;
    	let if_block = /*galleryLength*/ ctx[2] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = space();
    			h5 = element("h5");
    			t1 = space();
    			if (if_block) if_block.c();
    			add_location(h2, file$j, 11, 4, 257);
    			add_location(h5, file$j, 14, 4, 298);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("svelte-lightbox-footer " + /*classes*/ ctx[4]) + " svelte-1u8lh7d"));
    			attr_dev(div, "style", /*style*/ ctx[5]);
    			add_location(div, file$j, 10, 0, 195);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			h2.innerHTML = /*title*/ ctx[0];
    			append_dev(div, t0);
    			append_dev(div, h5);
    			h5.innerHTML = /*description*/ ctx[1];
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) h2.innerHTML = /*title*/ ctx[0];			if (dirty & /*description*/ 2) h5.innerHTML = /*description*/ ctx[1];
    			if (/*galleryLength*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*classes*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty("svelte-lightbox-footer " + /*classes*/ ctx[4]) + " svelte-1u8lh7d"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*style*/ 32) {
    				attr_dev(div, "style", /*style*/ ctx[5]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LightboxFooter", slots, []);
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { galleryLength } = $$props;
    	let { activeImage } = $$props;
    	let { classes = "" } = $$props;
    	let { style = "" } = $$props;
    	const writable_props = ["title", "description", "galleryLength", "activeImage", "classes", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightboxFooter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("galleryLength" in $$props) $$invalidate(2, galleryLength = $$props.galleryLength);
    		if ("activeImage" in $$props) $$invalidate(3, activeImage = $$props.activeImage);
    		if ("classes" in $$props) $$invalidate(4, classes = $$props.classes);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({
    		title,
    		description,
    		galleryLength,
    		activeImage,
    		classes,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("galleryLength" in $$props) $$invalidate(2, galleryLength = $$props.galleryLength);
    		if ("activeImage" in $$props) $$invalidate(3, activeImage = $$props.activeImage);
    		if ("classes" in $$props) $$invalidate(4, classes = $$props.classes);
    		if ("style" in $$props) $$invalidate(5, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, description, galleryLength, activeImage, classes, style];
    }

    class LightboxFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {
    			title: 0,
    			description: 1,
    			galleryLength: 2,
    			activeImage: 3,
    			classes: 4,
    			style: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightboxFooter",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*galleryLength*/ ctx[2] === undefined && !("galleryLength" in props)) {
    			console.warn("<LightboxFooter> was created without expected prop 'galleryLength'");
    		}

    		if (/*activeImage*/ ctx[3] === undefined && !("activeImage" in props)) {
    			console.warn("<LightboxFooter> was created without expected prop 'activeImage'");
    		}
    	}

    	get title() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get galleryLength() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set galleryLength(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImage() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<LightboxFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<LightboxFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Modal/Index.svelte generated by Svelte v3.38.2 */
    const file$i = "node_modules/svelte-lightbox/src/Modal/Index.svelte";

    // (43:12) <Body bind:image={image} bind:protect={protect} bind:portrait={portrait}>
    function create_default_slot$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[25], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 33554432)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[25], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(43:12) <Body bind:image={image} bind:protect={protect} bind:portrait={portrait}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let header;
    	let t0;
    	let body;
    	let updating_image;
    	let updating_protect;
    	let updating_portrait;
    	let t1;
    	let footer;
    	let updating_title;
    	let updating_description;
    	let updating_galleryLength;
    	let updating_activeImage;
    	let div1_class_value;
    	let div1_transition;
    	let current;
    	let mounted;
    	let dispose;
    	header = new LightboxHeader({ $$inline: true });
    	header.$on("close", /*close_handler*/ ctx[15]);

    	function body_image_binding(value) {
    		/*body_image_binding*/ ctx[16](value);
    	}

    	function body_protect_binding(value) {
    		/*body_protect_binding*/ ctx[17](value);
    	}

    	function body_portrait_binding(value) {
    		/*body_portrait_binding*/ ctx[18](value);
    	}

    	let body_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	if (/*image*/ ctx[2] !== void 0) {
    		body_props.image = /*image*/ ctx[2];
    	}

    	if (/*protect*/ ctx[3] !== void 0) {
    		body_props.protect = /*protect*/ ctx[3];
    	}

    	if (/*portrait*/ ctx[4] !== void 0) {
    		body_props.portrait = /*portrait*/ ctx[4];
    	}

    	body = new LightboxBody({ props: body_props, $$inline: true });
    	binding_callbacks.push(() => bind(body, "image", body_image_binding));
    	binding_callbacks.push(() => bind(body, "protect", body_protect_binding));
    	binding_callbacks.push(() => bind(body, "portrait", body_portrait_binding));

    	function footer_title_binding(value) {
    		/*footer_title_binding*/ ctx[19](value);
    	}

    	function footer_description_binding(value) {
    		/*footer_description_binding*/ ctx[20](value);
    	}

    	function footer_galleryLength_binding(value) {
    		/*footer_galleryLength_binding*/ ctx[21](value);
    	}

    	function footer_activeImage_binding(value) {
    		/*footer_activeImage_binding*/ ctx[22](value);
    	}

    	let footer_props = {};

    	if (/*actualTitle*/ ctx[7] !== void 0) {
    		footer_props.title = /*actualTitle*/ ctx[7];
    	}

    	if (/*actualDescription*/ ctx[8] !== void 0) {
    		footer_props.description = /*actualDescription*/ ctx[8];
    	}

    	if (/*gallery*/ ctx[0].length !== void 0) {
    		footer_props.galleryLength = /*gallery*/ ctx[0].length;
    	}

    	if (/*activeImage*/ ctx[1] !== void 0) {
    		footer_props.activeImage = /*activeImage*/ ctx[1];
    	}

    	footer = new LightboxFooter({ props: footer_props, $$inline: true });
    	binding_callbacks.push(() => bind(footer, "title", footer_title_binding));
    	binding_callbacks.push(() => bind(footer, "description", footer_description_binding));
    	binding_callbacks.push(() => bind(footer, "galleryLength", footer_galleryLength_binding));
    	binding_callbacks.push(() => bind(footer, "activeImage", footer_activeImage_binding));

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(body.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div0, "class", "svelte-lightbox svelte-tpon2m");
    			add_location(div0, file$i, 38, 8, 1218);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*allModalClasses*/ ctx[9]) + " svelte-tpon2m"));
    			attr_dev(div1, "style", /*modalStyle*/ ctx[5]);
    			add_location(div1, file$i, 36, 4, 1067);
    			attr_dev(div2, "class", "cover clearfix svelte-tpon2m");
    			add_location(div2, file$i, 34, 0, 1033);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(header, div0, null);
    			append_dev(div0, t0);
    			mount_component(body, div0, null);
    			append_dev(div0, t1);
    			mount_component(footer, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[23], false, false, false),
    					listen_dev(div1, "click", /*click_handler_1*/ ctx[24], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			const body_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				body_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_image && dirty & /*image*/ 4) {
    				updating_image = true;
    				body_changes.image = /*image*/ ctx[2];
    				add_flush_callback(() => updating_image = false);
    			}

    			if (!updating_protect && dirty & /*protect*/ 8) {
    				updating_protect = true;
    				body_changes.protect = /*protect*/ ctx[3];
    				add_flush_callback(() => updating_protect = false);
    			}

    			if (!updating_portrait && dirty & /*portrait*/ 16) {
    				updating_portrait = true;
    				body_changes.portrait = /*portrait*/ ctx[4];
    				add_flush_callback(() => updating_portrait = false);
    			}

    			body.$set(body_changes);
    			const footer_changes = {};

    			if (!updating_title && dirty & /*actualTitle*/ 128) {
    				updating_title = true;
    				footer_changes.title = /*actualTitle*/ ctx[7];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_description && dirty & /*actualDescription*/ 256) {
    				updating_description = true;
    				footer_changes.description = /*actualDescription*/ ctx[8];
    				add_flush_callback(() => updating_description = false);
    			}

    			if (!updating_galleryLength && dirty & /*gallery*/ 1) {
    				updating_galleryLength = true;
    				footer_changes.galleryLength = /*gallery*/ ctx[0].length;
    				add_flush_callback(() => updating_galleryLength = false);
    			}

    			if (!updating_activeImage && dirty & /*activeImage*/ 2) {
    				updating_activeImage = true;
    				footer_changes.activeImage = /*activeImage*/ ctx[1];
    				add_flush_callback(() => updating_activeImage = false);
    			}

    			footer.$set(footer_changes);

    			if (!current || dirty & /*allModalClasses*/ 512 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*allModalClasses*/ ctx[9]) + " svelte-tpon2m"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*modalStyle*/ 32) {
    				attr_dev(div1, "style", /*modalStyle*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(body.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: /*transitionDuration*/ ctx[6] }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(body.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: /*transitionDuration*/ ctx[6] }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(header);
    			destroy_component(body);
    			destroy_component(footer);
    			if (detaching && div1_transition) div1_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let allModalClasses;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Index", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { modalClasses = "" } = $$props;
    	let { modalStyle = "" } = $$props;
    	let { transitionDuration = 500 } = $$props;
    	let { image = {} } = $$props;
    	let { protect = false } = $$props;
    	let { portrait = false } = $$props;
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { gallery } = $$props;
    	let { activeImage } = $$props;
    	let actualTitle;
    	let actualDescription;

    	const writable_props = [
    		"modalClasses",
    		"modalStyle",
    		"transitionDuration",
    		"image",
    		"protect",
    		"portrait",
    		"title",
    		"description",
    		"gallery",
    		"activeImage"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	const close_handler = () => dispatch("close");

    	function body_image_binding(value) {
    		image = value;
    		$$invalidate(2, image);
    	}

    	function body_protect_binding(value) {
    		protect = value;
    		$$invalidate(3, protect);
    	}

    	function body_portrait_binding(value) {
    		portrait = value;
    		$$invalidate(4, portrait);
    	}

    	function footer_title_binding(value) {
    		actualTitle = value;
    		(((($$invalidate(7, actualTitle), $$invalidate(12, title)), $$invalidate(0, gallery)), $$invalidate(13, description)), $$invalidate(1, activeImage));
    	}

    	function footer_description_binding(value) {
    		actualDescription = value;
    		(((($$invalidate(8, actualDescription), $$invalidate(13, description)), $$invalidate(0, gallery)), $$invalidate(12, title)), $$invalidate(1, activeImage));
    	}

    	function footer_galleryLength_binding(value) {
    		if ($$self.$$.not_equal(gallery.length, value)) {
    			gallery.length = value;
    			$$invalidate(0, gallery);
    		}
    	}

    	function footer_activeImage_binding(value) {
    		activeImage = value;
    		$$invalidate(1, activeImage);
    	}

    	const click_handler = () => dispatch("modalClick");
    	const click_handler_1 = () => dispatch("topModalClick");

    	$$self.$$set = $$props => {
    		if ("modalClasses" in $$props) $$invalidate(11, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(5, modalStyle = $$props.modalStyle);
    		if ("transitionDuration" in $$props) $$invalidate(6, transitionDuration = $$props.transitionDuration);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(3, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(4, portrait = $$props.portrait);
    		if ("title" in $$props) $$invalidate(12, title = $$props.title);
    		if ("description" in $$props) $$invalidate(13, description = $$props.description);
    		if ("gallery" in $$props) $$invalidate(0, gallery = $$props.gallery);
    		if ("activeImage" in $$props) $$invalidate(1, activeImage = $$props.activeImage);
    		if ("$$scope" in $$props) $$invalidate(25, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		createEventDispatcher,
    		dispatch,
    		Header: LightboxHeader,
    		Body: LightboxBody,
    		Footer: LightboxFooter,
    		modalClasses,
    		modalStyle,
    		transitionDuration,
    		image,
    		protect,
    		portrait,
    		title,
    		description,
    		gallery,
    		activeImage,
    		actualTitle,
    		actualDescription,
    		allModalClasses
    	});

    	$$self.$inject_state = $$props => {
    		if ("modalClasses" in $$props) $$invalidate(11, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(5, modalStyle = $$props.modalStyle);
    		if ("transitionDuration" in $$props) $$invalidate(6, transitionDuration = $$props.transitionDuration);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("protect" in $$props) $$invalidate(3, protect = $$props.protect);
    		if ("portrait" in $$props) $$invalidate(4, portrait = $$props.portrait);
    		if ("title" in $$props) $$invalidate(12, title = $$props.title);
    		if ("description" in $$props) $$invalidate(13, description = $$props.description);
    		if ("gallery" in $$props) $$invalidate(0, gallery = $$props.gallery);
    		if ("activeImage" in $$props) $$invalidate(1, activeImage = $$props.activeImage);
    		if ("actualTitle" in $$props) $$invalidate(7, actualTitle = $$props.actualTitle);
    		if ("actualDescription" in $$props) $$invalidate(8, actualDescription = $$props.actualDescription);
    		if ("allModalClasses" in $$props) $$invalidate(9, allModalClasses = $$props.allModalClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*modalClasses*/ 2048) {
    			//let allModalClasses = modalClasses;
    			$$invalidate(9, allModalClasses = `${modalClasses} svelte-lightbox-overlay clearfix`);
    		}

    		if ($$self.$$.dirty & /*title*/ 4096) {
    			$$invalidate(7, actualTitle = title);
    		}

    		if ($$self.$$.dirty & /*description*/ 8192) {
    			$$invalidate(8, actualDescription = description);
    		}

    		if ($$self.$$.dirty & /*gallery, title, description, activeImage*/ 12291) {
    			if (gallery && !title && !description) {
    				$$invalidate(7, actualTitle = gallery[activeImage].title);
    				$$invalidate(8, actualDescription = gallery[activeImage].description);
    			}
    		}
    	};

    	return [
    		gallery,
    		activeImage,
    		image,
    		protect,
    		portrait,
    		modalStyle,
    		transitionDuration,
    		actualTitle,
    		actualDescription,
    		allModalClasses,
    		dispatch,
    		modalClasses,
    		title,
    		description,
    		slots,
    		close_handler,
    		body_image_binding,
    		body_protect_binding,
    		body_portrait_binding,
    		footer_title_binding,
    		footer_description_binding,
    		footer_galleryLength_binding,
    		footer_activeImage_binding,
    		click_handler,
    		click_handler_1,
    		$$scope
    	];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {
    			modalClasses: 11,
    			modalStyle: 5,
    			transitionDuration: 6,
    			image: 2,
    			protect: 3,
    			portrait: 4,
    			title: 12,
    			description: 13,
    			gallery: 0,
    			activeImage: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment$l.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*gallery*/ ctx[0] === undefined && !("gallery" in props)) {
    			console.warn("<Index> was created without expected prop 'gallery'");
    		}

    		if (/*activeImage*/ ctx[1] === undefined && !("activeImage" in props)) {
    			console.warn("<Index> was created without expected prop 'activeImage'");
    		}
    	}

    	get modalClasses() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClasses(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalStyle() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalStyle(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portrait() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portrait(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gallery() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gallery(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImage() {
    		throw new Error("<Index>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<Index>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-lightbox/src/Gallery/InternalGallery.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$3, console: console_1$3 } = globals;
    const file$h = "node_modules/svelte-lightbox/src/Gallery/InternalGallery.svelte";

    function create_fragment$k(ctx) {
    	let div1;
    	let button0;
    	let svg0;
    	let g0;
    	let path0;
    	let button0_disabled_value;
    	let t0;
    	let div0;
    	let t1;
    	let button1;
    	let svg1;
    	let g1;
    	let path1;
    	let button1_disabled_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			t0 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			attr_dev(path0, "class", "arrow svelte-wwe8hv");
    			attr_dev(path0, "d", "M8.7,7.22,4.59,11.33a1,1,0,0,0,0,1.41l4,4");
    			add_location(path0, file$h, 33, 16, 909);
    			add_location(g0, file$h, 32, 12, 889);
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "svelte-wwe8hv");
    			add_location(svg0, file$h, 31, 8, 816);
    			button0.disabled = button0_disabled_value = /*activeImage*/ ctx[0] === 0;
    			attr_dev(button0, "class", "previous-button svelte-wwe8hv");
    			add_location(button0, file$h, 30, 4, 721);
    			attr_dev(div0, "class", "slot svelte-wwe8hv");
    			add_location(div0, file$h, 38, 4, 1028);
    			attr_dev(path1, "class", "arrow svelte-wwe8hv");
    			attr_dev(path1, "d", "M15.3,16.78l4.11-4.11a1,1,0,0,0,0-1.41l-4-4");
    			add_location(path1, file$h, 46, 16, 1313);
    			add_location(g1, file$h, 45, 12, 1293);
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "svelte-wwe8hv");
    			add_location(svg1, file$h, 44, 8, 1220);
    			button1.disabled = button1_disabled_value = /*activeImage*/ ctx[0] === /*images*/ ctx[2]?.length - 1;
    			attr_dev(button1, "class", "next-button svelte-wwe8hv");
    			add_location(button1, file$h, 43, 4, 1118);
    			attr_dev(div1, "class", "wrapper svelte-wwe8hv");
    			add_location(div1, file$h, 29, 0, 695);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, g0);
    			append_dev(g0, path0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[7](div0);
    			append_dev(div1, t1);
    			append_dev(div1, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, g1);
    			append_dev(g1, path1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*previousImage*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*nextImage*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*activeImage*/ 1 && button0_disabled_value !== (button0_disabled_value = /*activeImage*/ ctx[0] === 0)) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*activeImage, images*/ 5 && button1_disabled_value !== (button1_disabled_value = /*activeImage*/ ctx[0] === /*images*/ ctx[2]?.length - 1)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[7](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InternalGallery", slots, ['default']);
    	let { activeImage = 0 } = $$props;
    	let slotContent;
    	let images;

    	const previousImage = () => {
    		$$invalidate(0, activeImage--, activeImage);
    	};

    	const nextImage = () => {
    		$$invalidate(0, activeImage++, activeImage);
    	};

    	const writable_props = ["activeImage"];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<InternalGallery> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			slotContent = $$value;
    			$$invalidate(1, slotContent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("activeImage" in $$props) $$invalidate(0, activeImage = $$props.activeImage);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		activeImage,
    		slotContent,
    		images,
    		previousImage,
    		nextImage
    	});

    	$$self.$inject_state = $$props => {
    		if ("activeImage" in $$props) $$invalidate(0, activeImage = $$props.activeImage);
    		if ("slotContent" in $$props) $$invalidate(1, slotContent = $$props.slotContent);
    		if ("images" in $$props) $$invalidate(2, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slotContent*/ 2) {
    			$$invalidate(2, images = slotContent?.children);
    		}

    		if ($$self.$$.dirty & /*images, activeImage*/ 5) {
    			{
    				console.log(typeof images);

    				if (images && activeImage < images.length) {
    					Object.values(images).forEach(img => {
    						img.hidden = true;
    						return img;
    					});

    					$$invalidate(2, images[activeImage].hidden = false, images);
    				} else if (images && activeImage >= images.length) {
    					console.error("LightboxGallery: Selected image doesn't exist, invalid activeImage");
    				}
    			}
    		}
    	};

    	return [
    		activeImage,
    		slotContent,
    		images,
    		previousImage,
    		nextImage,
    		$$scope,
    		slots,
    		div0_binding
    	];
    }

    class InternalGallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { activeImage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InternalGallery",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get activeImage() {
    		throw new Error("<InternalGallery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<InternalGallery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules/svelte-lightbox/src/Gallery/ExternalGallery.svelte generated by Svelte v3.38.2 */

    function create_fragment$j(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[0], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ExternalGallery", slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExternalGallery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class ExternalGallery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExternalGallery",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* node_modules/svelte-lightbox/src/Lightbox.svelte generated by Svelte v3.38.2 */
    const get_thumbnail_slot_changes_1 = dirty => ({});
    const get_thumbnail_slot_context_1 = ctx => ({});
    const get_image_slot_changes = dirty => ({});
    const get_image_slot_context = ctx => ({});
    const get_thumbnail_slot_changes = dirty => ({});
    const get_thumbnail_slot_context = ctx => ({});

    // (65:4) {:else}
    function create_else_block_1$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[32], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[32], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$3.name,
    		type: "else",
    		source: "(65:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if thumbnail || gallery}
    function create_if_block_3$4(ctx) {
    	let current;
    	const thumbnail_slot_template = /*#slots*/ ctx[17].thumbnail;
    	const thumbnail_slot = create_slot(thumbnail_slot_template, ctx, /*$$scope*/ ctx[32], get_thumbnail_slot_context);

    	const block = {
    		c: function create() {
    			if (thumbnail_slot) thumbnail_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (thumbnail_slot) {
    				thumbnail_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (thumbnail_slot) {
    				if (thumbnail_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(thumbnail_slot, thumbnail_slot_template, ctx, /*$$scope*/ ctx[32], dirty, get_thumbnail_slot_changes, get_thumbnail_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (thumbnail_slot) thumbnail_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$4.name,
    		type: "if",
    		source: "(63:4) {#if thumbnail || gallery}",
    		ctx
    	});

    	return block;
    }

    // (62:0) <Thumbnail bind:thumbnailClasses bind:thumbnailStyle bind:protect on:click={toggle}>
    function create_default_slot_2$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$4, create_else_block_1$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*thumbnail*/ ctx[12] || /*gallery*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(62:0) <Thumbnail bind:thumbnailClasses bind:thumbnailStyle bind:protect on:click={toggle}>",
    		ctx
    	});

    	return block;
    }

    // (70:0) {#if visible}
    function create_if_block$9(ctx) {
    	let modal;
    	let updating_modalClasses;
    	let updating_modalStyle;
    	let updating_transitionDuration;
    	let updating_image;
    	let updating_protect;
    	let updating_portrait;
    	let updating_title;
    	let updating_description;
    	let updating_gallery;
    	let updating_activeImage;
    	let current;

    	function modal_modalClasses_binding(value) {
    		/*modal_modalClasses_binding*/ ctx[22](value);
    	}

    	function modal_modalStyle_binding(value) {
    		/*modal_modalStyle_binding*/ ctx[23](value);
    	}

    	function modal_transitionDuration_binding(value) {
    		/*modal_transitionDuration_binding*/ ctx[24](value);
    	}

    	function modal_image_binding(value) {
    		/*modal_image_binding*/ ctx[25](value);
    	}

    	function modal_protect_binding(value) {
    		/*modal_protect_binding*/ ctx[26](value);
    	}

    	function modal_portrait_binding(value) {
    		/*modal_portrait_binding*/ ctx[27](value);
    	}

    	function modal_title_binding(value) {
    		/*modal_title_binding*/ ctx[28](value);
    	}

    	function modal_description_binding(value) {
    		/*modal_description_binding*/ ctx[29](value);
    	}

    	function modal_gallery_binding(value) {
    		/*modal_gallery_binding*/ ctx[30](value);
    	}

    	function modal_activeImage_binding(value) {
    		/*modal_activeImage_binding*/ ctx[31](value);
    	}

    	let modal_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	if (/*modalClasses*/ ctx[2] !== void 0) {
    		modal_props.modalClasses = /*modalClasses*/ ctx[2];
    	}

    	if (/*modalStyle*/ ctx[3] !== void 0) {
    		modal_props.modalStyle = /*modalStyle*/ ctx[3];
    	}

    	if (/*transitionDuration*/ ctx[8] !== void 0) {
    		modal_props.transitionDuration = /*transitionDuration*/ ctx[8];
    	}

    	if (/*image*/ ctx[10] !== void 0) {
    		modal_props.image = /*image*/ ctx[10];
    	}

    	if (/*protect*/ ctx[9] !== void 0) {
    		modal_props.protect = /*protect*/ ctx[9];
    	}

    	if (/*portrait*/ ctx[11] !== void 0) {
    		modal_props.portrait = /*portrait*/ ctx[11];
    	}

    	if (/*title*/ ctx[6] !== void 0) {
    		modal_props.title = /*title*/ ctx[6];
    	}

    	if (/*description*/ ctx[7] !== void 0) {
    		modal_props.description = /*description*/ ctx[7];
    	}

    	if (/*gallery*/ ctx[5] !== void 0) {
    		modal_props.gallery = /*gallery*/ ctx[5];
    	}

    	if (/*activeImage*/ ctx[4] !== void 0) {
    		modal_props.activeImage = /*activeImage*/ ctx[4];
    	}

    	modal = new Index({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "modalClasses", modal_modalClasses_binding));
    	binding_callbacks.push(() => bind(modal, "modalStyle", modal_modalStyle_binding));
    	binding_callbacks.push(() => bind(modal, "transitionDuration", modal_transitionDuration_binding));
    	binding_callbacks.push(() => bind(modal, "image", modal_image_binding));
    	binding_callbacks.push(() => bind(modal, "protect", modal_protect_binding));
    	binding_callbacks.push(() => bind(modal, "portrait", modal_portrait_binding));
    	binding_callbacks.push(() => bind(modal, "title", modal_title_binding));
    	binding_callbacks.push(() => bind(modal, "description", modal_description_binding));
    	binding_callbacks.push(() => bind(modal, "gallery", modal_gallery_binding));
    	binding_callbacks.push(() => bind(modal, "activeImage", modal_activeImage_binding));
    	modal.$on("close", /*toggle*/ ctx[14]);
    	modal.$on("topModalClick", /*toggle*/ ctx[14]);
    	modal.$on("modalClick", /*toggle*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty[0] & /*thumbnail, activeImage, gallery*/ 4144 | dirty[1] & /*$$scope*/ 2) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_modalClasses && dirty[0] & /*modalClasses*/ 4) {
    				updating_modalClasses = true;
    				modal_changes.modalClasses = /*modalClasses*/ ctx[2];
    				add_flush_callback(() => updating_modalClasses = false);
    			}

    			if (!updating_modalStyle && dirty[0] & /*modalStyle*/ 8) {
    				updating_modalStyle = true;
    				modal_changes.modalStyle = /*modalStyle*/ ctx[3];
    				add_flush_callback(() => updating_modalStyle = false);
    			}

    			if (!updating_transitionDuration && dirty[0] & /*transitionDuration*/ 256) {
    				updating_transitionDuration = true;
    				modal_changes.transitionDuration = /*transitionDuration*/ ctx[8];
    				add_flush_callback(() => updating_transitionDuration = false);
    			}

    			if (!updating_image && dirty[0] & /*image*/ 1024) {
    				updating_image = true;
    				modal_changes.image = /*image*/ ctx[10];
    				add_flush_callback(() => updating_image = false);
    			}

    			if (!updating_protect && dirty[0] & /*protect*/ 512) {
    				updating_protect = true;
    				modal_changes.protect = /*protect*/ ctx[9];
    				add_flush_callback(() => updating_protect = false);
    			}

    			if (!updating_portrait && dirty[0] & /*portrait*/ 2048) {
    				updating_portrait = true;
    				modal_changes.portrait = /*portrait*/ ctx[11];
    				add_flush_callback(() => updating_portrait = false);
    			}

    			if (!updating_title && dirty[0] & /*title*/ 64) {
    				updating_title = true;
    				modal_changes.title = /*title*/ ctx[6];
    				add_flush_callback(() => updating_title = false);
    			}

    			if (!updating_description && dirty[0] & /*description*/ 128) {
    				updating_description = true;
    				modal_changes.description = /*description*/ ctx[7];
    				add_flush_callback(() => updating_description = false);
    			}

    			if (!updating_gallery && dirty[0] & /*gallery*/ 32) {
    				updating_gallery = true;
    				modal_changes.gallery = /*gallery*/ ctx[5];
    				add_flush_callback(() => updating_gallery = false);
    			}

    			if (!updating_activeImage && dirty[0] & /*activeImage*/ 16) {
    				updating_activeImage = true;
    				modal_changes.activeImage = /*activeImage*/ ctx[4];
    				add_flush_callback(() => updating_activeImage = false);
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(70:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (82:8) {:else}
    function create_else_block$8(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[32], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[32], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(82:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (76:26) 
    function create_if_block_2$6(ctx) {
    	let internalgallery;
    	let updating_activeImage;
    	let current;

    	function internalgallery_activeImage_binding(value) {
    		/*internalgallery_activeImage_binding*/ ctx[21](value);
    	}

    	let internalgallery_props = {
    		$$slots: { default: [create_default_slot_1$3] },
    		$$scope: { ctx }
    	};

    	if (/*activeImage*/ ctx[4] !== void 0) {
    		internalgallery_props.activeImage = /*activeImage*/ ctx[4];
    	}

    	internalgallery = new InternalGallery({
    			props: internalgallery_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(internalgallery, "activeImage", internalgallery_activeImage_binding));

    	const block = {
    		c: function create() {
    			create_component(internalgallery.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(internalgallery, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const internalgallery_changes = {};

    			if (dirty[1] & /*$$scope*/ 2) {
    				internalgallery_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_activeImage && dirty[0] & /*activeImage*/ 16) {
    				updating_activeImage = true;
    				internalgallery_changes.activeImage = /*activeImage*/ ctx[4];
    				add_flush_callback(() => updating_activeImage = false);
    			}

    			internalgallery.$set(internalgallery_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(internalgallery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(internalgallery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(internalgallery, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$6.name,
    		type: "if",
    		source: "(76:26) ",
    		ctx
    	});

    	return block;
    }

    // (74:8) {#if thumbnail}
    function create_if_block_1$7(ctx) {
    	let current;
    	const image_slot_template = /*#slots*/ ctx[17].image;
    	const image_slot = create_slot(image_slot_template, ctx, /*$$scope*/ ctx[32], get_image_slot_context);

    	const block = {
    		c: function create() {
    			if (image_slot) image_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (image_slot) {
    				image_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (image_slot) {
    				if (image_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(image_slot, image_slot_template, ctx, /*$$scope*/ ctx[32], dirty, get_image_slot_changes, get_image_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(image_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(image_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (image_slot) image_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(74:8) {#if thumbnail}",
    		ctx
    	});

    	return block;
    }

    // (77:12) <InternalGallery bind:activeImage>
    function create_default_slot_1$3(ctx) {
    	let t;
    	let current;
    	const thumbnail_slot_template = /*#slots*/ ctx[17].thumbnail;
    	const thumbnail_slot = create_slot(thumbnail_slot_template, ctx, /*$$scope*/ ctx[32], get_thumbnail_slot_context_1);
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[32], null);

    	const block = {
    		c: function create() {
    			if (thumbnail_slot) thumbnail_slot.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (thumbnail_slot) {
    				thumbnail_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (thumbnail_slot) {
    				if (thumbnail_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(thumbnail_slot, thumbnail_slot_template, ctx, /*$$scope*/ ctx[32], dirty, get_thumbnail_slot_changes_1, get_thumbnail_slot_context_1);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[32], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (thumbnail_slot) thumbnail_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(77:12) <InternalGallery bind:activeImage>",
    		ctx
    	});

    	return block;
    }

    // (71:4) <Modal bind:modalClasses bind:modalStyle bind:transitionDuration bind:image bind:protect            bind:portrait bind:title bind:description bind:gallery bind:activeImage            on:close={toggle} on:topModalClick={toggle} on:modalClick={toggle}>
    function create_default_slot$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$7, create_if_block_2$6, create_else_block$8];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*thumbnail*/ ctx[12]) return 0;
    		if (/*gallery*/ ctx[5]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(71:4) <Modal bind:modalClasses bind:modalStyle bind:transitionDuration bind:image bind:protect            bind:portrait bind:title bind:description bind:gallery bind:activeImage            on:close={toggle} on:topModalClick={toggle} on:modalClick={toggle}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let thumbnail_1;
    	let updating_thumbnailClasses;
    	let updating_thumbnailStyle;
    	let updating_protect;
    	let t;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function thumbnail_1_thumbnailClasses_binding(value) {
    		/*thumbnail_1_thumbnailClasses_binding*/ ctx[18](value);
    	}

    	function thumbnail_1_thumbnailStyle_binding(value) {
    		/*thumbnail_1_thumbnailStyle_binding*/ ctx[19](value);
    	}

    	function thumbnail_1_protect_binding(value) {
    		/*thumbnail_1_protect_binding*/ ctx[20](value);
    	}

    	let thumbnail_1_props = {
    		$$slots: { default: [create_default_slot_2$2] },
    		$$scope: { ctx }
    	};

    	if (/*thumbnailClasses*/ ctx[0] !== void 0) {
    		thumbnail_1_props.thumbnailClasses = /*thumbnailClasses*/ ctx[0];
    	}

    	if (/*thumbnailStyle*/ ctx[1] !== void 0) {
    		thumbnail_1_props.thumbnailStyle = /*thumbnailStyle*/ ctx[1];
    	}

    	if (/*protect*/ ctx[9] !== void 0) {
    		thumbnail_1_props.protect = /*protect*/ ctx[9];
    	}

    	thumbnail_1 = new LightboxThumbnail({ props: thumbnail_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(thumbnail_1, "thumbnailClasses", thumbnail_1_thumbnailClasses_binding));
    	binding_callbacks.push(() => bind(thumbnail_1, "thumbnailStyle", thumbnail_1_thumbnailStyle_binding));
    	binding_callbacks.push(() => bind(thumbnail_1, "protect", thumbnail_1_protect_binding));
    	thumbnail_1.$on("click", /*toggle*/ ctx[14]);
    	let if_block = /*visible*/ ctx[13] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			create_component(thumbnail_1.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(thumbnail_1, target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeyDown*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const thumbnail_1_changes = {};

    			if (dirty[0] & /*thumbnail, gallery*/ 4128 | dirty[1] & /*$$scope*/ 2) {
    				thumbnail_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_thumbnailClasses && dirty[0] & /*thumbnailClasses*/ 1) {
    				updating_thumbnailClasses = true;
    				thumbnail_1_changes.thumbnailClasses = /*thumbnailClasses*/ ctx[0];
    				add_flush_callback(() => updating_thumbnailClasses = false);
    			}

    			if (!updating_thumbnailStyle && dirty[0] & /*thumbnailStyle*/ 2) {
    				updating_thumbnailStyle = true;
    				thumbnail_1_changes.thumbnailStyle = /*thumbnailStyle*/ ctx[1];
    				add_flush_callback(() => updating_thumbnailStyle = false);
    			}

    			if (!updating_protect && dirty[0] & /*protect*/ 512) {
    				updating_protect = true;
    				thumbnail_1_changes.protect = /*protect*/ ctx[9];
    				add_flush_callback(() => updating_protect = false);
    			}

    			thumbnail_1.$set(thumbnail_1_changes);

    			if (/*visible*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*visible*/ 8192) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thumbnail_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thumbnail_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(thumbnail_1, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Lightbox", slots, ['thumbnail','default','image']);
    	let { thumbnailClasses = "" } = $$props;
    	let { thumbnailStyle = "" } = $$props;
    	let { modalClasses = "" } = $$props;
    	let { modalStyle = "" } = $$props;
    	let { activeImage = 0 } = $$props;
    	let { gallery = false } = $$props;
    	let { title = "" } = $$props;
    	let { description = "" } = $$props;
    	let { transitionDuration = 500 } = $$props;
    	let { protect = false } = $$props;
    	let { image = {} } = $$props;
    	let { portrait = false } = $$props;
    	let { noScroll = true } = $$props;
    	let { thumbnail = false } = $$props;
    	let visible = false;

    	const toggle = () => {
    		$$invalidate(13, visible = !visible);

    		if (noScroll) {
    			mountedT();
    		}
    	};

    	let mountedT = () => {
    		
    	};

    	onMount(() => {
    		let defaultOverflow = document.body.style.overflow;

    		mountedT = () => {
    			if (visible) {
    				document.body.style.overflow = "hidden";
    			} else {
    				document.body.style.overflow = defaultOverflow;
    			}
    		};
    	});

    	const handleKeyDown = e => {
    		if (e.code === "Escape") {
    			$$invalidate(13, visible = false);
    		}
    	};

    	const writable_props = [
    		"thumbnailClasses",
    		"thumbnailStyle",
    		"modalClasses",
    		"modalStyle",
    		"activeImage",
    		"gallery",
    		"title",
    		"description",
    		"transitionDuration",
    		"protect",
    		"image",
    		"portrait",
    		"noScroll",
    		"thumbnail"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Lightbox> was created with unknown prop '${key}'`);
    	});

    	function thumbnail_1_thumbnailClasses_binding(value) {
    		thumbnailClasses = value;
    		$$invalidate(0, thumbnailClasses);
    	}

    	function thumbnail_1_thumbnailStyle_binding(value) {
    		thumbnailStyle = value;
    		$$invalidate(1, thumbnailStyle);
    	}

    	function thumbnail_1_protect_binding(value) {
    		protect = value;
    		$$invalidate(9, protect);
    	}

    	function internalgallery_activeImage_binding(value) {
    		activeImage = value;
    		$$invalidate(4, activeImage);
    	}

    	function modal_modalClasses_binding(value) {
    		modalClasses = value;
    		$$invalidate(2, modalClasses);
    	}

    	function modal_modalStyle_binding(value) {
    		modalStyle = value;
    		$$invalidate(3, modalStyle);
    	}

    	function modal_transitionDuration_binding(value) {
    		transitionDuration = value;
    		$$invalidate(8, transitionDuration);
    	}

    	function modal_image_binding(value) {
    		image = value;
    		$$invalidate(10, image);
    	}

    	function modal_protect_binding(value) {
    		protect = value;
    		$$invalidate(9, protect);
    	}

    	function modal_portrait_binding(value) {
    		portrait = value;
    		$$invalidate(11, portrait);
    	}

    	function modal_title_binding(value) {
    		title = value;
    		$$invalidate(6, title);
    	}

    	function modal_description_binding(value) {
    		description = value;
    		$$invalidate(7, description);
    	}

    	function modal_gallery_binding(value) {
    		gallery = value;
    		$$invalidate(5, gallery);
    	}

    	function modal_activeImage_binding(value) {
    		activeImage = value;
    		$$invalidate(4, activeImage);
    	}

    	$$self.$$set = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("modalClasses" in $$props) $$invalidate(2, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(3, modalStyle = $$props.modalStyle);
    		if ("activeImage" in $$props) $$invalidate(4, activeImage = $$props.activeImage);
    		if ("gallery" in $$props) $$invalidate(5, gallery = $$props.gallery);
    		if ("title" in $$props) $$invalidate(6, title = $$props.title);
    		if ("description" in $$props) $$invalidate(7, description = $$props.description);
    		if ("transitionDuration" in $$props) $$invalidate(8, transitionDuration = $$props.transitionDuration);
    		if ("protect" in $$props) $$invalidate(9, protect = $$props.protect);
    		if ("image" in $$props) $$invalidate(10, image = $$props.image);
    		if ("portrait" in $$props) $$invalidate(11, portrait = $$props.portrait);
    		if ("noScroll" in $$props) $$invalidate(16, noScroll = $$props.noScroll);
    		if ("thumbnail" in $$props) $$invalidate(12, thumbnail = $$props.thumbnail);
    		if ("$$scope" in $$props) $$invalidate(32, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Thumbnail: LightboxThumbnail,
    		Modal: Index,
    		InternalGallery,
    		onMount,
    		writable,
    		ExternalGallery,
    		thumbnailClasses,
    		thumbnailStyle,
    		modalClasses,
    		modalStyle,
    		activeImage,
    		gallery,
    		title,
    		description,
    		transitionDuration,
    		protect,
    		image,
    		portrait,
    		noScroll,
    		thumbnail,
    		visible,
    		toggle,
    		mountedT,
    		handleKeyDown
    	});

    	$$self.$inject_state = $$props => {
    		if ("thumbnailClasses" in $$props) $$invalidate(0, thumbnailClasses = $$props.thumbnailClasses);
    		if ("thumbnailStyle" in $$props) $$invalidate(1, thumbnailStyle = $$props.thumbnailStyle);
    		if ("modalClasses" in $$props) $$invalidate(2, modalClasses = $$props.modalClasses);
    		if ("modalStyle" in $$props) $$invalidate(3, modalStyle = $$props.modalStyle);
    		if ("activeImage" in $$props) $$invalidate(4, activeImage = $$props.activeImage);
    		if ("gallery" in $$props) $$invalidate(5, gallery = $$props.gallery);
    		if ("title" in $$props) $$invalidate(6, title = $$props.title);
    		if ("description" in $$props) $$invalidate(7, description = $$props.description);
    		if ("transitionDuration" in $$props) $$invalidate(8, transitionDuration = $$props.transitionDuration);
    		if ("protect" in $$props) $$invalidate(9, protect = $$props.protect);
    		if ("image" in $$props) $$invalidate(10, image = $$props.image);
    		if ("portrait" in $$props) $$invalidate(11, portrait = $$props.portrait);
    		if ("noScroll" in $$props) $$invalidate(16, noScroll = $$props.noScroll);
    		if ("thumbnail" in $$props) $$invalidate(12, thumbnail = $$props.thumbnail);
    		if ("visible" in $$props) $$invalidate(13, visible = $$props.visible);
    		if ("mountedT" in $$props) mountedT = $$props.mountedT;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		thumbnailClasses,
    		thumbnailStyle,
    		modalClasses,
    		modalStyle,
    		activeImage,
    		gallery,
    		title,
    		description,
    		transitionDuration,
    		protect,
    		image,
    		portrait,
    		thumbnail,
    		visible,
    		toggle,
    		handleKeyDown,
    		noScroll,
    		slots,
    		thumbnail_1_thumbnailClasses_binding,
    		thumbnail_1_thumbnailStyle_binding,
    		thumbnail_1_protect_binding,
    		internalgallery_activeImage_binding,
    		modal_modalClasses_binding,
    		modal_modalStyle_binding,
    		modal_transitionDuration_binding,
    		modal_image_binding,
    		modal_protect_binding,
    		modal_portrait_binding,
    		modal_title_binding,
    		modal_description_binding,
    		modal_gallery_binding,
    		modal_activeImage_binding,
    		$$scope
    	];
    }

    class Lightbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$i,
    			create_fragment$i,
    			safe_not_equal,
    			{
    				thumbnailClasses: 0,
    				thumbnailStyle: 1,
    				modalClasses: 2,
    				modalStyle: 3,
    				activeImage: 4,
    				gallery: 5,
    				title: 6,
    				description: 7,
    				transitionDuration: 8,
    				protect: 9,
    				image: 10,
    				portrait: 11,
    				noScroll: 16,
    				thumbnail: 12
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Lightbox",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get thumbnailClasses() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailClasses(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnailStyle() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnailStyle(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalClasses() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClasses(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalStyle() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalStyle(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeImage() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeImage(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gallery() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gallery(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionDuration() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get protect() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set protect(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get portrait() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set portrait(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noScroll() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noScroll(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thumbnail() {
    		throw new Error("<Lightbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thumbnail(value) {
    		throw new Error("<Lightbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Description.svelte generated by Svelte v3.38.2 */
    const file$g = "src/Description.svelte";

    // (38:8) <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
    function create_default_slot_2$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "img/screenshots/charm-scanning.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "charm scanning");
    			add_location(img, file$g, 38, 10, 1284);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(38:8) <Lightbox thumbnailStyle=\\\"width: 24rem; max-width: 90%; border: solid 1px #eee\\\">",
    		ctx
    	});

    	return block;
    }

    // (70:8) <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
    function create_default_slot_1$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "img/screenshots/charm-img.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "charm scrennshot");
    			add_location(img, file$g, 70, 10, 2458);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(70:8) <Lightbox thumbnailStyle=\\\"width: 24rem; max-width: 90%; border: solid 1px #eee\\\">",
    		ctx
    	});

    	return block;
    }

    // (73:8) <Lightbox thumbnailStyle="width: 24rem; max-width: 90%; border: solid 1px #eee">
    function create_default_slot$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = "img/screenshots/charm-substitutes.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "charm substitutes");
    			add_location(img, file$g, 73, 10, 2642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(73:8) <Lightbox thumbnailStyle=\\\"width: 24rem; max-width: 90%; border: solid 1px #eee\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let div16;
    	let div1;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let br2;
    	let t5;
    	let br3;
    	let t6;
    	let br4;
    	let t7;
    	let div4;
    	let div3;
    	let h21;
    	let t9;
    	let p1;
    	let t10;
    	let br5;
    	let t11;
    	let a0;
    	let t13;
    	let br6;
    	let t14;
    	let br7;
    	let t15;
    	let br8;
    	let t16;
    	let a1;
    	let t18;
    	let br9;
    	let t19;
    	let br10;
    	let t20;
    	let a2;
    	let t22;
    	let br11;
    	let t23;
    	let br12;
    	let t24;
    	let br13;
    	let t25;
    	let span0;
    	let t27;
    	let br14;
    	let t28;
    	let br15;
    	let t29;
    	let div2;
    	let lightbox0;
    	let t30;
    	let div7;
    	let div6;
    	let h22;
    	let t32;
    	let p2;
    	let t33;
    	let br16;
    	let t34;
    	let br17;
    	let t35;
    	let br18;
    	let t36;
    	let br19;
    	let t37;
    	let br20;
    	let t38;
    	let br21;
    	let t39;
    	let br22;
    	let t40;
    	let span1;
    	let br23;
    	let t42;
    	let br24;
    	let t43;
    	let br25;
    	let t44;
    	let br26;
    	let t45;
    	let span2;
    	let br27;
    	let t47;
    	let br28;
    	let t48;
    	let br29;
    	let t49;
    	let br30;
    	let t50;
    	let br31;
    	let t51;
    	let div5;
    	let lightbox1;
    	let t52;
    	let lightbox2;
    	let t53;
    	let div9;
    	let div8;
    	let h23;
    	let t55;
    	let p3;
    	let t57;
    	let div11;
    	let div10;
    	let h24;
    	let t59;
    	let p4;
    	let t60;
    	let br32;
    	let t61;
    	let br33;
    	let t62;
    	let br34;
    	let t63;
    	let span3;
    	let t64;
    	let br35;
    	let t65;
    	let br36;
    	let t66;
    	let div13;
    	let div12;
    	let h25;
    	let t68;
    	let h3;
    	let t70;
    	let p5;
    	let t71;
    	let br37;
    	let t72;
    	let br38;
    	let t73;
    	let br39;
    	let t74;
    	let br40;
    	let t75;
    	let br41;
    	let t76;
    	let br42;
    	let t77;
    	let br43;
    	let t78;
    	let t79;
    	let div15;
    	let div14;
    	let h26;
    	let t81;
    	let p6;
    	let t82;
    	let a3;
    	let t84;
    	let current;

    	lightbox0 = new Lightbox({
    			props: {
    				thumbnailStyle: "width: 24rem; max-width: 90%; border: solid 1px #eee",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	lightbox1 = new Lightbox({
    			props: {
    				thumbnailStyle: "width: 24rem; max-width: 90%; border: solid 1px #eee",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	lightbox2 = new Lightbox({
    			props: {
    				thumbnailStyle: "width: 24rem; max-width: 90%; border: solid 1px #eee",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "■ 概要";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("モンスターハンターライズの護石用ツールです。");
    			br0 = element("br");
    			t3 = text("\n        手持ちの護石を自動読み取りすることができます。");
    			br1 = element("br");
    			t4 = space();
    			br2 = element("br");
    			t5 = text("\n        読み取った護石は、スキャン時の画像や上位互換の護石が確認できます。");
    			br3 = element("br");
    			t6 = text("\n        また、護石を性能検索することもできます。");
    			br4 = element("br");
    			t7 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h21 = element("h2");
    			h21.textContent = "■ 護石スキャン";
    			t9 = space();
    			p1 = element("p");
    			t10 = text("護石のスキルやスロットを自動読み取りします。");
    			br5 = element("br");
    			t11 = text("\n        Nintendo Switch の 30 秒キャプチャ動画を用意するだけで、自動でデータ化できます。\n        (");
    			a0 = element("a");
    			a0.textContent = "動画例";
    			t13 = text(")");
    			br6 = element("br");
    			t14 = space();
    			br7 = element("br");
    			t15 = text("\n        出力形式は、<スキル1>,<スキル1Lv>,<スキル2>,<スキル2Lv>,<スロット1Lv>,<スロット2Lv>,<スロット3Lv> です。");
    			br8 = element("br");
    			t16 = space();
    			a1 = element("a");
    			a1.textContent = "泣きシミュ";
    			t18 = text(" さんでそのままインポートできます。");
    			br9 = element("br");
    			t19 = space();
    			br10 = element("br");
    			t20 = text("\n        キャプチャ動画の読み取りと、護石管理ページとの関係については、");
    			a2 = element("a");
    			a2.textContent = "護石管理";
    			t22 = text("を参照してください。");
    			br11 = element("br");
    			t23 = space();
    			br12 = element("br");
    			t24 = text("\n        (注意)");
    			br13 = element("br");
    			t25 = text("\n        - ");
    			span0 = element("span");
    			span0.textContent = "装飾品をつけたままだと、装飾品分のスキルも読み込まれてしまいます。";
    			t27 = text(" (一括解除が有用です)");
    			br14 = element("br");
    			t28 = text("\n        - キャプチャ動画のファイル名はデフォルトのまま使用することを推奨します。");
    			br15 = element("br");
    			t29 = space();
    			div2 = element("div");
    			create_component(lightbox0.$$.fragment);
    			t30 = space();
    			div7 = element("div");
    			div6 = element("div");
    			h22 = element("h2");
    			h22.textContent = "■ 護石管理";
    			t32 = space();
    			p2 = element("p");
    			t33 = text("スキャンした護石の一覧を見ることができます。");
    			br16 = element("br");
    			t34 = text("\n        護石データは蓄積され、次回、同じブラウザで開いた時にも保持されます。");
    			br17 = element("br");
    			t35 = space();
    			br18 = element("br");
    			t36 = text("\n        護石一覧における表示順は、動画読み込み順 → ゲーム内での表示順です。");
    			br19 = element("br");
    			t37 = text("\n        動画を撮る際に、レア度ソートし、1 ページ目から順に撮ることで、輪廻錬金での表示順と同じになります。");
    			br20 = element("br");
    			t38 = space();
    			br21 = element("br");
    			t39 = text("\n        表中の \"合計スキルレベル\" は、");
    			br22 = element("br");
    			t40 = space();
    			span1 = element("span");
    			span1.textContent = "(スキルを装飾品換算した場合のスロットLv) × (スキルLv) + (スロットLv)";
    			br23 = element("br");
    			t42 = text("\n        として計算しています。");
    			br24 = element("br");
    			t43 = space();
    			br25 = element("br");
    			t44 = text("\n        例: 納刀術2, ひるみ軽減1, スロット 3-1-0 の場合");
    			br26 = element("br");
    			t45 = space();
    			span2 = element("span");
    			span2.textContent = "2 × 2 + 1 × 1 + 3 + 1 + 0 = 9";
    			br27 = element("br");
    			t47 = space();
    			br28 = element("br");
    			t48 = text("\n        右端の画像ボタンを押すことで、スキャン時のスクリーンショットを確認できます。");
    			br29 = element("br");
    			t49 = text("\n        右端に上向き矢印がある場合、上位互換の護石があります。クリックで該当の護石を確認することができます。");
    			br30 = element("br");
    			t50 = space();
    			br31 = element("br");
    			t51 = space();
    			div5 = element("div");
    			create_component(lightbox1.$$.fragment);
    			t52 = space();
    			create_component(lightbox2.$$.fragment);
    			t53 = space();
    			div9 = element("div");
    			div8 = element("div");
    			h23 = element("h2");
    			h23.textContent = "■ 護石スペック検索";
    			t55 = space();
    			p3 = element("p");
    			p3.textContent = "スキャンした護石を検索することができます。\n        装飾品でスキルが実現できる場合も検索対象に含まれます。";
    			t57 = space();
    			div11 = element("div");
    			div10 = element("div");
    			h24 = element("h2");
    			h24.textContent = "■ 護石インポート・エクスポート";
    			t59 = space();
    			p4 = element("p");
    			t60 = text("スキャンした護石のエクスポート・インポートが行えます。");
    			br32 = element("br");
    			t61 = text("\n        入出力形式は、護石スキャン時と同様です。");
    			br33 = element("br");
    			t62 = space();
    			br34 = element("br");
    			t63 = space();
    			span3 = element("span");
    			t64 = text("上書きインポートを使用すると、保存している護石情報が全て失なわれます。");
    			br35 = element("br");
    			t65 = text("\n          また、インポート・エクスポートでは画像を扱っていないので、エクスポート → 上書きインポートすると護石画像が見れなくなります。");
    			br36 = element("br");
    			t66 = space();
    			div13 = element("div");
    			div12 = element("div");
    			h25 = element("h2");
    			h25.textContent = "■ FAQ";
    			t68 = space();
    			h3 = element("h3");
    			h3.textContent = "Q. 護石管理のページで表示される護石がスキャンした数より少ないです";
    			t70 = space();
    			p5 = element("p");
    			t71 = text("A.");
    			br37 = element("br");
    			t72 = text("\n        完全に同性能 (スキル、スキルレベル、スロット全て同じ) 護石は登録されない仕様になっています。");
    			br38 = element("br");
    			t73 = space();
    			br39 = element("br");
    			t74 = text("\n        これは、複数の動画を読み取った時に、同一の護石か別の同性能護石か判別する術がないためです。");
    			br40 = element("br");
    			t75 = text("\n        「重複していると思って輪廻に使ったら、同じ護石が登録されているだけだった」");
    			br41 = element("br");
    			t76 = text("\n        という事態を考慮し、安全重視の仕様にしています。");
    			br42 = element("br");
    			t77 = space();
    			br43 = element("br");
    			t78 = text("\n        スキャン時の出力は重複も含めて表示されるので、必要があればそちらをご利用下さい。");
    			t79 = space();
    			div15 = element("div");
    			div14 = element("div");
    			h26 = element("h2");
    			h26.textContent = "■ お問い合わせ";
    			t81 = space();
    			p6 = element("p");
    			t82 = text("不具合報告や要望は ");
    			a3 = element("a");
    			a3.textContent = "GitHub issue";
    			t84 = text(" にてお願いします。");
    			attr_dev(h20, "class", "svelte-a811x");
    			add_location(h20, file$g, 7, 6, 171);
    			add_location(br0, file$g, 9, 30, 225);
    			add_location(br1, file$g, 10, 31, 261);
    			add_location(br2, file$g, 11, 8, 274);
    			add_location(br3, file$g, 12, 41, 320);
    			add_location(br4, file$g, 13, 28, 353);
    			attr_dev(p0, "class", "svelte-a811x");
    			add_location(p0, file$g, 8, 6, 191);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$g, 6, 4, 141);
    			attr_dev(div1, "class", "card border border-light shadow-sm svelte-a811x");
    			add_location(div1, file$g, 5, 2, 88);
    			attr_dev(h21, "class", "svelte-a811x");
    			add_location(h21, file$g, 20, 6, 475);
    			add_location(br5, file$g, 22, 30, 533);
    			attr_dev(a0, "href", "sample/input.mp4");
    			add_location(a0, file$g, 24, 9, 606);
    			add_location(br6, file$g, 24, 44, 641);
    			add_location(br7, file$g, 25, 8, 654);
    			add_location(br8, file$g, 26, 121, 780);
    			attr_dev(a1, "href", "https://mhrise.wiki-db.com/sim/");
    			add_location(a1, file$g, 27, 8, 793);
    			add_location(br9, file$g, 27, 77, 862);
    			add_location(br10, file$g, 28, 8, 875);
    			attr_dev(a2, "href", "#h2-charm-manager");
    			add_location(a2, file$g, 29, 39, 919);
    			add_location(br11, file$g, 29, 85, 965);
    			add_location(br12, file$g, 30, 8, 978);
    			add_location(br13, file$g, 31, 12, 995);
    			set_style(span0, "color", "red");
    			add_location(span0, file$g, 32, 10, 1010);
    			add_location(br14, file$g, 32, 87, 1087);
    			add_location(br15, file$g, 33, 45, 1137);
    			attr_dev(p1, "class", "svelte-a811x");
    			add_location(p1, file$g, 21, 6, 499);
    			attr_dev(div2, "class", "lightboxes svelte-a811x");
    			add_location(div2, file$g, 36, 6, 1160);
    			attr_dev(div3, "class", "card-body");
    			add_location(div3, file$g, 19, 4, 445);
    			attr_dev(div4, "class", "card border border-light shadow-sm svelte-a811x");
    			add_location(div4, file$g, 18, 2, 392);
    			attr_dev(h22, "id", "h2-charm-manager");
    			attr_dev(h22, "class", "svelte-a811x");
    			add_location(h22, file$g, 46, 6, 1491);
    			add_location(br16, file$g, 48, 30, 1569);
    			add_location(br17, file$g, 49, 42, 1616);
    			add_location(br18, file$g, 50, 8, 1629);
    			add_location(br19, file$g, 51, 43, 1677);
    			add_location(br20, file$g, 52, 58, 1740);
    			add_location(br21, file$g, 53, 8, 1753);
    			add_location(br22, file$g, 54, 25, 1783);
    			attr_dev(span1, "class", "px-3 font-weight-bold");
    			add_location(span1, file$g, 55, 8, 1796);
    			add_location(br23, file$g, 55, 94, 1882);
    			add_location(br24, file$g, 56, 19, 1906);
    			add_location(br25, file$g, 57, 8, 1919);
    			add_location(br26, file$g, 58, 39, 1963);
    			attr_dev(span2, "class", "px-3");
    			add_location(span2, file$g, 59, 8, 1976);
    			add_location(br27, file$g, 59, 63, 2031);
    			add_location(br28, file$g, 60, 8, 2044);
    			add_location(br29, file$g, 61, 46, 2095);
    			add_location(br30, file$g, 62, 58, 2158);
    			add_location(br31, file$g, 63, 8, 2171);
    			attr_dev(p2, "class", "svelte-a811x");
    			add_location(p2, file$g, 47, 6, 1535);
    			attr_dev(div5, "class", "lightboxes svelte-a811x");
    			add_location(div5, file$g, 68, 6, 2334);
    			attr_dev(div6, "class", "card-body");
    			add_location(div6, file$g, 45, 4, 1461);
    			attr_dev(div7, "class", "card border border-light shadow-sm svelte-a811x");
    			add_location(div7, file$g, 44, 2, 1408);
    			attr_dev(h23, "class", "svelte-a811x");
    			add_location(h23, file$g, 81, 6, 2855);
    			attr_dev(p3, "class", "svelte-a811x");
    			add_location(p3, file$g, 82, 6, 2881);
    			attr_dev(div8, "class", "card-body");
    			add_location(div8, file$g, 80, 4, 2825);
    			attr_dev(div9, "class", "card border border-light shadow-sm svelte-a811x");
    			add_location(div9, file$g, 79, 2, 2772);
    			attr_dev(h24, "class", "svelte-a811x");
    			add_location(h24, file$g, 91, 6, 3068);
    			add_location(br32, file$g, 93, 35, 3139);
    			add_location(br33, file$g, 94, 28, 3172);
    			add_location(br34, file$g, 95, 8, 3185);
    			add_location(br35, file$g, 97, 45, 3269);
    			add_location(br36, file$g, 98, 73, 3347);
    			set_style(span3, "color", "red");
    			add_location(span3, file$g, 96, 8, 3198);
    			attr_dev(p4, "class", "svelte-a811x");
    			add_location(p4, file$g, 92, 6, 3100);
    			attr_dev(div10, "class", "card-body");
    			add_location(div10, file$g, 90, 4, 3038);
    			attr_dev(div11, "class", "card border border-light shadow-sm svelte-a811x");
    			add_location(div11, file$g, 89, 2, 2985);
    			attr_dev(h25, "class", "svelte-a811x");
    			add_location(h25, file$g, 106, 6, 3485);
    			attr_dev(h3, "class", "svelte-a811x");
    			add_location(h3, file$g, 107, 6, 3506);
    			add_location(br37, file$g, 111, 10, 3586);
    			add_location(br38, file$g, 112, 56, 3647);
    			add_location(br39, file$g, 113, 8, 3660);
    			add_location(br40, file$g, 114, 53, 3718);
    			add_location(br41, file$g, 115, 45, 3768);
    			add_location(br42, file$g, 116, 32, 3805);
    			add_location(br43, file$g, 117, 8, 3818);
    			attr_dev(p5, "class", "svelte-a811x");
    			add_location(p5, file$g, 110, 6, 3572);
    			attr_dev(div12, "class", "card-body");
    			add_location(div12, file$g, 105, 4, 3455);
    			attr_dev(div13, "class", "card border border-light shadow-sm svelte-a811x");
    			add_location(div13, file$g, 104, 2, 3402);
    			attr_dev(h26, "class", "svelte-a811x");
    			add_location(h26, file$g, 130, 6, 4197);
    			attr_dev(a3, "href", "https://github.com/ks-yuzu/mhrise-charm-scanner-web/issues");
    			add_location(a3, file$g, 132, 18, 4243);
    			attr_dev(p6, "class", "svelte-a811x");
    			add_location(p6, file$g, 131, 6, 4221);
    			attr_dev(div14, "class", "card-body");
    			add_location(div14, file$g, 129, 4, 4167);
    			attr_dev(div15, "class", "card border border-light shadow-sm svelte-a811x");
    			add_location(div15, file$g, 128, 2, 4114);
    			attr_dev(div16, "id", "description");
    			attr_dev(div16, "class", "svelte-a811x");
    			add_location(div16, file$g, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, br0);
    			append_dev(p0, t3);
    			append_dev(p0, br1);
    			append_dev(p0, t4);
    			append_dev(p0, br2);
    			append_dev(p0, t5);
    			append_dev(p0, br3);
    			append_dev(p0, t6);
    			append_dev(p0, br4);
    			append_dev(div16, t7);
    			append_dev(div16, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h21);
    			append_dev(div3, t9);
    			append_dev(div3, p1);
    			append_dev(p1, t10);
    			append_dev(p1, br5);
    			append_dev(p1, t11);
    			append_dev(p1, a0);
    			append_dev(p1, t13);
    			append_dev(p1, br6);
    			append_dev(p1, t14);
    			append_dev(p1, br7);
    			append_dev(p1, t15);
    			append_dev(p1, br8);
    			append_dev(p1, t16);
    			append_dev(p1, a1);
    			append_dev(p1, t18);
    			append_dev(p1, br9);
    			append_dev(p1, t19);
    			append_dev(p1, br10);
    			append_dev(p1, t20);
    			append_dev(p1, a2);
    			append_dev(p1, t22);
    			append_dev(p1, br11);
    			append_dev(p1, t23);
    			append_dev(p1, br12);
    			append_dev(p1, t24);
    			append_dev(p1, br13);
    			append_dev(p1, t25);
    			append_dev(p1, span0);
    			append_dev(p1, t27);
    			append_dev(p1, br14);
    			append_dev(p1, t28);
    			append_dev(p1, br15);
    			append_dev(div3, t29);
    			append_dev(div3, div2);
    			mount_component(lightbox0, div2, null);
    			append_dev(div16, t30);
    			append_dev(div16, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h22);
    			append_dev(div6, t32);
    			append_dev(div6, p2);
    			append_dev(p2, t33);
    			append_dev(p2, br16);
    			append_dev(p2, t34);
    			append_dev(p2, br17);
    			append_dev(p2, t35);
    			append_dev(p2, br18);
    			append_dev(p2, t36);
    			append_dev(p2, br19);
    			append_dev(p2, t37);
    			append_dev(p2, br20);
    			append_dev(p2, t38);
    			append_dev(p2, br21);
    			append_dev(p2, t39);
    			append_dev(p2, br22);
    			append_dev(p2, t40);
    			append_dev(p2, span1);
    			append_dev(p2, br23);
    			append_dev(p2, t42);
    			append_dev(p2, br24);
    			append_dev(p2, t43);
    			append_dev(p2, br25);
    			append_dev(p2, t44);
    			append_dev(p2, br26);
    			append_dev(p2, t45);
    			append_dev(p2, span2);
    			append_dev(p2, br27);
    			append_dev(p2, t47);
    			append_dev(p2, br28);
    			append_dev(p2, t48);
    			append_dev(p2, br29);
    			append_dev(p2, t49);
    			append_dev(p2, br30);
    			append_dev(p2, t50);
    			append_dev(p2, br31);
    			append_dev(div6, t51);
    			append_dev(div6, div5);
    			mount_component(lightbox1, div5, null);
    			append_dev(div5, t52);
    			mount_component(lightbox2, div5, null);
    			append_dev(div16, t53);
    			append_dev(div16, div9);
    			append_dev(div9, div8);
    			append_dev(div8, h23);
    			append_dev(div8, t55);
    			append_dev(div8, p3);
    			append_dev(div16, t57);
    			append_dev(div16, div11);
    			append_dev(div11, div10);
    			append_dev(div10, h24);
    			append_dev(div10, t59);
    			append_dev(div10, p4);
    			append_dev(p4, t60);
    			append_dev(p4, br32);
    			append_dev(p4, t61);
    			append_dev(p4, br33);
    			append_dev(p4, t62);
    			append_dev(p4, br34);
    			append_dev(p4, t63);
    			append_dev(p4, span3);
    			append_dev(span3, t64);
    			append_dev(span3, br35);
    			append_dev(span3, t65);
    			append_dev(span3, br36);
    			append_dev(div16, t66);
    			append_dev(div16, div13);
    			append_dev(div13, div12);
    			append_dev(div12, h25);
    			append_dev(div12, t68);
    			append_dev(div12, h3);
    			append_dev(div12, t70);
    			append_dev(div12, p5);
    			append_dev(p5, t71);
    			append_dev(p5, br37);
    			append_dev(p5, t72);
    			append_dev(p5, br38);
    			append_dev(p5, t73);
    			append_dev(p5, br39);
    			append_dev(p5, t74);
    			append_dev(p5, br40);
    			append_dev(p5, t75);
    			append_dev(p5, br41);
    			append_dev(p5, t76);
    			append_dev(p5, br42);
    			append_dev(p5, t77);
    			append_dev(p5, br43);
    			append_dev(p5, t78);
    			append_dev(div16, t79);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			append_dev(div14, h26);
    			append_dev(div14, t81);
    			append_dev(div14, p6);
    			append_dev(p6, t82);
    			append_dev(p6, a3);
    			append_dev(p6, t84);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const lightbox0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				lightbox0_changes.$$scope = { dirty, ctx };
    			}

    			lightbox0.$set(lightbox0_changes);
    			const lightbox1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				lightbox1_changes.$$scope = { dirty, ctx };
    			}

    			lightbox1.$set(lightbox1_changes);
    			const lightbox2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				lightbox2_changes.$$scope = { dirty, ctx };
    			}

    			lightbox2.$set(lightbox2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lightbox0.$$.fragment, local);
    			transition_in(lightbox1.$$.fragment, local);
    			transition_in(lightbox2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lightbox0.$$.fragment, local);
    			transition_out(lightbox1.$$.fragment, local);
    			transition_out(lightbox2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			destroy_component(lightbox0);
    			destroy_component(lightbox1);
    			destroy_component(lightbox2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Description", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Description> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Lightbox });
    	return [];
    }

    class Description extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Description",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    function clean($$props, extra_keys) {
      let keys = ["children", "$$scope", "$$slots"].concat(extra_keys);
      const rest = {};
      for (const key of Object.keys($$props)) {
        if (!(keys.includes(key))) {
          rest[key] = $$props[key];
        }
      }
      return rest;
    }

    function getOriginalBodyPadding() {
      const style = window ? window.getComputedStyle(document.body, null) : {};

      return parseInt((style && style.getPropertyValue('padding-right')) || 0, 10);
    }

    function getScrollbarWidth() {
      let scrollDiv = document.createElement('div');
      // .modal-scrollbar-measure styles // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.4/scss/_modal.scss#L106-L113
      scrollDiv.style.position = 'absolute';
      scrollDiv.style.top = '-9999px';
      scrollDiv.style.width = '50px';
      scrollDiv.style.height = '50px';
      scrollDiv.style.overflow = 'scroll';
      document.body.appendChild(scrollDiv);
      const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    }

    function setScrollbarWidth(padding) {
      document.body.style.paddingRight = padding > 0 ? `${padding}px` : null;
    }

    function isBodyOverflowing() {
      return window ? document.body.clientWidth < window.innerWidth : false;
    }

    function conditionallyUpdateScrollbar() {
      const scrollbarWidth = getScrollbarWidth();
      // https://github.com/twbs/bootstrap/blob/v4.0.0-alpha.6/js/src/modal.js#L433
      const fixedContent = document.querySelectorAll(
        '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top'
      )[0];
      const bodyPadding = fixedContent
        ? parseInt(fixedContent.style.paddingRight || 0, 10)
        : 0;

      if (isBodyOverflowing()) {
        setScrollbarWidth(bodyPadding + scrollbarWidth);
      }
    }

    function browserEvent(target, ...args) {
      target.addEventListener(...args);

      return () => target.removeEventListener(...args);
    }

    function toVal(mix) {
      var k, y, str = '';
      if (mix) {
        if (typeof mix === 'object') {
          if (Array.isArray(mix)) {
            for (k = 0; k < mix.length; k++) {
              if (mix[k] && (y = toVal(mix[k]))) {
                str && (str += ' ');
                str += y;
              }
            }
          } else {
            for (k in mix) {
              if (mix[k] && (y = toVal(k))) {
                str && (str += ' ');
                str += y;
              }
            }
          }
        } else if (typeof mix !== 'boolean' && !mix.call) {
          str && (str += ' ');
          str += mix;
        }
      }
      return str;
    }

    function clsx() {
      let i = 0, x, str = '';
      while (i < arguments.length) {
        if (x = toVal(arguments[i++])) {
          str && (str += ' ');
          str += x;
        }
      }
      return str;
    }

    function forwardEventsBuilder(component, additionalEvents = []) {
      const events = [
        'focus', 'blur', 'change', 'input', 'update','submit',
        'fullscreenchange', 'fullscreenerror', 'scroll',
        'cut', 'copy', 'paste',
        'keydown', 'keypress', 'keyup',
        'auxclick', 'click', 'contextmenu', 'dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup', 'pointerlockchange', 'pointerlockerror', 'select', 'wheel',
        'drag', 'dragend', 'dragenter', 'dragstart', 'dragleave', 'dragover', 'drop',
        'touchcancel', 'touchend', 'touchmove', 'touchstart',
        'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 'gotpointercapture', 'lostpointercapture',
        ...additionalEvents
      ];

      function forward(e) {
        bubble(component, e);
      }

      return node => {
        const destructors = [];

        for (let i = 0; i < events.length; i++) {
          destructors.push(listen(node, events[i], forward));
        }

        return {
          destroy: () => {
            for (let i = 0; i < destructors.length; i++) {
              destructors[i]();
            }
          }
        }
      };
    }

    /* node_modules/mdbsvelte/src/MDBBtn.svelte generated by Svelte v3.38.2 */
    const file$f = "node_modules/mdbsvelte/src/MDBBtn.svelte";

    // (64:0) {:else}
    function create_else_block_1$2(ctx) {
    	let button;
    	let button_aria_label_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);
    	const default_slot_or_fallback = default_slot || fallback_block$2(ctx);

    	let button_levels = [
    		/*props*/ ctx[12],
    		{ type: /*type*/ ctx[4] },
    		{ class: /*classes*/ ctx[9] },
    		{ disabled: /*disabled*/ ctx[3] },
    		{ value: /*value*/ ctx[6] },
    		{
    			"aria-label": button_aria_label_value = /*ariaLabel*/ ctx[8] || /*defaultAriaLabel*/ ctx[10]
    		},
    		{ style: /*style*/ ctx[0] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(button, button_data);
    			add_location(button, file$f, 64, 2, 1463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			/*button_binding*/ ctx[23](button);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[11].call(null, button));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2097152)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*close, children, $$scope*/ 2097158) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				/*props*/ ctx[12],
    				(!current || dirty & /*type*/ 16) && { type: /*type*/ ctx[4] },
    				(!current || dirty & /*classes*/ 512) && { class: /*classes*/ ctx[9] },
    				(!current || dirty & /*disabled*/ 8) && { disabled: /*disabled*/ ctx[3] },
    				(!current || dirty & /*value*/ 64) && { value: /*value*/ ctx[6] },
    				(!current || dirty & /*ariaLabel, defaultAriaLabel*/ 1280 && button_aria_label_value !== (button_aria_label_value = /*ariaLabel*/ ctx[8] || /*defaultAriaLabel*/ ctx[10])) && { "aria-label": button_aria_label_value },
    				(!current || dirty & /*style*/ 1) && { style: /*style*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			/*button_binding*/ ctx[23](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_1$2.name,
    		type: "else",
    		source: "(64:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (50:0) {#if href}
    function create_if_block$8(ctx) {
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let a_aria_label_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$6, create_else_block$7];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*children*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let a_levels = [
    		/*props*/ ctx[12],
    		{ class: /*classes*/ ctx[9] },
    		{ disabled: /*disabled*/ ctx[3] },
    		{ href: /*href*/ ctx[5] },
    		{
    			"aria-label": a_aria_label_value = /*ariaLabel*/ ctx[8] || /*defaultAriaLabel*/ ctx[10]
    		},
    		{ style: /*style*/ ctx[0] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			set_attributes(a, a_data);
    			add_location(a, file$f, 50, 2, 1232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[11].call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(a, null);
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				/*props*/ ctx[12],
    				(!current || dirty & /*classes*/ 512) && { class: /*classes*/ ctx[9] },
    				(!current || dirty & /*disabled*/ 8) && { disabled: /*disabled*/ ctx[3] },
    				(!current || dirty & /*href*/ 32) && { href: /*href*/ ctx[5] },
    				(!current || dirty & /*ariaLabel, defaultAriaLabel*/ 1280 && a_aria_label_value !== (a_aria_label_value = /*ariaLabel*/ ctx[8] || /*defaultAriaLabel*/ ctx[10])) && { "aria-label": a_aria_label_value },
    				(!current || dirty & /*style*/ 1) && { style: /*style*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(50:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (80:6) {:else}
    function create_else_block_2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2097152)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(80:6) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (78:25) 
    function create_if_block_3$3(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 2) set_data_dev(t, /*children*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(78:25) ",
    		ctx
    	});

    	return block_1;
    }

    // (76:6) {#if close}
    function create_if_block_2$5(ctx) {
    	let span;

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$f, 76, 8, 1694);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2$5.name,
    		type: "if",
    		source: "(76:6) {#if close}",
    		ctx
    	});

    	return block_1;
    }

    // (75:10)        
    function fallback_block$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$5, create_if_block_3$3, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*close*/ ctx[2]) return 0;
    		if (/*children*/ ctx[1]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: fallback_block$2.name,
    		type: "fallback",
    		source: "(75:10)        ",
    		ctx
    	});

    	return block_1;
    }

    // (60:4) {:else}
    function create_else_block$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[22].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2097152)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(60:4) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (58:4) {#if children}
    function create_if_block_1$6(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 2) set_data_dev(t, /*children*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(58:4) {#if children}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$g(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$8, create_else_block_1$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let ariaLabel;
    	let classes;
    	let defaultAriaLabel;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MDBBtn", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(current_component);
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let { block = false } = $$props;
    	let { children = undefined } = $$props;
    	let { close = false } = $$props;
    	let { color } = $$props;
    	let { disabled = false } = $$props;
    	let { type = "button" } = $$props;
    	let { href = "" } = $$props;
    	let { outline = false } = $$props;
    	let { size = "" } = $$props;
    	let { style = "" } = $$props;
    	let { value = "" } = $$props;
    	let { gradient } = $$props;
    	let domElement;
    	let { rounded } = $$props;

    	if (rounded) {
    		style = "border-radius: 10em" + style;
    	}

    	if (!color) {
    		href ? color = "primary" : color = "default";
    	}

    	const props = clean($$props, ["color", "gradient", "value", "style", "size"]);

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domElement = $$value;
    			$$invalidate(7, domElement);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(24, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(14, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(15, active = $$new_props.active);
    		if ("block" in $$new_props) $$invalidate(16, block = $$new_props.block);
    		if ("children" in $$new_props) $$invalidate(1, children = $$new_props.children);
    		if ("close" in $$new_props) $$invalidate(2, close = $$new_props.close);
    		if ("color" in $$new_props) $$invalidate(13, color = $$new_props.color);
    		if ("disabled" in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ("type" in $$new_props) $$invalidate(4, type = $$new_props.type);
    		if ("href" in $$new_props) $$invalidate(5, href = $$new_props.href);
    		if ("outline" in $$new_props) $$invalidate(17, outline = $$new_props.outline);
    		if ("size" in $$new_props) $$invalidate(18, size = $$new_props.size);
    		if ("style" in $$new_props) $$invalidate(0, style = $$new_props.style);
    		if ("value" in $$new_props) $$invalidate(6, value = $$new_props.value);
    		if ("gradient" in $$new_props) $$invalidate(19, gradient = $$new_props.gradient);
    		if ("rounded" in $$new_props) $$invalidate(20, rounded = $$new_props.rounded);
    		if ("$$scope" in $$new_props) $$invalidate(21, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clean,
    		clsx,
    		forwardEventsBuilder,
    		current_component,
    		forwardEvents,
    		className,
    		active,
    		block,
    		children,
    		close,
    		color,
    		disabled,
    		type,
    		href,
    		outline,
    		size,
    		style,
    		value,
    		gradient,
    		domElement,
    		rounded,
    		props,
    		ariaLabel,
    		classes,
    		defaultAriaLabel
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(24, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(14, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(15, active = $$new_props.active);
    		if ("block" in $$props) $$invalidate(16, block = $$new_props.block);
    		if ("children" in $$props) $$invalidate(1, children = $$new_props.children);
    		if ("close" in $$props) $$invalidate(2, close = $$new_props.close);
    		if ("color" in $$props) $$invalidate(13, color = $$new_props.color);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ("type" in $$props) $$invalidate(4, type = $$new_props.type);
    		if ("href" in $$props) $$invalidate(5, href = $$new_props.href);
    		if ("outline" in $$props) $$invalidate(17, outline = $$new_props.outline);
    		if ("size" in $$props) $$invalidate(18, size = $$new_props.size);
    		if ("style" in $$props) $$invalidate(0, style = $$new_props.style);
    		if ("value" in $$props) $$invalidate(6, value = $$new_props.value);
    		if ("gradient" in $$props) $$invalidate(19, gradient = $$new_props.gradient);
    		if ("domElement" in $$props) $$invalidate(7, domElement = $$new_props.domElement);
    		if ("rounded" in $$props) $$invalidate(20, rounded = $$new_props.rounded);
    		if ("ariaLabel" in $$props) $$invalidate(8, ariaLabel = $$new_props.ariaLabel);
    		if ("classes" in $$props) $$invalidate(9, classes = $$new_props.classes);
    		if ("defaultAriaLabel" in $$props) $$invalidate(10, defaultAriaLabel = $$new_props.defaultAriaLabel);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(8, ariaLabel = $$props["aria-label"]);

    		if ($$self.$$.dirty & /*className, close, gradient, outline, color, size, block, active*/ 1040388) {
    			$$invalidate(9, classes = clsx(
    				className,
    				{ close },
    				close || "btn waves-effect waves-light",
    				gradient
    				? `${gradient}-gradient`
    				: close || `btn${outline ? "-outline" : ""}-${color}`,
    				size ? `btn-${size}` : false,
    				block ? "btn-block" : false,
    				{ active }
    			));
    		}

    		if ($$self.$$.dirty & /*close*/ 4) {
    			$$invalidate(10, defaultAriaLabel = close ? "Close" : null);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		style,
    		children,
    		close,
    		disabled,
    		type,
    		href,
    		value,
    		domElement,
    		ariaLabel,
    		classes,
    		defaultAriaLabel,
    		forwardEvents,
    		props,
    		color,
    		className,
    		active,
    		block,
    		outline,
    		size,
    		gradient,
    		rounded,
    		$$scope,
    		slots,
    		button_binding
    	];
    }

    class MDBBtn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			class: 14,
    			active: 15,
    			block: 16,
    			children: 1,
    			close: 2,
    			color: 13,
    			disabled: 3,
    			type: 4,
    			href: 5,
    			outline: 17,
    			size: 18,
    			style: 0,
    			value: 6,
    			gradient: 19,
    			rounded: 20
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MDBBtn",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*color*/ ctx[13] === undefined && !("color" in props)) {
    			console.warn("<MDBBtn> was created without expected prop 'color'");
    		}

    		if (/*gradient*/ ctx[19] === undefined && !("gradient" in props)) {
    			console.warn("<MDBBtn> was created without expected prop 'gradient'");
    		}

    		if (/*rounded*/ ctx[20] === undefined && !("rounded" in props)) {
    			console.warn("<MDBBtn> was created without expected prop 'rounded'");
    		}
    	}

    	get class() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gradient() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gradient(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<MDBBtn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<MDBBtn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/mdbsvelte/src/MDBBtnGroup.svelte generated by Svelte v3.38.2 */
    const file$e = "node_modules/mdbsvelte/src/MDBBtnGroup.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	let div_levels = [
    		/*props*/ ctx[1],
    		{ role: "group" },
    		{
    			class: div_class_value = /*elementClasses*/ ctx[2].join(" ")
    		}
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$e, 21, 0, 494);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[0].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [/*props*/ ctx[1], { role: "group" }, { class: div_class_value }]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MDBBtnGroup", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(current_component);
    	let className = "";
    	const props = clean($$props, []);
    	let { size } = $$props;
    	let { vertical } = $$props;
    	let elementClasses = [vertical ? "btn-group-vertical" : "btn-group"];

    	if (className) {
    		elementClasses.push(className);
    	}

    	if (size) {
    		elementClasses.push(`btn-group-${size}`);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("size" in $$new_props) $$invalidate(3, size = $$new_props.size);
    		if ("vertical" in $$new_props) $$invalidate(4, vertical = $$new_props.vertical);
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clean,
    		clsx,
    		forwardEventsBuilder,
    		current_component,
    		forwardEvents,
    		className,
    		props,
    		size,
    		vertical,
    		elementClasses
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(8, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) className = $$new_props.className;
    		if ("size" in $$props) $$invalidate(3, size = $$new_props.size);
    		if ("vertical" in $$props) $$invalidate(4, vertical = $$new_props.vertical);
    		if ("elementClasses" in $$props) $$invalidate(2, elementClasses = $$new_props.elementClasses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [forwardEvents, props, elementClasses, size, vertical, $$scope, slots];
    }

    class MDBBtnGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { size: 3, vertical: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MDBBtnGroup",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*size*/ ctx[3] === undefined && !("size" in props)) {
    			console.warn("<MDBBtnGroup> was created without expected prop 'size'");
    		}

    		if (/*vertical*/ ctx[4] === undefined && !("vertical" in props)) {
    			console.warn("<MDBBtnGroup> was created without expected prop 'vertical'");
    		}
    	}

    	get size() {
    		throw new Error("<MDBBtnGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<MDBBtnGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<MDBBtnGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<MDBBtnGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/mdbsvelte/src/MDBModal.svelte generated by Svelte v3.38.2 */
    const file$d = "node_modules/mdbsvelte/src/MDBModal.svelte";
    const get_external_slot_changes = dirty => ({});
    const get_external_slot_context = ctx => ({});

    // (251:0) {#if _isMounted && isOpen}
    function create_if_block$7(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let div0_class_value;
    	let div2_transition;
    	let t1;
    	let div3;
    	let div3_class_value;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const external_slot_template = /*#slots*/ ctx[38].external;
    	const external_slot = create_slot(external_slot_template, ctx, /*$$scope*/ ctx[37], get_external_slot_context);
    	const default_slot_template = /*#slots*/ ctx[38].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[37], null);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (external_slot) external_slot.c();
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", div0_class_value = clsx("modal-content", /*contentClassName*/ ctx[8]));
    			add_location(div0, file$d, 262, 6, 6210);
    			attr_dev(div1, "class", /*classes*/ ctx[13]);
    			attr_dev(div1, "role", "document");
    			add_location(div1, file$d, 261, 4, 6146);
    			attr_dev(div2, "arialabelledby", /*labelledBy*/ ctx[5]);
    			attr_dev(div2, "class", /*modalClasses*/ ctx[12]);
    			attr_dev(div2, "role", "dialog");
    			set_style(div2, "display", "block");
    			add_location(div2, file$d, 251, 2, 5795);
    			attr_dev(div3, "class", div3_class_value = clsx({ "modal-backdrop": /*backdrop*/ ctx[6] }, "show", /*backdropClassName*/ ctx[7]));
    			add_location(div3, file$d, 268, 2, 6347);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (external_slot) {
    				external_slot.m(div0, null);
    			}

    			append_dev(div0, t0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div1_binding*/ ctx[39](div1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "introend", /*onModalOpened*/ ctx[15], false, false, false),
    					listen_dev(div2, "outroend", /*onModalClosed*/ ctx[16], false, false, false),
    					listen_dev(div2, "click", /*handleBackdropClick*/ ctx[14], false, false, false),
    					listen_dev(div2, "mousedown", /*handleBackdropMouseDown*/ ctx[17], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (external_slot) {
    				if (external_slot.p && (!current || dirty[1] & /*$$scope*/ 64)) {
    					update_slot(external_slot, external_slot_template, ctx, /*$$scope*/ ctx[37], dirty, get_external_slot_changes, get_external_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 64)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[37], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*contentClassName*/ 256 && div0_class_value !== (div0_class_value = clsx("modal-content", /*contentClassName*/ ctx[8]))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty[0] & /*classes*/ 8192) {
    				attr_dev(div1, "class", /*classes*/ ctx[13]);
    			}

    			if (!current || dirty[0] & /*labelledBy*/ 32) {
    				attr_dev(div2, "arialabelledby", /*labelledBy*/ ctx[5]);
    			}

    			if (!current || dirty[0] & /*modalClasses*/ 4096) {
    				attr_dev(div2, "class", /*modalClasses*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*backdrop, backdropClassName*/ 192 && div3_class_value !== (div3_class_value = clsx({ "modal-backdrop": /*backdrop*/ ctx[6] }, "show", /*backdropClassName*/ ctx[7]))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(external_slot, local);
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(
    					div2,
    					fly,
    					{
    						x: /*displacementX*/ ctx[0],
    						y: /*displacementY*/ ctx[1],
    						duration: /*fade*/ ctx[9] && /*duration*/ ctx[3]
    					},
    					true
    				);

    				div2_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(
    					div3,
    					fade,
    					{
    						duration: /*fade*/ ctx[9] && /*backdropDuration*/ ctx[4]
    					},
    					true
    				);

    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(external_slot, local);
    			transition_out(default_slot, local);

    			if (!div2_transition) div2_transition = create_bidirectional_transition(
    				div2,
    				fly,
    				{
    					x: /*displacementX*/ ctx[0],
    					y: /*displacementY*/ ctx[1],
    					duration: /*fade*/ ctx[9] && /*duration*/ ctx[3]
    				},
    				false
    			);

    			div2_transition.run(0);

    			if (!div3_transition) div3_transition = create_bidirectional_transition(
    				div3,
    				fade,
    				{
    					duration: /*fade*/ ctx[9] && /*backdropDuration*/ ctx[4]
    				},
    				false
    			);

    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (external_slot) external_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			/*div1_binding*/ ctx[39](null);
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div3);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(251:0) {#if _isMounted && isOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*_isMounted*/ ctx[10] && /*isOpen*/ ctx[2] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*_isMounted*/ ctx[10] && /*isOpen*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*_isMounted, isOpen*/ 1028) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    let openCount = 0;
    const dialogBaseClass = "modal-dialog";

    function instance$e($$self, $$props, $$invalidate) {
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MDBModal", slots, ['external','default']);
    	const forwardEvents = forwardEventsBuilder(current_component);
    	let { class: className = "" } = $$props;
    	let { isOpen } = $$props;
    	let { autoFocus = true } = $$props;
    	let { centered = false } = $$props;
    	let { duration = 500 } = $$props;
    	let { backdropDuration = duration } = $$props;
    	let { scrollable = false } = $$props;
    	let { size = "" } = $$props;
    	let { toggle = undefined } = $$props;
    	let { labelledBy = "" } = $$props;
    	let { backdrop = true } = $$props;
    	let { onEnter = undefined } = $$props;
    	let { onExit = undefined } = $$props;

    	let { onOpened = () => {
    		
    	} } = $$props;

    	let { onClosed = () => {
    		
    	} } = $$props;

    	let { wrapClassName = "" } = $$props;
    	let { modalClassName = "" } = $$props;
    	let { backdropClassName = "" } = $$props;
    	let { contentClassName = "" } = $$props;
    	let { fade: fade$1 = true } = $$props;
    	let { zIndex = 1050 } = $$props;
    	let { unmountOnClose = true } = $$props;
    	let { returnFocusAfterClose = true } = $$props;
    	let { displacementX = 0 } = $$props;
    	let { displacementY = -300 } = $$props;
    	let { side } = $$props;
    	let { position = "" } = $$props;
    	let { fullHeight } = $$props;
    	let { frame } = $$props;

    	const props = clean($$props, [
    		"isOpen",
    		"autoFocus",
    		"centered",
    		"duration",
    		"backdropDuration",
    		"scrollable",
    		"size",
    		"toggle",
    		"labelledBy",
    		"toggle",
    		"onEnter",
    		"onExit",
    		"onOpened",
    		"onClosed",
    		"wrapClassName",
    		"modalClassName",
    		"backdropClassName",
    		"contentClassName",
    		"fade",
    		"zIndex",
    		"unmountOnClose",
    		"returnFocusAfterClose",
    		"side",
    		"position",
    		"frame",
    		"backdrop"
    	]);

    	let hasOpened = false;
    	let _isMounted = false;
    	let _triggeringElement;
    	let _originalBodyPadding;
    	let _lastIsOpen = isOpen;
    	let _lastHasOpened = hasOpened;
    	let _dialog;
    	let _mouseDownElement;
    	let _removeEscListener;
    	let modalClasses;

    	onMount(() => {
    		if (isOpen) {
    			init();
    			hasOpened = true;
    		}

    		if (typeof onEnter === "function") {
    			onEnter();
    		}

    		if (hasOpened && autoFocus) {
    			setFocus();
    		}
    	});

    	onDestroy(() => {
    		if (typeof onExit === "function") {
    			onExit();
    		}

    		destroy();

    		if (hasOpened) {
    			close();
    		}
    	});

    	afterUpdate(() => {
    		if (isOpen && !_lastIsOpen) {
    			init();
    			hasOpened = true;
    		}

    		if (autoFocus && hasOpened && !_lastHasOpened) {
    			setFocus();
    		}

    		_lastIsOpen = isOpen;
    		_lastHasOpened = hasOpened;
    	});

    	function setFocus() {
    		if (_dialog && _dialog.parentNode && typeof _dialog.parentNode.focus === "function") {
    			_dialog.parentNode.focus();
    		}
    	}

    	function init() {
    		try {
    			_triggeringElement = document.activeElement;
    		} catch(err) {
    			_triggeringElement = null;
    		}

    		_originalBodyPadding = getOriginalBodyPadding();
    		conditionallyUpdateScrollbar();

    		if (openCount === 0) {
    			document.body.className = clsx(document.body.className, "modal-open");
    		}

    		++openCount;
    		$$invalidate(10, _isMounted = true);
    	}

    	function manageFocusAfterClose() {
    		if (_triggeringElement) {
    			if (typeof _triggeringElement.focus === "function" && returnFocusAfterClose) {
    				_triggeringElement.focus();
    			}

    			_triggeringElement = null;
    		}
    	}

    	function destroy() {
    		manageFocusAfterClose();
    	}

    	function close() {
    		if (openCount <= 1) {
    			const modalOpenClassName = "modal-open";
    			const modalOpenClassNameRegex = new RegExp(`(^| )${modalOpenClassName}( |$)`);
    			document.body.className = document.body.className.replace(modalOpenClassNameRegex, " ").trim();
    		}

    		manageFocusAfterClose();
    		openCount = Math.max(0, openCount - 1);
    		setScrollbarWidth(_originalBodyPadding);
    	}

    	function handleBackdropClick(e) {
    		if (e.target === _mouseDownElement) {
    			e.stopPropagation();

    			if (!isOpen || !backdrop) {
    				return;
    			}

    			const backdropElem = _dialog ? _dialog.parentNode : null;

    			if (backdropElem && e.target === backdropElem && toggle) {
    				toggle(e);
    			}
    		}
    	}

    	function onModalOpened() {
    		_removeEscListener = browserEvent(document, "keydown", event => {
    			if (event.key && event.key === "Escape") {
    				toggle(event);
    			}
    		});

    		onOpened();
    	}

    	function onModalClosed() {
    		onClosed();

    		if (_removeEscListener) {
    			_removeEscListener();
    		}

    		if (unmountOnClose) {
    			destroy();
    		}

    		close();

    		if (_isMounted) {
    			hasOpened = false;
    		}

    		$$invalidate(10, _isMounted = false);
    	}

    	function handleBackdropMouseDown(e) {
    		_mouseDownElement = e.target;
    	}

    	if (position.indexOf("right") !== -1) {
    		displacementX = 300;
    		if (fullHeight) displacementY = 0;
    	}

    	if (position.indexOf("left") !== -1) {
    		displacementX = -300;
    		if (fullHeight) displacementY = 0;
    	}

    	if (position.indexOf("top") !== -1) {
    		displacementY = -300;
    		if (fullHeight) displacementX = 0;
    	}

    	if (position.indexOf("bottom") !== -1) {
    		displacementY = 300;
    		if (fullHeight) displacementX = 0;
    	}

    	modalClasses = clsx("modal", "show", modalClassName);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			_dialog = $$value;
    			$$invalidate(11, _dialog);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(54, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(18, className = $$new_props.class);
    		if ("isOpen" in $$new_props) $$invalidate(2, isOpen = $$new_props.isOpen);
    		if ("autoFocus" in $$new_props) $$invalidate(19, autoFocus = $$new_props.autoFocus);
    		if ("centered" in $$new_props) $$invalidate(20, centered = $$new_props.centered);
    		if ("duration" in $$new_props) $$invalidate(3, duration = $$new_props.duration);
    		if ("backdropDuration" in $$new_props) $$invalidate(4, backdropDuration = $$new_props.backdropDuration);
    		if ("scrollable" in $$new_props) $$invalidate(21, scrollable = $$new_props.scrollable);
    		if ("size" in $$new_props) $$invalidate(22, size = $$new_props.size);
    		if ("toggle" in $$new_props) $$invalidate(23, toggle = $$new_props.toggle);
    		if ("labelledBy" in $$new_props) $$invalidate(5, labelledBy = $$new_props.labelledBy);
    		if ("backdrop" in $$new_props) $$invalidate(6, backdrop = $$new_props.backdrop);
    		if ("onEnter" in $$new_props) $$invalidate(24, onEnter = $$new_props.onEnter);
    		if ("onExit" in $$new_props) $$invalidate(25, onExit = $$new_props.onExit);
    		if ("onOpened" in $$new_props) $$invalidate(26, onOpened = $$new_props.onOpened);
    		if ("onClosed" in $$new_props) $$invalidate(27, onClosed = $$new_props.onClosed);
    		if ("wrapClassName" in $$new_props) $$invalidate(28, wrapClassName = $$new_props.wrapClassName);
    		if ("modalClassName" in $$new_props) $$invalidate(29, modalClassName = $$new_props.modalClassName);
    		if ("backdropClassName" in $$new_props) $$invalidate(7, backdropClassName = $$new_props.backdropClassName);
    		if ("contentClassName" in $$new_props) $$invalidate(8, contentClassName = $$new_props.contentClassName);
    		if ("fade" in $$new_props) $$invalidate(9, fade$1 = $$new_props.fade);
    		if ("zIndex" in $$new_props) $$invalidate(30, zIndex = $$new_props.zIndex);
    		if ("unmountOnClose" in $$new_props) $$invalidate(31, unmountOnClose = $$new_props.unmountOnClose);
    		if ("returnFocusAfterClose" in $$new_props) $$invalidate(32, returnFocusAfterClose = $$new_props.returnFocusAfterClose);
    		if ("displacementX" in $$new_props) $$invalidate(0, displacementX = $$new_props.displacementX);
    		if ("displacementY" in $$new_props) $$invalidate(1, displacementY = $$new_props.displacementY);
    		if ("side" in $$new_props) $$invalidate(33, side = $$new_props.side);
    		if ("position" in $$new_props) $$invalidate(34, position = $$new_props.position);
    		if ("fullHeight" in $$new_props) $$invalidate(35, fullHeight = $$new_props.fullHeight);
    		if ("frame" in $$new_props) $$invalidate(36, frame = $$new_props.frame);
    		if ("$$scope" in $$new_props) $$invalidate(37, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		openCount,
    		onDestroy,
    		onMount,
    		afterUpdate,
    		fadeTransition: fade,
    		flyTransition: fly,
    		conditionallyUpdateScrollbar,
    		getOriginalBodyPadding,
    		setScrollbarWidth,
    		clean,
    		browserEvent,
    		clsx,
    		forwardEventsBuilder,
    		current_component,
    		forwardEvents,
    		className,
    		isOpen,
    		autoFocus,
    		centered,
    		duration,
    		backdropDuration,
    		scrollable,
    		size,
    		toggle,
    		labelledBy,
    		backdrop,
    		onEnter,
    		onExit,
    		onOpened,
    		onClosed,
    		wrapClassName,
    		modalClassName,
    		backdropClassName,
    		contentClassName,
    		fade: fade$1,
    		zIndex,
    		unmountOnClose,
    		returnFocusAfterClose,
    		displacementX,
    		displacementY,
    		side,
    		position,
    		fullHeight,
    		frame,
    		props,
    		hasOpened,
    		_isMounted,
    		_triggeringElement,
    		_originalBodyPadding,
    		_lastIsOpen,
    		_lastHasOpened,
    		_dialog,
    		_mouseDownElement,
    		_removeEscListener,
    		modalClasses,
    		setFocus,
    		init,
    		manageFocusAfterClose,
    		destroy,
    		close,
    		handleBackdropClick,
    		onModalOpened,
    		onModalClosed,
    		handleBackdropMouseDown,
    		dialogBaseClass,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(54, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(18, className = $$new_props.className);
    		if ("isOpen" in $$props) $$invalidate(2, isOpen = $$new_props.isOpen);
    		if ("autoFocus" in $$props) $$invalidate(19, autoFocus = $$new_props.autoFocus);
    		if ("centered" in $$props) $$invalidate(20, centered = $$new_props.centered);
    		if ("duration" in $$props) $$invalidate(3, duration = $$new_props.duration);
    		if ("backdropDuration" in $$props) $$invalidate(4, backdropDuration = $$new_props.backdropDuration);
    		if ("scrollable" in $$props) $$invalidate(21, scrollable = $$new_props.scrollable);
    		if ("size" in $$props) $$invalidate(22, size = $$new_props.size);
    		if ("toggle" in $$props) $$invalidate(23, toggle = $$new_props.toggle);
    		if ("labelledBy" in $$props) $$invalidate(5, labelledBy = $$new_props.labelledBy);
    		if ("backdrop" in $$props) $$invalidate(6, backdrop = $$new_props.backdrop);
    		if ("onEnter" in $$props) $$invalidate(24, onEnter = $$new_props.onEnter);
    		if ("onExit" in $$props) $$invalidate(25, onExit = $$new_props.onExit);
    		if ("onOpened" in $$props) $$invalidate(26, onOpened = $$new_props.onOpened);
    		if ("onClosed" in $$props) $$invalidate(27, onClosed = $$new_props.onClosed);
    		if ("wrapClassName" in $$props) $$invalidate(28, wrapClassName = $$new_props.wrapClassName);
    		if ("modalClassName" in $$props) $$invalidate(29, modalClassName = $$new_props.modalClassName);
    		if ("backdropClassName" in $$props) $$invalidate(7, backdropClassName = $$new_props.backdropClassName);
    		if ("contentClassName" in $$props) $$invalidate(8, contentClassName = $$new_props.contentClassName);
    		if ("fade" in $$props) $$invalidate(9, fade$1 = $$new_props.fade);
    		if ("zIndex" in $$props) $$invalidate(30, zIndex = $$new_props.zIndex);
    		if ("unmountOnClose" in $$props) $$invalidate(31, unmountOnClose = $$new_props.unmountOnClose);
    		if ("returnFocusAfterClose" in $$props) $$invalidate(32, returnFocusAfterClose = $$new_props.returnFocusAfterClose);
    		if ("displacementX" in $$props) $$invalidate(0, displacementX = $$new_props.displacementX);
    		if ("displacementY" in $$props) $$invalidate(1, displacementY = $$new_props.displacementY);
    		if ("side" in $$props) $$invalidate(33, side = $$new_props.side);
    		if ("position" in $$props) $$invalidate(34, position = $$new_props.position);
    		if ("fullHeight" in $$props) $$invalidate(35, fullHeight = $$new_props.fullHeight);
    		if ("frame" in $$props) $$invalidate(36, frame = $$new_props.frame);
    		if ("hasOpened" in $$props) hasOpened = $$new_props.hasOpened;
    		if ("_isMounted" in $$props) $$invalidate(10, _isMounted = $$new_props._isMounted);
    		if ("_triggeringElement" in $$props) _triggeringElement = $$new_props._triggeringElement;
    		if ("_originalBodyPadding" in $$props) _originalBodyPadding = $$new_props._originalBodyPadding;
    		if ("_lastIsOpen" in $$props) _lastIsOpen = $$new_props._lastIsOpen;
    		if ("_lastHasOpened" in $$props) _lastHasOpened = $$new_props._lastHasOpened;
    		if ("_dialog" in $$props) $$invalidate(11, _dialog = $$new_props._dialog);
    		if ("_mouseDownElement" in $$props) _mouseDownElement = $$new_props._mouseDownElement;
    		if ("_removeEscListener" in $$props) _removeEscListener = $$new_props._removeEscListener;
    		if ("modalClasses" in $$props) $$invalidate(12, modalClasses = $$new_props.modalClasses);
    		if ("classes" in $$props) $$invalidate(13, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*className, size, centered, scrollable*/ 7602176 | $$self.$$.dirty[1] & /*side, fullHeight, frame, position*/ 60) {
    			$$invalidate(13, classes = clsx(dialogBaseClass, className, {
    				[`modal-${size}`]: size,
    				[`${dialogBaseClass}-centered`]: centered,
    				[`${dialogBaseClass}-scrollable`]: scrollable,
    				"modal-side": side,
    				"modal-full-height": fullHeight,
    				"modal-frame": frame,
    				[`modal-${position}`]: position
    			}));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		displacementX,
    		displacementY,
    		isOpen,
    		duration,
    		backdropDuration,
    		labelledBy,
    		backdrop,
    		backdropClassName,
    		contentClassName,
    		fade$1,
    		_isMounted,
    		_dialog,
    		modalClasses,
    		classes,
    		handleBackdropClick,
    		onModalOpened,
    		onModalClosed,
    		handleBackdropMouseDown,
    		className,
    		autoFocus,
    		centered,
    		scrollable,
    		size,
    		toggle,
    		onEnter,
    		onExit,
    		onOpened,
    		onClosed,
    		wrapClassName,
    		modalClassName,
    		zIndex,
    		unmountOnClose,
    		returnFocusAfterClose,
    		side,
    		position,
    		fullHeight,
    		frame,
    		$$scope,
    		slots,
    		div1_binding
    	];
    }

    class MDBModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				class: 18,
    				isOpen: 2,
    				autoFocus: 19,
    				centered: 20,
    				duration: 3,
    				backdropDuration: 4,
    				scrollable: 21,
    				size: 22,
    				toggle: 23,
    				labelledBy: 5,
    				backdrop: 6,
    				onEnter: 24,
    				onExit: 25,
    				onOpened: 26,
    				onClosed: 27,
    				wrapClassName: 28,
    				modalClassName: 29,
    				backdropClassName: 7,
    				contentClassName: 8,
    				fade: 9,
    				zIndex: 30,
    				unmountOnClose: 31,
    				returnFocusAfterClose: 32,
    				displacementX: 0,
    				displacementY: 1,
    				side: 33,
    				position: 34,
    				fullHeight: 35,
    				frame: 36
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MDBModal",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*isOpen*/ ctx[2] === undefined && !("isOpen" in props)) {
    			console.warn("<MDBModal> was created without expected prop 'isOpen'");
    		}

    		if (/*side*/ ctx[33] === undefined && !("side" in props)) {
    			console.warn("<MDBModal> was created without expected prop 'side'");
    		}

    		if (/*fullHeight*/ ctx[35] === undefined && !("fullHeight" in props)) {
    			console.warn("<MDBModal> was created without expected prop 'fullHeight'");
    		}

    		if (/*frame*/ ctx[36] === undefined && !("frame" in props)) {
    			console.warn("<MDBModal> was created without expected prop 'frame'");
    		}
    	}

    	get class() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoFocus() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoFocus(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdropDuration() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdropDuration(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollable() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scrollable(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelledBy() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelledBy(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdrop() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdrop(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEnter() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEnter(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onExit() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onExit(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onOpened() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onOpened(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClosed() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClosed(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wrapClassName() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wrapClassName(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get modalClassName() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set modalClassName(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdropClassName() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdropClassName(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get contentClassName() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set contentClassName(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fade() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fade(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zIndex() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zIndex(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unmountOnClose() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unmountOnClose(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get returnFocusAfterClose() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set returnFocusAfterClose(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displacementX() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displacementX(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get displacementY() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set displacementY(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get side() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set side(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fullHeight() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullHeight(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get frame() {
    		throw new Error("<MDBModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set frame(value) {
    		throw new Error("<MDBModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/mdbsvelte/src/MDBModalBody.svelte generated by Svelte v3.38.2 */
    const file$c = "node_modules/mdbsvelte/src/MDBModalBody.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let div_levels = [/*props*/ ctx[2], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$c, 13, 0, 335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[1].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				/*props*/ ctx[2],
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MDBModalBody", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(current_component);
    	let { class: className = "" } = $$props;
    	const props = clean($$props);

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clean,
    		clsx,
    		forwardEventsBuilder,
    		current_component,
    		forwardEvents,
    		className,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("classes" in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 8) {
    			$$invalidate(0, classes = clsx(className, "modal-body"));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [classes, forwardEvents, props, className, $$scope, slots];
    }

    class MDBModalBody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { class: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MDBModalBody",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<MDBModalBody>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<MDBModalBody>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/mdbsvelte/src/MDBModalHeader.svelte generated by Svelte v3.38.2 */
    const file$b = "node_modules/mdbsvelte/src/MDBModalHeader.svelte";
    const get_close_slot_changes = dirty => ({});
    const get_close_slot_context = ctx => ({});

    // (26:4) {:else}
    function create_else_block$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(26:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#if children}
    function create_if_block_1$5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*children*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 4) set_data_dev(t, /*children*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(24:4) {#if children}",
    		ctx
    	});

    	return block;
    }

    // (31:4) {#if typeof toggle === 'function'}
    function create_if_block$6(ctx) {
    	let button;
    	let span;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			t = text(/*closeIcon*/ ctx[3]);
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$b, 36, 8, 915);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "close");
    			attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			add_location(button, file$b, 31, 6, 792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*toggle*/ ctx[0])) /*toggle*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*closeIcon*/ 8) set_data_dev(t, /*closeIcon*/ ctx[3]);

    			if (dirty & /*closeAriaLabel*/ 2) {
    				attr_dev(button, "aria-label", /*closeAriaLabel*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(31:4) {#if typeof toggle === 'function'}",
    		ctx
    	});

    	return block;
    }

    // (30:21)      
    function fallback_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = typeof /*toggle*/ ctx[0] === "function" && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (typeof /*toggle*/ ctx[0] === "function") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block$1.name,
    		type: "fallback",
    		source: "(30:21)      ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let h5;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$5, create_else_block$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*children*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const close_slot_template = /*#slots*/ ctx[10].close;
    	const close_slot = create_slot(close_slot_template, ctx, /*$$scope*/ ctx[9], get_close_slot_context);
    	const close_slot_or_fallback = close_slot || fallback_block$1(ctx);
    	let div_levels = [/*props*/ ctx[6], { class: /*classes*/ ctx[4] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h5 = element("h5");
    			if_block.c();
    			t = space();
    			if (close_slot_or_fallback) close_slot_or_fallback.c();
    			attr_dev(h5, "class", "modal-title");
    			add_location(h5, file$b, 22, 2, 620);
    			set_attributes(div, div_data);
    			add_location(div, file$b, 21, 0, 567);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h5);
    			if_blocks[current_block_type_index].m(h5, null);
    			append_dev(div, t);

    			if (close_slot_or_fallback) {
    				close_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[5].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(h5, null);
    			}

    			if (close_slot) {
    				if (close_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot(close_slot, close_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_close_slot_changes, get_close_slot_context);
    				}
    			} else {
    				if (close_slot_or_fallback && close_slot_or_fallback.p && dirty & /*closeAriaLabel, toggle, closeIcon*/ 11) {
    					close_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				/*props*/ ctx[6],
    				(!current || dirty & /*classes*/ 16) && { class: /*classes*/ ctx[4] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(close_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(close_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (close_slot_or_fallback) close_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let closeIcon;
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MDBModalHeader", slots, ['default','close']);
    	const forwardEvents = forwardEventsBuilder(current_component);
    	let { class: className = "" } = $$props;
    	let { toggle = undefined } = $$props;
    	let { closeAriaLabel = "Close" } = $$props;
    	let { charCode = 215 } = $$props;
    	let { children = undefined } = $$props;
    	const props = clean($$props);

    	$$self.$$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(7, className = $$new_props.class);
    		if ("toggle" in $$new_props) $$invalidate(0, toggle = $$new_props.toggle);
    		if ("closeAriaLabel" in $$new_props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ("charCode" in $$new_props) $$invalidate(8, charCode = $$new_props.charCode);
    		if ("children" in $$new_props) $$invalidate(2, children = $$new_props.children);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clean,
    		clsx,
    		forwardEventsBuilder,
    		current_component,
    		forwardEvents,
    		className,
    		toggle,
    		closeAriaLabel,
    		charCode,
    		children,
    		props,
    		closeIcon,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(7, className = $$new_props.className);
    		if ("toggle" in $$props) $$invalidate(0, toggle = $$new_props.toggle);
    		if ("closeAriaLabel" in $$props) $$invalidate(1, closeAriaLabel = $$new_props.closeAriaLabel);
    		if ("charCode" in $$props) $$invalidate(8, charCode = $$new_props.charCode);
    		if ("children" in $$props) $$invalidate(2, children = $$new_props.children);
    		if ("closeIcon" in $$props) $$invalidate(3, closeIcon = $$new_props.closeIcon);
    		if ("classes" in $$props) $$invalidate(4, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*charCode*/ 256) {
    			$$invalidate(3, closeIcon = typeof charCode === "number"
    			? String.fromCharCode(charCode)
    			: charCode);
    		}

    		if ($$self.$$.dirty & /*className*/ 128) {
    			$$invalidate(4, classes = clsx(className, "modal-header"));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		toggle,
    		closeAriaLabel,
    		children,
    		closeIcon,
    		classes,
    		forwardEvents,
    		props,
    		className,
    		charCode,
    		$$scope,
    		slots
    	];
    }

    class MDBModalHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			class: 7,
    			toggle: 0,
    			closeAriaLabel: 1,
    			charCode: 8,
    			children: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MDBModalHeader",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get class() {
    		throw new Error("<MDBModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<MDBModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle() {
    		throw new Error("<MDBModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle(value) {
    		throw new Error("<MDBModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeAriaLabel() {
    		throw new Error("<MDBModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeAriaLabel(value) {
    		throw new Error("<MDBModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charCode() {
    		throw new Error("<MDBModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charCode(value) {
    		throw new Error("<MDBModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<MDBModalHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<MDBModalHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/mdbsvelte/src/MDBModalFooter.svelte generated by Svelte v3.38.2 */
    const file$a = "node_modules/mdbsvelte/src/MDBModalFooter.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let div_levels = [/*props*/ ctx[2], { class: /*classes*/ ctx[0] }];
    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			set_attributes(div, div_data);
    			add_location(div, file$a, 13, 0, 335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[1].call(null, div));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				/*props*/ ctx[2],
    				(!current || dirty & /*classes*/ 1) && { class: /*classes*/ ctx[0] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MDBModalFooter", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder(current_component);
    	let { class: className = "" } = $$props;
    	const props = clean($$props);

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(3, className = $$new_props.class);
    		if ("$$scope" in $$new_props) $$invalidate(4, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clean,
    		clsx,
    		forwardEventsBuilder,
    		current_component,
    		forwardEvents,
    		className,
    		props,
    		classes
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(3, className = $$new_props.className);
    		if ("classes" in $$props) $$invalidate(0, classes = $$new_props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*className*/ 8) {
    			$$invalidate(0, classes = clsx(className, "modal-footer"));
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [classes, forwardEvents, props, className, $$scope, slots];
    }

    class MDBModalFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { class: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MDBModalFooter",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<MDBModalFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<MDBModalFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ConfirmModal.svelte generated by Svelte v3.38.2 */

    // (42:2) <MDBModalHeader toggle={toggle}>
    function create_default_slot_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("確認");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(42:2) <MDBModalHeader toggle={toggle}>",
    		ctx
    	});

    	return block;
    }

    // (43:2) <MDBModalBody>
    function create_default_slot_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*message*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 1) set_data_dev(t, /*message*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(43:2) <MDBModalBody>",
    		ctx
    	});

    	return block;
    }

    // (47:4) <MDBBtn color={colorOkayButton} on:click={_onOkay}>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*labelOkayButton*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*labelOkayButton*/ 4) set_data_dev(t, /*labelOkayButton*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(47:4) <MDBBtn color={colorOkayButton} on:click={_onOkay}>",
    		ctx
    	});

    	return block;
    }

    // (48:4) <MDBBtn color="primary" outline on:click={_onCancel}>
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Cancel");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(48:4) <MDBBtn color=\\\"primary\\\" outline on:click={_onCancel}>",
    		ctx
    	});

    	return block;
    }

    // (46:2) <MDBModalFooter>
    function create_default_slot_1$1(ctx) {
    	let mdbbtn0;
    	let t;
    	let mdbbtn1;
    	let current;

    	mdbbtn0 = new MDBBtn({
    			props: {
    				color: /*colorOkayButton*/ ctx[1],
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mdbbtn0.$on("click", /*_onOkay*/ ctx[6]);

    	mdbbtn1 = new MDBBtn({
    			props: {
    				color: "primary",
    				outline: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mdbbtn1.$on("click", /*_onCancel*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(mdbbtn0.$$.fragment);
    			t = space();
    			create_component(mdbbtn1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdbbtn0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(mdbbtn1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mdbbtn0_changes = {};
    			if (dirty & /*colorOkayButton*/ 2) mdbbtn0_changes.color = /*colorOkayButton*/ ctx[1];

    			if (dirty & /*$$scope, labelOkayButton*/ 1028) {
    				mdbbtn0_changes.$$scope = { dirty, ctx };
    			}

    			mdbbtn0.$set(mdbbtn0_changes);
    			const mdbbtn1_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				mdbbtn1_changes.$$scope = { dirty, ctx };
    			}

    			mdbbtn1.$set(mdbbtn1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdbbtn0.$$.fragment, local);
    			transition_in(mdbbtn1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdbbtn0.$$.fragment, local);
    			transition_out(mdbbtn1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdbbtn0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(mdbbtn1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(46:2) <MDBModalFooter>",
    		ctx
    	});

    	return block;
    }

    // (41:0) <MDBModal isOpen={isOpen} toggle={toggle}>
    function create_default_slot$1(ctx) {
    	let mdbmodalheader;
    	let t0;
    	let mdbmodalbody;
    	let t1;
    	let mdbmodalfooter;
    	let current;

    	mdbmodalheader = new MDBModalHeader({
    			props: {
    				toggle: /*toggle*/ ctx[4],
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mdbmodalbody = new MDBModalBody({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mdbmodalfooter = new MDBModalFooter({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mdbmodalheader.$$.fragment);
    			t0 = space();
    			create_component(mdbmodalbody.$$.fragment);
    			t1 = space();
    			create_component(mdbmodalfooter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdbmodalheader, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(mdbmodalbody, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(mdbmodalfooter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mdbmodalheader_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				mdbmodalheader_changes.$$scope = { dirty, ctx };
    			}

    			mdbmodalheader.$set(mdbmodalheader_changes);
    			const mdbmodalbody_changes = {};

    			if (dirty & /*$$scope, message*/ 1025) {
    				mdbmodalbody_changes.$$scope = { dirty, ctx };
    			}

    			mdbmodalbody.$set(mdbmodalbody_changes);
    			const mdbmodalfooter_changes = {};

    			if (dirty & /*$$scope, colorOkayButton, labelOkayButton*/ 1030) {
    				mdbmodalfooter_changes.$$scope = { dirty, ctx };
    			}

    			mdbmodalfooter.$set(mdbmodalfooter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdbmodalheader.$$.fragment, local);
    			transition_in(mdbmodalbody.$$.fragment, local);
    			transition_in(mdbmodalfooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdbmodalheader.$$.fragment, local);
    			transition_out(mdbmodalbody.$$.fragment, local);
    			transition_out(mdbmodalfooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdbmodalheader, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(mdbmodalbody, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(mdbmodalfooter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(41:0) <MDBModal isOpen={isOpen} toggle={toggle}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let mdbmodal;
    	let current;

    	mdbmodal = new MDBModal({
    			props: {
    				isOpen: /*isOpen*/ ctx[3],
    				toggle: /*toggle*/ ctx[4],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mdbmodal.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdbmodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const mdbmodal_changes = {};
    			if (dirty & /*isOpen*/ 8) mdbmodal_changes.isOpen = /*isOpen*/ ctx[3];

    			if (dirty & /*$$scope, colorOkayButton, labelOkayButton, message*/ 1031) {
    				mdbmodal_changes.$$scope = { dirty, ctx };
    			}

    			mdbmodal.$set(mdbmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdbmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdbmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdbmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ConfirmModal", slots, []);
    	let message;
    	let onOkay;
    	let onCancel;
    	let colorOkayButton = "primary";
    	let labelOkayButton = "OK";
    	let isOpen = false;

    	const confirm = params => {
    		return new Promise((resolve, reject) => {
    				$$invalidate(0, message = params.message || "");
    				$$invalidate(1, colorOkayButton = params.colorOkayButton || "primary");
    				$$invalidate(2, labelOkayButton = params.labelOkayButton || "OK");

    				onOkay = label => {
    					(params.onOkay || (label => {
    						
    					}))(label);

    					resolve(true);
    				};

    				onCancel = () => {
    					(params.onCancel || (() => {
    						
    					}))();

    					reject("cancel");
    				};

    				$$invalidate(3, isOpen = true);
    			});
    	};

    	function toggle() {
    		$$invalidate(3, isOpen = !isOpen);
    	}

    	function _onCancel() {
    		$$invalidate(3, isOpen = false);
    		onCancel();
    	}

    	function _onOkay(param) {
    		$$invalidate(3, isOpen = false);
    		onOkay(param);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ConfirmModal> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MDBBtn,
    		MDBModal,
    		MDBModalBody,
    		MDBModalHeader,
    		MDBModalFooter,
    		message,
    		onOkay,
    		onCancel,
    		colorOkayButton,
    		labelOkayButton,
    		isOpen,
    		confirm,
    		toggle,
    		_onCancel,
    		_onOkay
    	});

    	$$self.$inject_state = $$props => {
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
    		if ("onOkay" in $$props) onOkay = $$props.onOkay;
    		if ("onCancel" in $$props) onCancel = $$props.onCancel;
    		if ("colorOkayButton" in $$props) $$invalidate(1, colorOkayButton = $$props.colorOkayButton);
    		if ("labelOkayButton" in $$props) $$invalidate(2, labelOkayButton = $$props.labelOkayButton);
    		if ("isOpen" in $$props) $$invalidate(3, isOpen = $$props.isOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		message,
    		colorOkayButton,
    		labelOkayButton,
    		isOpen,
    		toggle,
    		_onCancel,
    		_onOkay,
    		confirm
    	];
    }

    class ConfirmModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { confirm: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConfirmModal",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get confirm() {
    		return this.$$.ctx[7];
    	}

    	set confirm(value) {
    		throw new Error("<ConfirmModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const charmManager = writable(null);

    /* src/CharmIxporter.svelte generated by Svelte v3.38.2 */

    const { console: console_1$2 } = globals;
    const file$9 = "src/CharmIxporter.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (80:6) <MDBBtn color="primary"               class="shadow-0 mx-1 px-0"               style="width: 8rem;"               disabled={p.isDisabled()}               on:click={p.onClick}>
    function create_default_slot_1(ctx) {
    	let t0_value = /*p*/ ctx[14].label + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$charmManager, textareaValue*/ 5 && t0_value !== (t0_value = /*p*/ ctx[14].label + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(80:6) <MDBBtn color=\\\"primary\\\"               class=\\\"shadow-0 mx-1 px-0\\\"               style=\\\"width: 8rem;\\\"               disabled={p.isDisabled()}               on:click={p.onClick}>",
    		ctx
    	});

    	return block;
    }

    // (76:6) {#each [         {label: 'エクスポート',     isDisabled: () => $charmManager == null, onClick: exportCharms},         {label: '追加インポート',   isDisabled: () => $charmManager == null || textareaValue.trim().length === 0, onClick: () => importCharms({mode: IMPORT_MODE.APPEND})},         {label: '上書きインポート', isDisabled: () => $charmManager == null || textareaValue.trim().length === 0, onClick: () => importCharms({mode: IMPORT_MODE.OVERWRITE})} ] as p}
    function create_each_block$6(ctx) {
    	let mdbbtn;
    	let current;

    	mdbbtn = new MDBBtn({
    			props: {
    				color: "primary",
    				class: "shadow-0 mx-1 px-0",
    				style: "width: 8rem;",
    				disabled: /*p*/ ctx[14].isDisabled(),
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mdbbtn.$on("click", function () {
    		if (is_function(/*p*/ ctx[14].onClick)) /*p*/ ctx[14].onClick.apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			create_component(mdbbtn.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mdbbtn, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const mdbbtn_changes = {};
    			if (dirty & /*$charmManager, textareaValue*/ 5) mdbbtn_changes.disabled = /*p*/ ctx[14].isDisabled();

    			if (dirty & /*$$scope, $charmManager, textareaValue*/ 131077) {
    				mdbbtn_changes.$$scope = { dirty, ctx };
    			}

    			mdbbtn.$set(mdbbtn_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdbbtn.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdbbtn.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mdbbtn, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(76:6) {#each [         {label: 'エクスポート',     isDisabled: () => $charmManager == null, onClick: exportCharms},         {label: '追加インポート',   isDisabled: () => $charmManager == null || textareaValue.trim().length === 0, onClick: () => importCharms({mode: IMPORT_MODE.APPEND})},         {label: '上書きインポート', isDisabled: () => $charmManager == null || textareaValue.trim().length === 0, onClick: () => importCharms({mode: IMPORT_MODE.OVERWRITE})} ] as p}",
    		ctx
    	});

    	return block;
    }

    // (75:4) <MDBBtnGroup class="shadow-0">
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let current;

    	let each_value = [
    		{
    			label: "エクスポート",
    			isDisabled: /*func*/ ctx[7],
    			onClick: /*exportCharms*/ ctx[5]
    		},
    		{
    			label: "追加インポート",
    			isDisabled: /*func_1*/ ctx[8],
    			onClick: /*func_2*/ ctx[9]
    		},
    		{
    			label: "上書きインポート",
    			isDisabled: /*func_3*/ ctx[10],
    			onClick: /*func_4*/ ctx[11]
    		}
    	];

    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < 3; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 3; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$charmManager, exportCharms, textareaValue, importCharms, IMPORT_MODE*/ 61) {
    				each_value = [
    					{
    						label: "エクスポート",
    						isDisabled: /*func*/ ctx[7],
    						onClick: /*exportCharms*/ ctx[5]
    					},
    					{
    						label: "追加インポート",
    						isDisabled: /*func_1*/ ctx[8],
    						onClick: /*func_2*/ ctx[9]
    					},
    					{
    						label: "上書きインポート",
    						isDisabled: /*func_3*/ ctx[10],
    						onClick: /*func_4*/ ctx[11]
    					}
    				];

    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < 3; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = 3; i < 3; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 3; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < 3; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(75:4) <MDBBtnGroup class=\\\"shadow-0\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div1;
    	let div0;
    	let textarea;
    	let t0;
    	let mdbbtngroup;
    	let t1;
    	let confirmmodal;
    	let updating_confirm;
    	let current;
    	let mounted;
    	let dispose;

    	mdbbtngroup = new MDBBtnGroup({
    			props: {
    				class: "shadow-0",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function confirmmodal_confirm_binding(value) {
    		/*confirmmodal_confirm_binding*/ ctx[12](value);
    	}

    	let confirmmodal_props = {};

    	if (/*confirm*/ ctx[1] !== void 0) {
    		confirmmodal_props.confirm = /*confirm*/ ctx[1];
    	}

    	confirmmodal = new ConfirmModal({
    			props: confirmmodal_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(confirmmodal, "confirm", confirmmodal_confirm_binding));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			textarea = element("textarea");
    			t0 = space();
    			create_component(mdbbtngroup.$$.fragment);
    			t1 = space();
    			create_component(confirmmodal.$$.fragment);
    			attr_dev(textarea, "id", "input");
    			attr_dev(textarea, "class", "svelte-1m5otor");
    			add_location(textarea, file$9, 72, 4, 2834);
    			attr_dev(div0, "id", "charm-ixporter");
    			attr_dev(div0, "class", "svelte-1m5otor");
    			add_location(div0, file$9, 71, 2, 2804);
    			attr_dev(div1, "class", "tab-content svelte-1m5otor");
    			add_location(div1, file$9, 70, 0, 2776);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, textarea);
    			set_input_value(textarea, /*textareaValue*/ ctx[0]);
    			append_dev(div0, t0);
    			mount_component(mdbbtngroup, div0, null);
    			append_dev(div0, t1);
    			mount_component(confirmmodal, div0, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*textareaValue*/ 1) {
    				set_input_value(textarea, /*textareaValue*/ ctx[0]);
    			}

    			const mdbbtngroup_changes = {};

    			if (dirty & /*$$scope, $charmManager, textareaValue*/ 131077) {
    				mdbbtngroup_changes.$$scope = { dirty, ctx };
    			}

    			mdbbtngroup.$set(mdbbtngroup_changes);
    			const confirmmodal_changes = {};

    			if (!updating_confirm && dirty & /*confirm*/ 2) {
    				updating_confirm = true;
    				confirmmodal_changes.confirm = /*confirm*/ ctx[1];
    				add_flush_callback(() => updating_confirm = false);
    			}

    			confirmmodal.$set(confirmmodal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mdbbtngroup.$$.fragment, local);
    			transition_in(confirmmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mdbbtngroup.$$.fragment, local);
    			transition_out(confirmmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(mdbbtngroup);
    			destroy_component(confirmmodal);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $charmManager;
    	validate_store(charmManager, "charmManager");
    	component_subscribe($$self, charmManager, $$value => $$invalidate(2, $charmManager = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharmIxporter", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	

    	// TYPES
    	const IMPORT_MODE = { APPEND: "append", OVERWRITE: "overwrite" };

    	// VARIABLES
    	let textareaValue = "";

    	let confirm;

    	// FUNCTIONS
    	function importCharms({ mode }) {
    		return __awaiter(this, void 0, void 0, function* () {
    			if (textareaValue.trim().length <= 0) {
    				console.log("blank!!");
    				return;
    			}

    			if (mode !== IMPORT_MODE.APPEND && mode !== IMPORT_MODE.OVERWRITE) {
    				console.log("internal error");
    				return;
    			}

    			const result = yield confirm({
    				message: mode === IMPORT_MODE.OVERWRITE
    				? "護石を上書きインポートします。\n既存の護石は削除され、元に戻すことはできません。よろしいですか？"
    				: "護石を追加インポートします。",
    				colorOkayButton: "danger",
    				// labelOkayButton: 'Import',
    				onOkay: () => {
    					
    				},
    				onCancel: () => {
    					
    				}
    			});

    			console.log(result);

    			if (mode === IMPORT_MODE.OVERWRITE) {
    				yield $charmManager.reset();
    			}

    			console.log($charmManager.charms);

    			const charms = textareaValue.trim().split("\n").map(line => {
    				const [s1, sl1, s2, sl2, slot1, slot2, slot3, ...rest] = line.split(/,\s*/);

    				return {
    					skills: [s1, s2],
    					skillLevels: [sl1, sl2],
    					slots: [slot1, slot2, slot3]
    				};
    			});

    			console.log(charms);
    			$charmManager.registerCharms(charms);
    		});
    	}

    	function exportCharms() {
    		return __awaiter(this, void 0, void 0, function* () {
    			// console.log($charmManager.charmTableName)
    			$$invalidate(0, textareaValue = $charmManager.charms.map(row => {
    				const { skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3 } = row;
    				return [skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3].join(",");
    			}).join("\n"));
    		}); // $charmManager.exportIdx()
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<CharmIxporter> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		textareaValue = this.value;
    		$$invalidate(0, textareaValue);
    	}

    	const func = () => $charmManager == null;
    	const func_1 = () => $charmManager == null || textareaValue.trim().length === 0;
    	const func_2 = () => importCharms({ mode: IMPORT_MODE.APPEND });
    	const func_3 = () => $charmManager == null || textareaValue.trim().length === 0;
    	const func_4 = () => importCharms({ mode: IMPORT_MODE.OVERWRITE });

    	function confirmmodal_confirm_binding(value) {
    		confirm = value;
    		$$invalidate(1, confirm);
    	}

    	$$self.$capture_state = () => ({
    		__awaiter,
    		MDBBtn,
    		MDBBtnGroup,
    		ConfirmModal,
    		charmManager,
    		IMPORT_MODE,
    		textareaValue,
    		confirm,
    		importCharms,
    		exportCharms,
    		$charmManager
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("textareaValue" in $$props) $$invalidate(0, textareaValue = $$props.textareaValue);
    		if ("confirm" in $$props) $$invalidate(1, confirm = $$props.confirm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		textareaValue,
    		confirm,
    		$charmManager,
    		IMPORT_MODE,
    		importCharms,
    		exportCharms,
    		textarea_input_handler,
    		func,
    		func_1,
    		func_2,
    		func_3,
    		func_4,
    		confirmmodal_confirm_binding
    	];
    }

    class CharmIxporter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmIxporter",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* node_modules/simple-svelte-autocomplete/src/SimpleAutocomplete.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$2, console: console_1$1 } = globals;
    const file$8 = "node_modules/simple-svelte-autocomplete/src/SimpleAutocomplete.svelte";

    const get_no_results_slot_changes = dirty => ({
    	noResultsText: dirty[0] & /*noResultsText*/ 2
    });

    const get_no_results_slot_context = ctx => ({ noResultsText: /*noResultsText*/ ctx[1] });

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[79] = list[i];
    	child_ctx[81] = i;
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({
    	item: dirty[0] & /*filteredListItems*/ 131072,
    	label: dirty[0] & /*filteredListItems*/ 131072
    });

    const get_item_slot_context = ctx => ({
    	item: /*listItem*/ ctx[79].item,
    	label: /*listItem*/ ctx[79].highlighted
    	? /*listItem*/ ctx[79].highlighted.label
    	: /*listItem*/ ctx[79].label
    });

    // (775:2) {#if showClear}
    function create_if_block_6$1(ctx) {
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "✖";
    			attr_dev(span, "class", "autocomplete-clear-button svelte-77usy");
    			add_location(span, file$8, 775, 4, 17914);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*clear*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6$1.name,
    		type: "if",
    		source: "(775:2) {#if showClear}",
    		ctx
    	});

    	return block;
    }

    // (812:28) 
    function create_if_block_5$1(ctx) {
    	let div;
    	let current;
    	const no_results_slot_template = /*#slots*/ ctx[50]["no-results"];
    	const no_results_slot = create_slot(no_results_slot_template, ctx, /*$$scope*/ ctx[49], get_no_results_slot_context);
    	const no_results_slot_or_fallback = no_results_slot || fallback_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (no_results_slot_or_fallback) no_results_slot_or_fallback.c();
    			attr_dev(div, "class", "autocomplete-list-item-no-results svelte-77usy");
    			add_location(div, file$8, 812, 6, 19343);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (no_results_slot_or_fallback) {
    				no_results_slot_or_fallback.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (no_results_slot) {
    				if (no_results_slot.p && (!current || dirty[0] & /*noResultsText*/ 2 | dirty[1] & /*$$scope*/ 262144)) {
    					update_slot(no_results_slot, no_results_slot_template, ctx, /*$$scope*/ ctx[49], dirty, get_no_results_slot_changes, get_no_results_slot_context);
    				}
    			} else {
    				if (no_results_slot_or_fallback && no_results_slot_or_fallback.p && dirty[0] & /*noResultsText*/ 2) {
    					no_results_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(no_results_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(no_results_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (no_results_slot_or_fallback) no_results_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(812:28) ",
    		ctx
    	});

    	return block;
    }

    // (782:4) {#if filteredListItems && filteredListItems.length > 0}
    function create_if_block$5(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*filteredListItems*/ ctx[17];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let if_block = /*maxItemsToShowInList*/ ctx[0] > 0 && /*filteredListItems*/ ctx[17].length > /*maxItemsToShowInList*/ ctx[0] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*highlightIndex, onListItemClick, filteredListItems, maxItemsToShowInList*/ 1212417 | dirty[1] & /*$$scope*/ 262144) {
    				each_value = /*filteredListItems*/ ctx[17];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (/*maxItemsToShowInList*/ ctx[0] > 0 && /*filteredListItems*/ ctx[17].length > /*maxItemsToShowInList*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(782:4) {#if filteredListItems && filteredListItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (814:48) {noResultsText}
    function fallback_block_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*noResultsText*/ ctx[1]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*noResultsText*/ 2) set_data_dev(t, /*noResultsText*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1$1.name,
    		type: "fallback",
    		source: "(814:48) {noResultsText}",
    		ctx
    	});

    	return block;
    }

    // (784:8) {#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}
    function create_if_block_2$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*listItem*/ ctx[79] && create_if_block_3$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*listItem*/ ctx[79]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*filteredListItems*/ 131072) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(784:8) {#if listItem && (maxItemsToShowInList <= 0 || i < maxItemsToShowInList)}",
    		ctx
    	});

    	return block;
    }

    // (785:10) {#if listItem}
    function create_if_block_3$2(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const item_slot_template = /*#slots*/ ctx[50].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[49], get_item_slot_context);
    	const item_slot_or_fallback = item_slot || fallback_block(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[53](/*listItem*/ ctx[79]);
    	}

    	function pointerenter_handler() {
    		return /*pointerenter_handler*/ ctx[54](/*i*/ ctx[81]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (item_slot_or_fallback) item_slot_or_fallback.c();

    			attr_dev(div, "class", div_class_value = "autocomplete-list-item " + (/*i*/ ctx[81] === /*highlightIndex*/ ctx[15]
    			? "selected"
    			: "") + " svelte-77usy");

    			add_location(div, file$8, 785, 12, 18369);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (item_slot_or_fallback) {
    				item_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "click", click_handler, false, false, false),
    					listen_dev(div, "pointerenter", pointerenter_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (item_slot) {
    				if (item_slot.p && (!current || dirty[0] & /*filteredListItems*/ 131072 | dirty[1] & /*$$scope*/ 262144)) {
    					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[49], dirty, get_item_slot_changes, get_item_slot_context);
    				}
    			} else {
    				if (item_slot_or_fallback && item_slot_or_fallback.p && dirty[0] & /*filteredListItems*/ 131072) {
    					item_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty[0] & /*highlightIndex*/ 32768 && div_class_value !== (div_class_value = "autocomplete-list-item " + (/*i*/ ctx[81] === /*highlightIndex*/ ctx[15]
    			? "selected"
    			: "") + " svelte-77usy")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(785:10) {#if listItem}",
    		ctx
    	});

    	return block;
    }

    // (798:16) {:else}
    function create_else_block$5(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[79].label + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems*/ 131072 && raw_value !== (raw_value = /*listItem*/ ctx[79].label + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(798:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (796:16) {#if listItem.highlighted}
    function create_if_block_4$2(ctx) {
    	let html_tag;
    	let raw_value = /*listItem*/ ctx[79].highlighted.label + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems*/ 131072 && raw_value !== (raw_value = /*listItem*/ ctx[79].highlighted.label + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$2.name,
    		type: "if",
    		source: "(796:16) {#if listItem.highlighted}",
    		ctx
    	});

    	return block;
    }

    // (795:91)                  
    function fallback_block(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*listItem*/ ctx[79].highlighted) return create_if_block_4$2;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(795:91)                  ",
    		ctx
    	});

    	return block;
    }

    // (783:6) {#each filteredListItems as listItem, i}
    function create_each_block$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*listItem*/ ctx[79] && (/*maxItemsToShowInList*/ ctx[0] <= 0 || /*i*/ ctx[81] < /*maxItemsToShowInList*/ ctx[0]) && create_if_block_2$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*listItem*/ ctx[79] && (/*maxItemsToShowInList*/ ctx[0] <= 0 || /*i*/ ctx[81] < /*maxItemsToShowInList*/ ctx[0])) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*filteredListItems, maxItemsToShowInList*/ 131073) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(783:6) {#each filteredListItems as listItem, i}",
    		ctx
    	});

    	return block;
    }

    // (807:6) {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}
    function create_if_block_1$4(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*filteredListItems*/ ctx[17].length - /*maxItemsToShowInList*/ ctx[0] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("...");
    			t1 = text(t1_value);
    			t2 = text(" results not shown");
    			attr_dev(div, "class", "autocomplete-list-item-no-results svelte-77usy");
    			add_location(div, file$8, 807, 8, 19152);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filteredListItems, maxItemsToShowInList*/ 131073 && t1_value !== (t1_value = /*filteredListItems*/ ctx[17].length - /*maxItemsToShowInList*/ ctx[0] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(807:6) {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let input_1;
    	let input_1_class_value;
    	let input_1_id_value;
    	let input_1_autocomplete_value;
    	let t0;
    	let t1;
    	let div0;
    	let current_block_type_index;
    	let if_block1;
    	let div0_class_value;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*showClear*/ ctx[11] && create_if_block_6$1(ctx);
    	const if_block_creators = [create_if_block$5, create_if_block_5$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*filteredListItems*/ ctx[17] && /*filteredListItems*/ ctx[17].length > 0) return 0;
    		if (/*noResultsText*/ ctx[1]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input_1 = element("input");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			attr_dev(input_1, "type", "text");

    			attr_dev(input_1, "class", input_1_class_value = "" + ((/*inputClassName*/ ctx[4]
    			? /*inputClassName*/ ctx[4]
    			: "") + " input autocomplete-input" + " svelte-77usy"));

    			attr_dev(input_1, "id", input_1_id_value = /*inputId*/ ctx[5] ? /*inputId*/ ctx[5] : "");
    			attr_dev(input_1, "autocomplete", input_1_autocomplete_value = /*html5autocomplete*/ ctx[8] ? "on" : "off");
    			attr_dev(input_1, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(input_1, "name", /*name*/ ctx[6]);
    			input_1.disabled = /*disabled*/ ctx[12];
    			attr_dev(input_1, "title", /*title*/ ctx[7]);
    			add_location(input_1, file$8, 758, 2, 17476);

    			attr_dev(div0, "class", div0_class_value = "" + ((/*dropdownClassName*/ ctx[9]
    			? /*dropdownClassName*/ ctx[9]
    			: "") + " autocomplete-list " + (/*showList*/ ctx[18] ? "" : "hidden") + "\n    is-fullwidth" + " svelte-77usy"));

    			add_location(div0, file$8, 777, 2, 17997);
    			attr_dev(div1, "class", div1_class_value = "" + ((/*className*/ ctx[3] ? /*className*/ ctx[3] : "") + "\n  " + (/*hideArrow*/ ctx[10] ? "hide-arrow is-multiple" : "") + "\n  " + (/*showClear*/ ctx[11] ? "show-clear" : "") + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[19] + " svelte-77usy"));
    			add_location(div1, file$8, 754, 0, 17305);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input_1);
    			/*input_1_binding*/ ctx[51](input_1);
    			set_input_value(input_1, /*text*/ ctx[16]);
    			append_dev(div1, t0);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div0, null);
    			}

    			/*div0_binding*/ ctx[55](div0);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*onDocumentClick*/ ctx[21], false, false, false),
    					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[52]),
    					listen_dev(input_1, "input", /*onInput*/ ctx[24], false, false, false),
    					listen_dev(input_1, "focus", /*onFocus*/ ctx[26], false, false, false),
    					listen_dev(input_1, "keydown", /*onKeyDown*/ ctx[22], false, false, false),
    					listen_dev(input_1, "click", /*onInputClick*/ ctx[25], false, false, false),
    					listen_dev(input_1, "keypress", /*onKeyPress*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*inputClassName*/ 16 && input_1_class_value !== (input_1_class_value = "" + ((/*inputClassName*/ ctx[4]
    			? /*inputClassName*/ ctx[4]
    			: "") + " input autocomplete-input" + " svelte-77usy"))) {
    				attr_dev(input_1, "class", input_1_class_value);
    			}

    			if (!current || dirty[0] & /*inputId*/ 32 && input_1_id_value !== (input_1_id_value = /*inputId*/ ctx[5] ? /*inputId*/ ctx[5] : "")) {
    				attr_dev(input_1, "id", input_1_id_value);
    			}

    			if (!current || dirty[0] & /*html5autocomplete*/ 256 && input_1_autocomplete_value !== (input_1_autocomplete_value = /*html5autocomplete*/ ctx[8] ? "on" : "off")) {
    				attr_dev(input_1, "autocomplete", input_1_autocomplete_value);
    			}

    			if (!current || dirty[0] & /*placeholder*/ 4) {
    				attr_dev(input_1, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*name*/ 64) {
    				attr_dev(input_1, "name", /*name*/ ctx[6]);
    			}

    			if (!current || dirty[0] & /*disabled*/ 4096) {
    				prop_dev(input_1, "disabled", /*disabled*/ ctx[12]);
    			}

    			if (!current || dirty[0] & /*title*/ 128) {
    				attr_dev(input_1, "title", /*title*/ ctx[7]);
    			}

    			if (dirty[0] & /*text*/ 65536 && input_1.value !== /*text*/ ctx[16]) {
    				set_input_value(input_1, /*text*/ ctx[16]);
    			}

    			if (/*showClear*/ ctx[11]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block1) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block1 = if_blocks[current_block_type_index];

    					if (!if_block1) {
    						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block1.c();
    					} else {
    						if_block1.p(ctx, dirty);
    					}

    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				} else {
    					if_block1 = null;
    				}
    			}

    			if (!current || dirty[0] & /*dropdownClassName, showList*/ 262656 && div0_class_value !== (div0_class_value = "" + ((/*dropdownClassName*/ ctx[9]
    			? /*dropdownClassName*/ ctx[9]
    			: "") + " autocomplete-list " + (/*showList*/ ctx[18] ? "" : "hidden") + "\n    is-fullwidth" + " svelte-77usy"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty[0] & /*className, hideArrow, showClear*/ 3080 && div1_class_value !== (div1_class_value = "" + ((/*className*/ ctx[3] ? /*className*/ ctx[3] : "") + "\n  " + (/*hideArrow*/ ctx[10] ? "hide-arrow is-multiple" : "") + "\n  " + (/*showClear*/ ctx[11] ? "show-clear" : "") + " autocomplete select is-fullwidth " + /*uniqueId*/ ctx[19] + " svelte-77usy"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input_1_binding*/ ctx[51](null);
    			if (if_block0) if_block0.d();

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			/*div0_binding*/ ctx[55](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function safeStringFunction(theFunction, argument) {
    	if (typeof theFunction !== "function") {
    		console.error("Not a function: " + theFunction + ", argument: " + argument);
    	}

    	let originalResult;

    	try {
    		originalResult = theFunction(argument);
    	} catch(error) {
    		console.warn("Error executing Autocomplete function on value: " + argument + " function: " + theFunction);
    	}

    	let result = originalResult;

    	if (result === undefined || result === null) {
    		result = "";
    	}

    	if (typeof result !== "string") {
    		result = result.toString();
    	}

    	return result;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let showList;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SimpleAutocomplete", slots, ['item','no-results']);
    	let { items = [] } = $$props;
    	let { searchFunction = false } = $$props;
    	let { labelFieldName = undefined } = $$props;
    	let { keywordsFieldName = labelFieldName } = $$props;
    	let { valueFieldName = undefined } = $$props;

    	let { labelFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return labelFieldName ? item[labelFieldName] : item;
    	} } = $$props;

    	let { keywordsFunction = function (item) {
    		if (item === undefined || item === null) {
    			return "";
    		}

    		return keywordsFieldName
    		? item[keywordsFieldName]
    		: labelFunction(item);
    	} } = $$props;

    	let { valueFunction = function (item) {
    		if (item === undefined || item === null) {
    			return item;
    		}

    		return valueFieldName ? item[valueFieldName] : item;
    	} } = $$props;

    	let { keywordsCleanFunction = function (keywords) {
    		return keywords;
    	} } = $$props;

    	let { textCleanFunction = function (userEnteredText) {
    		return userEnteredText;
    	} } = $$props;

    	let { beforeChange = function (oldSelectedItem, newSelectedItem) {
    		return true;
    	} } = $$props;

    	let { onChange = function (newSelectedItem) {
    		
    	} } = $$props;

    	let { selectFirstIfEmpty = false } = $$props;
    	let { minCharactersToSearch = 1 } = $$props;
    	let { maxItemsToShowInList = 0 } = $$props;
    	let { delay = 0 } = $$props;
    	let { localFiltering = true } = $$props;
    	let { noResultsText = "No results found" } = $$props;
    	let { placeholder = undefined } = $$props;
    	let { className = undefined } = $$props;
    	let { inputClassName = undefined } = $$props;
    	let { inputId = undefined } = $$props;
    	let { name = undefined } = $$props;
    	let { title = undefined } = $$props;
    	let { html5autocomplete = undefined } = $$props;
    	let { dropdownClassName = undefined } = $$props;
    	let { hideArrow = false } = $$props;
    	let { showClear = false } = $$props;
    	let { disabled = false } = $$props;
    	let { debug = false } = $$props;
    	let { selectedItem = undefined } = $$props;
    	let { value = undefined } = $$props;

    	// --- Internal State ----
    	const uniqueId = "sautocomplete-" + Math.floor(Math.random() * 1000);

    	// HTML elements
    	let input;

    	let list;

    	// UI state
    	let opened = false;

    	let highlightIndex = -1;
    	let text;
    	let filteredTextLength = 0;

    	// view model
    	let filteredListItems;

    	let listItems = [];

    	// other state
    	let inputDelayTimeout;

    	// -- Reactivity --
    	function onSelectedItemChanged() {
    		$$invalidate(30, value = valueFunction(selectedItem));
    		$$invalidate(16, text = safeLabelFunction(selectedItem));
    		onChange(selectedItem);
    	}

    	function safeLabelFunction(item) {
    		// console.log("labelFunction: " + labelFunction);
    		// console.log("safeLabelFunction, item: " + item);
    		return safeStringFunction(labelFunction, item);
    	}

    	function safeKeywordsFunction(item) {
    		// console.log("safeKeywordsFunction");
    		const keywords = safeStringFunction(keywordsFunction, item);

    		let result = safeStringFunction(keywordsCleanFunction, keywords);
    		result = result.toLowerCase().trim();

    		if (debug) {
    			console.log("Extracted keywords: '" + result + "' from item: " + JSON.stringify(item));
    		}

    		return result;
    	}

    	function prepareListItems() {
    		let tStart;

    		if (debug) {
    			tStart = performance.now();
    			console.log("prepare items to search");
    			console.log("items: " + JSON.stringify(items));
    		}

    		if (!Array.isArray(items)) {
    			console.warn("Autocomplete items / search function did not return array but", items);
    			$$invalidate(28, items = []);
    		}

    		const length = items ? items.length : 0;
    		listItems = new Array(length);

    		if (length > 0) {
    			items.forEach((item, i) => {
    				const listItem = getListItem(item);

    				if (listItem == undefined) {
    					console.log("Undefined item for: ", item);
    				}

    				listItems[i] = listItem;
    			});
    		}

    		if (debug) {
    			const tEnd = performance.now();
    			console.log(listItems.length + " items to search prepared in " + (tEnd - tStart) + " milliseconds");
    		}
    	}

    	function getListItem(item) {
    		return {
    			// keywords representation of the item
    			keywords: safeKeywordsFunction(item),
    			// item label
    			label: safeLabelFunction(item),
    			// store reference to the origial item
    			item
    		};
    	}

    	function prepareUserEnteredText(userEnteredText) {
    		if (userEnteredText === undefined || userEnteredText === null) {
    			return "";
    		}

    		const textFiltered = userEnteredText.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ").trim();
    		$$invalidate(48, filteredTextLength = textFiltered.length);

    		if (minCharactersToSearch > 1) {
    			if (filteredTextLength < minCharactersToSearch) {
    				return "";
    			}
    		}

    		const cleanUserEnteredText = textCleanFunction(textFiltered);
    		const textFilteredLowerCase = cleanUserEnteredText.toLowerCase().trim();

    		if (debug) {
    			console.log("Change user entered text '" + userEnteredText + "' into '" + textFilteredLowerCase + "'");
    		}

    		return textFilteredLowerCase;
    	}

    	async function search() {
    		let tStart;

    		if (debug) {
    			tStart = performance.now();
    			console.log("Searching user entered text: '" + text + "'");
    		}

    		const textFiltered = prepareUserEnteredText(text);

    		if (textFiltered === "") {
    			$$invalidate(17, filteredListItems = listItems);
    			closeIfMinCharsToSearchReached();

    			if (debug) {
    				console.log("User entered text is empty set the list of items to all items");
    			}

    			return;
    		}

    		// external search which provides items
    		if (searchFunction) {
    			$$invalidate(28, items = await searchFunction(textFiltered));
    			prepareListItems();
    		}

    		// local search
    		let tempfilteredListItems;

    		if (localFiltering) {
    			const searchWords = textFiltered.split(" ");

    			tempfilteredListItems = listItems.filter(listItem => {
    				if (!listItem) {
    					return false;
    				}

    				const itemKeywords = listItem.keywords;
    				let matches = 0;

    				searchWords.forEach(searchWord => {
    					if (itemKeywords.includes(searchWord)) {
    						matches++;
    					}
    				});

    				return matches >= searchWords.length;
    			});
    		} else {
    			tempfilteredListItems = listItems;
    		}

    		const hlfilter = highlightFilter(textFiltered, ["label"]);
    		const filteredListItemsHighlighted = tempfilteredListItems.map(hlfilter);
    		$$invalidate(17, filteredListItems = filteredListItemsHighlighted);
    		closeIfMinCharsToSearchReached();

    		if (debug) {
    			const tEnd = performance.now();
    			console.log("Search took " + (tEnd - tStart) + " milliseconds, found " + filteredListItems.length + " items");
    		}
    	}

    	// $: text, search();
    	function selectListItem(listItem) {
    		if (debug) {
    			console.log("selectListItem");
    		}

    		if ("undefined" === typeof listItem) {
    			if (debug) {
    				console.log(`listItem ${i} is undefined. Can not select.`);
    			}

    			return false;
    		}

    		const newSelectedItem = listItem.item;

    		if (beforeChange(selectedItem, newSelectedItem)) {
    			$$invalidate(29, selectedItem = newSelectedItem);
    		}

    		return true;
    	}

    	function selectItem() {
    		if (debug) {
    			console.log("selectItem");
    		}

    		const listItem = filteredListItems[highlightIndex];

    		if (selectListItem(listItem)) {
    			close();
    		}
    	}

    	function up() {
    		if (debug) {
    			console.log("up");
    		}

    		open();
    		if (highlightIndex > 0) $$invalidate(15, highlightIndex--, highlightIndex);
    		highlight();
    	}

    	function down() {
    		if (debug) {
    			console.log("down");
    		}

    		open();
    		if (highlightIndex < filteredListItems.length - 1) $$invalidate(15, highlightIndex++, highlightIndex);
    		highlight();
    	}

    	function highlight() {
    		if (debug) {
    			console.log("highlight");
    		}

    		const query = ".selected";

    		if (debug) {
    			console.log("Seaching DOM element: " + query + " in " + list);
    		}

    		const el = list && list.querySelector(query);

    		if (el) {
    			if (typeof el.scrollIntoViewIfNeeded === "function") {
    				if (debug) {
    					console.log("Scrolling selected item into view");
    				}

    				el.scrollIntoViewIfNeeded();
    			} else {
    				if (debug) {
    					console.warn("Could not scroll selected item into view, scrollIntoViewIfNeeded not supported");
    				}
    			}
    		} else {
    			if (debug) {
    				console.warn("Selected item not found to scroll into view");
    			}
    		}
    	}

    	function onListItemClick(listItem) {
    		if (debug) {
    			console.log("onListItemClick");
    		}

    		if (selectListItem(listItem)) {
    			close();
    		}
    	}

    	function onDocumentClick(e) {
    		if (debug) {
    			console.log("onDocumentClick: " + JSON.stringify(e.target));
    		}

    		if (e.target.closest("." + uniqueId)) {
    			if (debug) {
    				console.log("onDocumentClick inside");
    			}

    			// resetListToAllItemsAndOpen();
    			highlight();
    		} else {
    			if (debug) {
    				console.log("onDocumentClick outside");
    			}

    			close();
    		}
    	}

    	function onKeyDown(e) {
    		if (debug) {
    			console.log("onKeyDown");
    		}

    		let key = e.key;
    		if (key === "Tab" && e.shiftKey) key = "ShiftTab";

    		const fnmap = {
    			Tab: opened ? down.bind(this) : null,
    			ShiftTab: opened ? up.bind(this) : null,
    			ArrowDown: down.bind(this),
    			ArrowUp: up.bind(this),
    			Escape: onEsc.bind(this)
    		};

    		const fn = fnmap[key];

    		if (typeof fn === "function") {
    			e.preventDefault();
    			fn(e);
    		}
    	}

    	function onKeyPress(e) {
    		if (debug) {
    			console.log("onKeyPress");
    		}

    		if (e.key === "Enter") {
    			e.preventDefault();
    			selectItem();
    		}
    	}

    	function onInput(e) {
    		if (debug) {
    			console.log("onInput");
    		}

    		$$invalidate(16, text = e.target.value);

    		if (inputDelayTimeout) {
    			clearTimeout(inputDelayTimeout);
    		}

    		if (delay) {
    			inputDelayTimeout = setTimeout(processInput, delay);
    		} else {
    			processInput();
    		}
    	}

    	function processInput() {
    		search();
    		$$invalidate(15, highlightIndex = 0);
    		open();
    	}

    	function onInputClick() {
    		if (debug) {
    			console.log("onInputClick");
    		}

    		resetListToAllItemsAndOpen();
    	}

    	function onEsc(e) {
    		if (debug) {
    			console.log("onEsc");
    		}

    		//if (text) return clear();
    		e.stopPropagation();

    		if (opened) {
    			input.focus();
    			close();
    		}
    	}

    	function onFocus() {
    		if (debug) {
    			console.log("onFocus");
    		}

    		resetListToAllItemsAndOpen();
    	}

    	function resetListToAllItemsAndOpen() {
    		if (debug) {
    			console.log("resetListToAllItemsAndOpen");
    		}

    		$$invalidate(17, filteredListItems = listItems);
    		open();

    		// find selected item
    		if (selectedItem) {
    			if (debug) {
    				console.log("Searching currently selected item: " + JSON.stringify(selectedItem));
    			}

    			for (let i = 0; i < listItems.length; i++) {
    				const listItem = listItems[i];

    				if ("undefined" === typeof listItem) {
    					if (debug) {
    						console.log(`listItem ${i} is undefined. Skipping.`);
    					}

    					continue;
    				}

    				if (debug) {
    					console.log("Item " + i + ": " + JSON.stringify(listItem));
    				}

    				if (selectedItem == listItem.item) {
    					$$invalidate(15, highlightIndex = i);

    					if (debug) {
    						console.log("Found selected item: " + i + ": " + JSON.stringify(listItem));
    					}

    					highlight();
    					break;
    				}
    			}
    		}
    	}

    	function open() {
    		if (debug) {
    			console.log("open");
    		}

    		// check if the search text has more than the min chars required
    		if (isMinCharsToSearchReached()) {
    			return;
    		}

    		$$invalidate(47, opened = true);
    	}

    	function close() {
    		if (debug) {
    			console.log("close");
    		}

    		$$invalidate(47, opened = false);

    		if (!text && selectFirstIfEmpty) {
    			highlightFilter = 0;
    			selectItem();
    		}
    	}

    	function isMinCharsToSearchReached() {
    		return minCharactersToSearch > 1 && filteredTextLength < minCharactersToSearch;
    	}

    	function closeIfMinCharsToSearchReached() {
    		if (isMinCharsToSearchReached()) {
    			close();
    		}
    	}

    	function clear() {
    		if (debug) {
    			console.log("clear");
    		}

    		$$invalidate(16, text = "");
    		$$invalidate(29, selectedItem = undefined);

    		setTimeout(() => {
    			input.focus();
    			close();
    		});
    	}

    	function onBlur() {
    		if (debug) {
    			console.log("onBlur");
    		}

    		close();
    	}

    	// 'item number one'.replace(/(it)(.*)(nu)(.*)(one)/ig, '<b>$1</b>$2 <b>$3</b>$4 <b>$5</b>')
    	function highlightFilter(q, fields) {
    		const qs = "(" + q.trim().replace(/\s/g, ")(.*)(") + ")";
    		const reg = new RegExp(qs, "ig");
    		let n = 1;
    		const len = qs.split(")(").length + 1;
    		let repl = "";
    		for (; n < len; n++) repl += n % 2 ? `<b>$${n}</b>` : `$${n}`;

    		return i => {
    			const newI = Object.assign({ highlighted: {} }, i);

    			if (fields) {
    				fields.forEach(f => {
    					if (!newI[f]) return;
    					newI.highlighted[f] = newI[f].replace(reg, repl);
    				});
    			}

    			return newI;
    		};
    	}

    	const writable_props = [
    		"items",
    		"searchFunction",
    		"labelFieldName",
    		"keywordsFieldName",
    		"valueFieldName",
    		"labelFunction",
    		"keywordsFunction",
    		"valueFunction",
    		"keywordsCleanFunction",
    		"textCleanFunction",
    		"beforeChange",
    		"onChange",
    		"selectFirstIfEmpty",
    		"minCharactersToSearch",
    		"maxItemsToShowInList",
    		"delay",
    		"localFiltering",
    		"noResultsText",
    		"placeholder",
    		"className",
    		"inputClassName",
    		"inputId",
    		"name",
    		"title",
    		"html5autocomplete",
    		"dropdownClassName",
    		"hideArrow",
    		"showClear",
    		"disabled",
    		"debug",
    		"selectedItem",
    		"value"
    	];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<SimpleAutocomplete> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(13, input);
    		});
    	}

    	function input_1_input_handler() {
    		text = this.value;
    		$$invalidate(16, text);
    	}

    	const click_handler = listItem => onListItemClick(listItem);

    	const pointerenter_handler = i => {
    		$$invalidate(15, highlightIndex = i);
    	};

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			list = $$value;
    			$$invalidate(14, list);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("items" in $$props) $$invalidate(28, items = $$props.items);
    		if ("searchFunction" in $$props) $$invalidate(31, searchFunction = $$props.searchFunction);
    		if ("labelFieldName" in $$props) $$invalidate(32, labelFieldName = $$props.labelFieldName);
    		if ("keywordsFieldName" in $$props) $$invalidate(33, keywordsFieldName = $$props.keywordsFieldName);
    		if ("valueFieldName" in $$props) $$invalidate(34, valueFieldName = $$props.valueFieldName);
    		if ("labelFunction" in $$props) $$invalidate(35, labelFunction = $$props.labelFunction);
    		if ("keywordsFunction" in $$props) $$invalidate(36, keywordsFunction = $$props.keywordsFunction);
    		if ("valueFunction" in $$props) $$invalidate(37, valueFunction = $$props.valueFunction);
    		if ("keywordsCleanFunction" in $$props) $$invalidate(38, keywordsCleanFunction = $$props.keywordsCleanFunction);
    		if ("textCleanFunction" in $$props) $$invalidate(39, textCleanFunction = $$props.textCleanFunction);
    		if ("beforeChange" in $$props) $$invalidate(40, beforeChange = $$props.beforeChange);
    		if ("onChange" in $$props) $$invalidate(41, onChange = $$props.onChange);
    		if ("selectFirstIfEmpty" in $$props) $$invalidate(42, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ("minCharactersToSearch" in $$props) $$invalidate(43, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ("maxItemsToShowInList" in $$props) $$invalidate(0, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ("delay" in $$props) $$invalidate(44, delay = $$props.delay);
    		if ("localFiltering" in $$props) $$invalidate(45, localFiltering = $$props.localFiltering);
    		if ("noResultsText" in $$props) $$invalidate(1, noResultsText = $$props.noResultsText);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    		if ("inputClassName" in $$props) $$invalidate(4, inputClassName = $$props.inputClassName);
    		if ("inputId" in $$props) $$invalidate(5, inputId = $$props.inputId);
    		if ("name" in $$props) $$invalidate(6, name = $$props.name);
    		if ("title" in $$props) $$invalidate(7, title = $$props.title);
    		if ("html5autocomplete" in $$props) $$invalidate(8, html5autocomplete = $$props.html5autocomplete);
    		if ("dropdownClassName" in $$props) $$invalidate(9, dropdownClassName = $$props.dropdownClassName);
    		if ("hideArrow" in $$props) $$invalidate(10, hideArrow = $$props.hideArrow);
    		if ("showClear" in $$props) $$invalidate(11, showClear = $$props.showClear);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$props.disabled);
    		if ("debug" in $$props) $$invalidate(46, debug = $$props.debug);
    		if ("selectedItem" in $$props) $$invalidate(29, selectedItem = $$props.selectedItem);
    		if ("value" in $$props) $$invalidate(30, value = $$props.value);
    		if ("$$scope" in $$props) $$invalidate(49, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		items,
    		searchFunction,
    		labelFieldName,
    		keywordsFieldName,
    		valueFieldName,
    		labelFunction,
    		keywordsFunction,
    		valueFunction,
    		keywordsCleanFunction,
    		textCleanFunction,
    		beforeChange,
    		onChange,
    		selectFirstIfEmpty,
    		minCharactersToSearch,
    		maxItemsToShowInList,
    		delay,
    		localFiltering,
    		noResultsText,
    		placeholder,
    		className,
    		inputClassName,
    		inputId,
    		name,
    		title,
    		html5autocomplete,
    		dropdownClassName,
    		hideArrow,
    		showClear,
    		disabled,
    		debug,
    		selectedItem,
    		value,
    		uniqueId,
    		input,
    		list,
    		opened,
    		highlightIndex,
    		text,
    		filteredTextLength,
    		filteredListItems,
    		listItems,
    		inputDelayTimeout,
    		onSelectedItemChanged,
    		safeStringFunction,
    		safeLabelFunction,
    		safeKeywordsFunction,
    		prepareListItems,
    		getListItem,
    		prepareUserEnteredText,
    		search,
    		selectListItem,
    		selectItem,
    		up,
    		down,
    		highlight,
    		onListItemClick,
    		onDocumentClick,
    		onKeyDown,
    		onKeyPress,
    		onInput,
    		processInput,
    		onInputClick,
    		onEsc,
    		onFocus,
    		resetListToAllItemsAndOpen,
    		open,
    		close,
    		isMinCharsToSearchReached,
    		closeIfMinCharsToSearchReached,
    		clear,
    		onBlur,
    		highlightFilter,
    		showList
    	});

    	$$self.$inject_state = $$props => {
    		if ("items" in $$props) $$invalidate(28, items = $$props.items);
    		if ("searchFunction" in $$props) $$invalidate(31, searchFunction = $$props.searchFunction);
    		if ("labelFieldName" in $$props) $$invalidate(32, labelFieldName = $$props.labelFieldName);
    		if ("keywordsFieldName" in $$props) $$invalidate(33, keywordsFieldName = $$props.keywordsFieldName);
    		if ("valueFieldName" in $$props) $$invalidate(34, valueFieldName = $$props.valueFieldName);
    		if ("labelFunction" in $$props) $$invalidate(35, labelFunction = $$props.labelFunction);
    		if ("keywordsFunction" in $$props) $$invalidate(36, keywordsFunction = $$props.keywordsFunction);
    		if ("valueFunction" in $$props) $$invalidate(37, valueFunction = $$props.valueFunction);
    		if ("keywordsCleanFunction" in $$props) $$invalidate(38, keywordsCleanFunction = $$props.keywordsCleanFunction);
    		if ("textCleanFunction" in $$props) $$invalidate(39, textCleanFunction = $$props.textCleanFunction);
    		if ("beforeChange" in $$props) $$invalidate(40, beforeChange = $$props.beforeChange);
    		if ("onChange" in $$props) $$invalidate(41, onChange = $$props.onChange);
    		if ("selectFirstIfEmpty" in $$props) $$invalidate(42, selectFirstIfEmpty = $$props.selectFirstIfEmpty);
    		if ("minCharactersToSearch" in $$props) $$invalidate(43, minCharactersToSearch = $$props.minCharactersToSearch);
    		if ("maxItemsToShowInList" in $$props) $$invalidate(0, maxItemsToShowInList = $$props.maxItemsToShowInList);
    		if ("delay" in $$props) $$invalidate(44, delay = $$props.delay);
    		if ("localFiltering" in $$props) $$invalidate(45, localFiltering = $$props.localFiltering);
    		if ("noResultsText" in $$props) $$invalidate(1, noResultsText = $$props.noResultsText);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("className" in $$props) $$invalidate(3, className = $$props.className);
    		if ("inputClassName" in $$props) $$invalidate(4, inputClassName = $$props.inputClassName);
    		if ("inputId" in $$props) $$invalidate(5, inputId = $$props.inputId);
    		if ("name" in $$props) $$invalidate(6, name = $$props.name);
    		if ("title" in $$props) $$invalidate(7, title = $$props.title);
    		if ("html5autocomplete" in $$props) $$invalidate(8, html5autocomplete = $$props.html5autocomplete);
    		if ("dropdownClassName" in $$props) $$invalidate(9, dropdownClassName = $$props.dropdownClassName);
    		if ("hideArrow" in $$props) $$invalidate(10, hideArrow = $$props.hideArrow);
    		if ("showClear" in $$props) $$invalidate(11, showClear = $$props.showClear);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$props.disabled);
    		if ("debug" in $$props) $$invalidate(46, debug = $$props.debug);
    		if ("selectedItem" in $$props) $$invalidate(29, selectedItem = $$props.selectedItem);
    		if ("value" in $$props) $$invalidate(30, value = $$props.value);
    		if ("input" in $$props) $$invalidate(13, input = $$props.input);
    		if ("list" in $$props) $$invalidate(14, list = $$props.list);
    		if ("opened" in $$props) $$invalidate(47, opened = $$props.opened);
    		if ("highlightIndex" in $$props) $$invalidate(15, highlightIndex = $$props.highlightIndex);
    		if ("text" in $$props) $$invalidate(16, text = $$props.text);
    		if ("filteredTextLength" in $$props) $$invalidate(48, filteredTextLength = $$props.filteredTextLength);
    		if ("filteredListItems" in $$props) $$invalidate(17, filteredListItems = $$props.filteredListItems);
    		if ("listItems" in $$props) listItems = $$props.listItems;
    		if ("inputDelayTimeout" in $$props) inputDelayTimeout = $$props.inputDelayTimeout;
    		if ("showList" in $$props) $$invalidate(18, showList = $$props.showList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selectedItem*/ 536870912) {
    			(onSelectedItemChanged());
    		}

    		if ($$self.$$.dirty[0] & /*items*/ 268435456 | $$self.$$.dirty[1] & /*opened, filteredTextLength*/ 196608) {
    			$$invalidate(18, showList = opened && (items && items.length > 0 || filteredTextLength > 0));
    		}

    		if ($$self.$$.dirty[0] & /*items*/ 268435456) {
    			(prepareListItems());
    		}
    	};

    	return [
    		maxItemsToShowInList,
    		noResultsText,
    		placeholder,
    		className,
    		inputClassName,
    		inputId,
    		name,
    		title,
    		html5autocomplete,
    		dropdownClassName,
    		hideArrow,
    		showClear,
    		disabled,
    		input,
    		list,
    		highlightIndex,
    		text,
    		filteredListItems,
    		showList,
    		uniqueId,
    		onListItemClick,
    		onDocumentClick,
    		onKeyDown,
    		onKeyPress,
    		onInput,
    		onInputClick,
    		onFocus,
    		clear,
    		items,
    		selectedItem,
    		value,
    		searchFunction,
    		labelFieldName,
    		keywordsFieldName,
    		valueFieldName,
    		labelFunction,
    		keywordsFunction,
    		valueFunction,
    		keywordsCleanFunction,
    		textCleanFunction,
    		beforeChange,
    		onChange,
    		selectFirstIfEmpty,
    		minCharactersToSearch,
    		delay,
    		localFiltering,
    		debug,
    		opened,
    		filteredTextLength,
    		$$scope,
    		slots,
    		input_1_binding,
    		input_1_input_handler,
    		click_handler,
    		pointerenter_handler,
    		div0_binding
    	];
    }

    class SimpleAutocomplete extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$8,
    			create_fragment$8,
    			safe_not_equal,
    			{
    				items: 28,
    				searchFunction: 31,
    				labelFieldName: 32,
    				keywordsFieldName: 33,
    				valueFieldName: 34,
    				labelFunction: 35,
    				keywordsFunction: 36,
    				valueFunction: 37,
    				keywordsCleanFunction: 38,
    				textCleanFunction: 39,
    				beforeChange: 40,
    				onChange: 41,
    				selectFirstIfEmpty: 42,
    				minCharactersToSearch: 43,
    				maxItemsToShowInList: 0,
    				delay: 44,
    				localFiltering: 45,
    				noResultsText: 1,
    				placeholder: 2,
    				className: 3,
    				inputClassName: 4,
    				inputId: 5,
    				name: 6,
    				title: 7,
    				html5autocomplete: 8,
    				dropdownClassName: 9,
    				hideArrow: 10,
    				showClear: 11,
    				disabled: 12,
    				debug: 46,
    				selectedItem: 29,
    				value: 30
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SimpleAutocomplete",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get items() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueFieldName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueFieldName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keywordsCleanFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keywordsCleanFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textCleanFunction() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textCleanFunction(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get beforeChange() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set beforeChange(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onChange() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onChange(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectFirstIfEmpty() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectFirstIfEmpty(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minCharactersToSearch() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minCharactersToSearch(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxItemsToShowInList() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxItemsToShowInList(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delay() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delay(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get localFiltering() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set localFiltering(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noResultsText() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noResultsText(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputClassName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputClassName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputId() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputId(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get html5autocomplete() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set html5autocomplete(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropdownClassName() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownClassName(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideArrow() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideArrow(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClear() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClear(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get debug() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set debug(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedItem() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedItem(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SimpleAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SimpleAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SvelteTable.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$1 } = globals;
    const file$7 = "src/SvelteTable.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	child_ctx[38] = i;
    	return child_ctx;
    }

    const get_after_row_slot_changes = dirty => ({ row: dirty[0] & /*c_rows*/ 8192 });
    const get_after_row_slot_context = ctx => ({ row: /*row*/ ctx[36], n: /*n*/ ctx[38] });

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    const get_row_slot_changes = dirty => ({ row: dirty[0] & /*c_rows*/ 8192 });
    const get_row_slot_context = ctx => ({ row: /*row*/ ctx[36], n: /*n*/ ctx[38] });

    function get_each_context_2$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	return child_ctx;
    }

    const get_header_slot_changes = dirty => ({
    	sortOrder: dirty[0] & /*sortOrder*/ 2,
    	sortBy: dirty[0] & /*sortBy*/ 1
    });

    const get_header_slot_context = ctx => ({
    	sortOrder: /*sortOrder*/ ctx[1],
    	sortBy: /*sortBy*/ ctx[0]
    });

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	child_ctx[44] = list;
    	child_ctx[45] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[46] = list[i];
    	return child_ctx;
    }

    // (123:4) {#if showFilterHeader}
    function create_if_block_4$1(ctx) {
    	let tr;
    	let each_value_3 = /*columns*/ ctx[3];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(tr, "class", "row-filter-header svelte-uczycn");
    			add_location(tr, file$7, 123, 6, 3788);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filterSelections, columns, asStringArray, classNameSelect, filterValues*/ 37388) {
    				each_value_3 = /*columns*/ ctx[3];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(123:4) {#if showFilterHeader}",
    		ctx
    	});

    	return block;
    }

    // (129:58) 
    function create_if_block_6(ctx) {
    	let select;
    	let option;
    	let select_class_value;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*filterValues*/ ctx[12][/*col*/ ctx[39].key];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[28].call(select, /*col*/ ctx[39]);
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = undefined;
    			option.value = option.__value;
    			add_location(option, file$7, 130, 16, 4150);
    			attr_dev(select, "class", select_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameSelect*/ ctx[9])) + " svelte-uczycn"));
    			if (/*filterSelections*/ ctx[2][/*col*/ ctx[39].key] === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$7, 129, 14, 4047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*filterSelections*/ ctx[2][/*col*/ ctx[39].key]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", select_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*filterValues, columns*/ 4104) {
    				each_value_4 = /*filterValues*/ ctx[12][/*col*/ ctx[39].key];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}

    			if (dirty[0] & /*classNameSelect*/ 512 && select_class_value !== (select_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameSelect*/ ctx[9])) + " svelte-uczycn"))) {
    				attr_dev(select, "class", select_class_value);
    			}

    			if (dirty[0] & /*filterSelections, columns, filterValues*/ 4108) {
    				select_option(select, /*filterSelections*/ ctx[2][/*col*/ ctx[39].key]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(129:58) ",
    		ctx
    	});

    	return block;
    }

    // (127:12) {#if col.searchValue !== undefined}
    function create_if_block_5(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[27].call(input, /*col*/ ctx[39]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			add_location(input, file$7, 127, 14, 3927);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*filterSelections*/ ctx[2][/*col*/ ctx[39].key]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*filterSelections, columns, filterValues*/ 4108 && input.value !== /*filterSelections*/ ctx[2][/*col*/ ctx[39].key]) {
    				set_input_value(input, /*filterSelections*/ ctx[2][/*col*/ ctx[39].key]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(127:12) {#if col.searchValue !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (132:16) {#each filterValues[col.key] as option}
    function create_each_block_4(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[46].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[46].value;
    			option.value = option.__value;
    			add_location(option, file$7, 132, 18, 4260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filterValues, columns*/ 4104 && t_value !== (t_value = /*option*/ ctx[46].name + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*filterValues, columns*/ 4104 && option_value_value !== (option_value_value = /*option*/ ctx[46].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(132:16) {#each filterValues[col.key] as option}",
    		ctx
    	});

    	return block;
    }

    // (125:8) {#each columns as col}
    function create_each_block_3(ctx) {
    	let th;
    	let t;

    	function select_block_type(ctx, dirty) {
    		if (/*col*/ ctx[39].searchValue !== undefined) return create_if_block_5;
    		if (/*filterValues*/ ctx[12][/*col*/ ctx[39].key] !== undefined) return create_if_block_6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			th = element("th");
    			if (if_block) if_block.c();
    			t = space();
    			add_location(th, file$7, 125, 10, 3860);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			if (if_block) if_block.m(th, null);
    			append_dev(th, t);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(th, t);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(125:8) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (154:10) {:else}
    function create_else_block_1$1(ctx) {
    	let th;
    	let t0_value = /*col*/ ctx[39].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let th_class_value;
    	let if_block = /*sortBy*/ ctx[0] === /*col*/ ctx[39].key && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(th, "class", th_class_value = "" + (null_to_empty(/*col*/ ctx[39].headerClass) + " svelte-uczycn"));
    			add_location(th, file$7, 154, 12, 4934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    			if (if_block) if_block.m(th, null);
    			append_dev(th, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*columns*/ 8 && t0_value !== (t0_value = /*col*/ ctx[39].title + "")) set_data_dev(t0, t0_value);

    			if (/*sortBy*/ ctx[0] === /*col*/ ctx[39].key) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$1(ctx);
    					if_block.c();
    					if_block.m(th, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*columns, filterValues*/ 4104 && th_class_value !== (th_class_value = "" + (null_to_empty(/*col*/ ctx[39].headerClass) + " svelte-uczycn"))) {
    				attr_dev(th, "class", th_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1$1.name,
    		type: "else",
    		source: "(154:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (144:10) {#if col.sortable}
    function create_if_block_1$3(ctx) {
    	let th;
    	let t0_value = /*col*/ ctx[39].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let th_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*sortBy*/ ctx[0] === /*col*/ ctx[39].key && create_if_block_2$3(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[29](/*col*/ ctx[39], ...args);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(th, "class", th_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](["isSortable", /*col*/ ctx[39].headerClass])) + " svelte-uczycn"));
    			add_location(th, file$7, 144, 12, 4603);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    			if (if_block) if_block.m(th, null);
    			append_dev(th, t2);

    			if (!mounted) {
    				dispose = listen_dev(th, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*columns*/ 8 && t0_value !== (t0_value = /*col*/ ctx[39].title + "")) set_data_dev(t0, t0_value);

    			if (/*sortBy*/ ctx[0] === /*col*/ ctx[39].key) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$3(ctx);
    					if_block.c();
    					if_block.m(th, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*columns, filterValues*/ 4104 && th_class_value !== (th_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](["isSortable", /*col*/ ctx[39].headerClass])) + " svelte-uczycn"))) {
    				attr_dev(th, "class", th_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(144:10) {#if col.sortable}",
    		ctx
    	});

    	return block;
    }

    // (159:14) {#if sortBy === col.key}
    function create_if_block_3$1(ctx) {
    	let t_value = (/*sortOrder*/ ctx[1] === 1
    	? /*iconAsc*/ ctx[4]
    	: /*iconDesc*/ ctx[5]) + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sortOrder, iconAsc, iconDesc*/ 50 && t_value !== (t_value = (/*sortOrder*/ ctx[1] === 1
    			? /*iconAsc*/ ctx[4]
    			: /*iconDesc*/ ctx[5]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(159:14) {#if sortBy === col.key}",
    		ctx
    	});

    	return block;
    }

    // (150:14) {#if sortBy === col.key}
    function create_if_block_2$3(ctx) {
    	let t_value = (/*sortOrder*/ ctx[1] === 1
    	? /*iconAsc*/ ctx[4]
    	: /*iconDesc*/ ctx[5]) + "";

    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*sortOrder, iconAsc, iconDesc*/ 50 && t_value !== (t_value = (/*sortOrder*/ ctx[1] === 1
    			? /*iconAsc*/ ctx[4]
    			: /*iconDesc*/ ctx[5]) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(150:14) {#if sortBy === col.key}",
    		ctx
    	});

    	return block;
    }

    // (143:8) {#each columns as col}
    function create_each_block_2$2(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*col*/ ctx[39].sortable) return create_if_block_1$3;
    		return create_else_block_1$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$2.name,
    		type: "each",
    		source: "(143:8) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (141:62)        
    function fallback_block_2(ctx) {
    	let tr;
    	let each_value_2 = /*columns*/ ctx[3];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(tr, "class", "row-title-header");
    			add_location(tr, file$7, 141, 6, 4501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*asStringArray, columns, handleClickCol, sortOrder, iconAsc, iconDesc, sortBy*/ 98363) {
    				each_value_2 = /*columns*/ ctx[3];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(141:62)        ",
    		ctx
    	});

    	return block;
    }

    // (183:14) {:else}
    function create_else_block$4(ctx) {
    	let html_tag;

    	let raw_value = (/*col*/ ctx[39].renderValue
    	? /*col*/ ctx[39].renderValue(/*row*/ ctx[36])
    	: /*col*/ ctx[39].value(/*row*/ ctx[36])) + "";

    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*columns, c_rows*/ 8200 && raw_value !== (raw_value = (/*col*/ ctx[39].renderValue
    			? /*col*/ ctx[39].renderValue(/*row*/ ctx[36])
    			: /*col*/ ctx[39].value(/*row*/ ctx[36])) + "")) html_tag.p(raw_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(183:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (177:14) {#if col.renderComponent}
    function create_if_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		/*col*/ ctx[39].renderComponent.props || {},
    		{ row: /*row*/ ctx[36] },
    		{ col: /*col*/ ctx[39] }
    	];

    	var switch_value = /*col*/ ctx[39].renderComponent.component || /*col*/ ctx[39].renderComponent;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty[0] & /*columns, c_rows*/ 8200)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty[0] & /*columns*/ 8 && get_spread_object(/*col*/ ctx[39].renderComponent.props || {}),
    					dirty[0] & /*c_rows*/ 8192 && { row: /*row*/ ctx[36] },
    					dirty[0] & /*columns*/ 8 && { col: /*col*/ ctx[39] }
    				])
    			: {};

    			if (switch_value !== (switch_value = /*col*/ ctx[39].renderComponent.component || /*col*/ ctx[39].renderComponent)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(177:14) {#if col.renderComponent}",
    		ctx
    	});

    	return block;
    }

    // (172:10) {#each columns as col}
    function create_each_block_1$3(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let td_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$4, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*col*/ ctx[39].renderComponent) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[30](/*row*/ ctx[36], /*col*/ ctx[39], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			t = space();
    			attr_dev(td, "class", td_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15]([/*col*/ ctx[39].class, /*classNameCell*/ ctx[11]])) + " svelte-uczycn"));
    			add_location(td, file$7, 172, 12, 5469);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_blocks[current_block_type_index].m(td, null);
    			append_dev(td, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(td, t);
    			}

    			if (!current || dirty[0] & /*columns, classNameCell, filterValues*/ 6152 && td_class_value !== (td_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15]([/*col*/ ctx[39].class, /*classNameCell*/ ctx[11]])) + " svelte-uczycn"))) {
    				attr_dev(td, "class", td_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(172:10) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (170:40)          
    function fallback_block_1(ctx) {
    	let tr;
    	let tr_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*columns*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[31](/*row*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(tr, "class", tr_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameRow*/ ctx[10])) + " svelte-uczycn"));
    			add_location(tr, file$7, 170, 8, 5342);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(tr, "click", click_handler_2, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*asStringArray, columns, classNameCell, handleClickCell, c_rows*/ 305160) {
    				each_value_1 = /*columns*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*classNameRow*/ 1024 && tr_class_value !== (tr_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameRow*/ ctx[10])) + " svelte-uczycn"))) {
    				attr_dev(tr, "class", tr_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(170:40)          ",
    		ctx
    	});

    	return block;
    }

    // (169:4) {#each c_rows as row, n}
    function create_each_block$4(ctx) {
    	let t;
    	let current;
    	const row_slot_template = /*#slots*/ ctx[26].row;
    	const row_slot = create_slot(row_slot_template, ctx, /*$$scope*/ ctx[25], get_row_slot_context);
    	const row_slot_or_fallback = row_slot || fallback_block_1(ctx);
    	const after_row_slot_template = /*#slots*/ ctx[26]["after-row"];
    	const after_row_slot = create_slot(after_row_slot_template, ctx, /*$$scope*/ ctx[25], get_after_row_slot_context);

    	const block = {
    		c: function create() {
    			if (row_slot_or_fallback) row_slot_or_fallback.c();
    			t = space();
    			if (after_row_slot) after_row_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (row_slot_or_fallback) {
    				row_slot_or_fallback.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);

    			if (after_row_slot) {
    				after_row_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (row_slot) {
    				if (row_slot.p && (!current || dirty[0] & /*$$scope, c_rows*/ 33562624)) {
    					update_slot(row_slot, row_slot_template, ctx, /*$$scope*/ ctx[25], dirty, get_row_slot_changes, get_row_slot_context);
    				}
    			} else {
    				if (row_slot_or_fallback && row_slot_or_fallback.p && dirty[0] & /*classNameRow, c_rows, columns, classNameCell*/ 11272) {
    					row_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (after_row_slot) {
    				if (after_row_slot.p && (!current || dirty[0] & /*$$scope, c_rows*/ 33562624)) {
    					update_slot(after_row_slot, after_row_slot_template, ctx, /*$$scope*/ ctx[25], dirty, get_after_row_slot_changes, get_after_row_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row_slot_or_fallback, local);
    			transition_in(after_row_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row_slot_or_fallback, local);
    			transition_out(after_row_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (row_slot_or_fallback) row_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t);
    			if (after_row_slot) after_row_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(169:4) {#each c_rows as row, n}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let table;
    	let thead;
    	let t0;
    	let thead_class_value;
    	let t1;
    	let tbody;
    	let tbody_class_value;
    	let table_class_value;
    	let current;
    	let if_block = /*showFilterHeader*/ ctx[14] && create_if_block_4$1(ctx);
    	const header_slot_template = /*#slots*/ ctx[26].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[25], get_header_slot_context);
    	const header_slot_or_fallback = header_slot || fallback_block_2(ctx);
    	let each_value = /*c_rows*/ ctx[13];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			if (if_block) if_block.c();
    			t0 = space();
    			if (header_slot_or_fallback) header_slot_or_fallback.c();
    			t1 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(thead, "class", thead_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameThead*/ ctx[7])) + " svelte-uczycn"));
    			add_location(thead, file$7, 121, 2, 3709);
    			attr_dev(tbody, "class", tbody_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTbody*/ ctx[8])) + " svelte-uczycn"));
    			add_location(tbody, file$7, 167, 2, 5218);
    			attr_dev(table, "class", table_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTable*/ ctx[6])) + " svelte-uczycn"));
    			add_location(table, file$7, 120, 0, 3661);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			if (if_block) if_block.m(thead, null);
    			append_dev(thead, t0);

    			if (header_slot_or_fallback) {
    				header_slot_or_fallback.m(thead, null);
    			}

    			append_dev(table, t1);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showFilterHeader*/ ctx[14]) if_block.p(ctx, dirty);

    			if (header_slot) {
    				if (header_slot.p && (!current || dirty[0] & /*$$scope, sortOrder, sortBy*/ 33554435)) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[25], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			} else {
    				if (header_slot_or_fallback && header_slot_or_fallback.p && dirty[0] & /*columns, sortOrder, iconAsc, iconDesc, sortBy*/ 59) {
    					header_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty[0] & /*classNameThead*/ 128 && thead_class_value !== (thead_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameThead*/ ctx[7])) + " svelte-uczycn"))) {
    				attr_dev(thead, "class", thead_class_value);
    			}

    			if (dirty[0] & /*$$scope, c_rows, asStringArray, classNameRow, handleClickRow, columns, classNameCell, handleClickCell*/ 33991688) {
    				each_value = /*c_rows*/ ctx[13];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty[0] & /*classNameTbody*/ 256 && tbody_class_value !== (tbody_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTbody*/ ctx[8])) + " svelte-uczycn"))) {
    				attr_dev(tbody, "class", tbody_class_value);
    			}

    			if (!current || dirty[0] & /*classNameTable*/ 64 && table_class_value !== (table_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTable*/ ctx[6])) + " svelte-uczycn"))) {
    				attr_dev(table, "class", table_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot_or_fallback, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot_or_fallback, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (if_block) if_block.d();
    			if (header_slot_or_fallback) header_slot_or_fallback.d(detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let c_rows;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SvelteTable", slots, ['header','row','after-row']);
    	const dispatch = createEventDispatcher();
    	let { columns } = $$props;
    	let { rows } = $$props;
    	let { sortBy = "" } = $$props;
    	let { sortOrder = 1 } = $$props;
    	let { iconAsc = "▲" } = $$props;
    	let { iconDesc = "▼" } = $$props;
    	let { classNameTable = "" } = $$props;
    	let { classNameThead = "" } = $$props;
    	let { classNameTbody = "" } = $$props;
    	let { classNameSelect = "" } = $$props;
    	let { classNameRow = "" } = $$props;
    	let { classNameCell = "" } = $$props;
    	let { filterSelections = {} } = $$props;
    	let { sliceBegin = null } = $$props;
    	let { sliceEnd = null } = $$props;
    	let { disableFilterHeader = false } = $$props;
    	let sortFunction = () => "";

    	let showFilterHeader = !disableFilterHeader && columns.some(c => {
    		// check if there are any filter or search headers
    		return c.filterOptions !== undefined || c.searchValue !== undefined;
    	});

    	let filterValues = {};
    	let searchValues = {};
    	let columnByKey = {};

    	columns.forEach(col => {
    		$$invalidate(24, columnByKey[col.key] = col, columnByKey);
    	});

    	const asStringArray = v => [].concat(v).filter(v => typeof v === "string" && v !== "").join(" ");

    	const calculateFilterValues = () => {
    		$$invalidate(12, filterValues = {});

    		columns.forEach(c => {
    			if (typeof c.filterOptions === "function") {
    				$$invalidate(12, filterValues[c.key] = c.filterOptions(rows), filterValues);
    			} else if (Array.isArray(c.filterOptions)) {
    				// if array of strings is provided, use it for name and value
    				$$invalidate(12, filterValues[c.key] = c.filterOptions.map(val => ({ name: val, value: val })), filterValues);
    			}
    		});
    	};

    	
    	

    	const updateSortOrder = colKey => {
    		if (colKey === sortBy) {
    			$$invalidate(1, sortOrder = sortOrder === 1 ? -1 : 1);
    		} else {
    			$$invalidate(1, sortOrder = 1);
    		}
    	};

    	const handleClickCol = (event, col) => {
    		updateSortOrder(col.key);
    		$$invalidate(0, sortBy = col.key);
    		dispatch("clickCol", { event, col, key: col.key });
    	};

    	const handleClickRow = (event, row) => {
    		dispatch("clickRow", { event, row });
    	};

    	const handleClickCell = (event, row, key) => {
    		dispatch("clickCell", { event, row, key });
    	};

    	const writable_props = [
    		"columns",
    		"rows",
    		"sortBy",
    		"sortOrder",
    		"iconAsc",
    		"iconDesc",
    		"classNameTable",
    		"classNameThead",
    		"classNameTbody",
    		"classNameSelect",
    		"classNameRow",
    		"classNameCell",
    		"filterSelections",
    		"sliceBegin",
    		"sliceEnd",
    		"disableFilterHeader"
    	];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SvelteTable> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler(col) {
    		filterSelections[col.key] = this.value;
    		$$invalidate(2, filterSelections);
    		$$invalidate(3, columns);
    		$$invalidate(12, filterValues);
    	}

    	function select_change_handler(col) {
    		filterSelections[col.key] = select_value(this);
    		$$invalidate(2, filterSelections);
    		$$invalidate(3, columns);
    		$$invalidate(12, filterValues);
    	}

    	const click_handler = (col, e) => handleClickCol(e, col);

    	const click_handler_1 = (row, col, e) => {
    		handleClickCell(e, row, col.key);
    	};

    	const click_handler_2 = (row, e) => {
    		handleClickRow(e, row);
    	};

    	$$self.$$set = $$props => {
    		if ("columns" in $$props) $$invalidate(3, columns = $$props.columns);
    		if ("rows" in $$props) $$invalidate(19, rows = $$props.rows);
    		if ("sortBy" in $$props) $$invalidate(0, sortBy = $$props.sortBy);
    		if ("sortOrder" in $$props) $$invalidate(1, sortOrder = $$props.sortOrder);
    		if ("iconAsc" in $$props) $$invalidate(4, iconAsc = $$props.iconAsc);
    		if ("iconDesc" in $$props) $$invalidate(5, iconDesc = $$props.iconDesc);
    		if ("classNameTable" in $$props) $$invalidate(6, classNameTable = $$props.classNameTable);
    		if ("classNameThead" in $$props) $$invalidate(7, classNameThead = $$props.classNameThead);
    		if ("classNameTbody" in $$props) $$invalidate(8, classNameTbody = $$props.classNameTbody);
    		if ("classNameSelect" in $$props) $$invalidate(9, classNameSelect = $$props.classNameSelect);
    		if ("classNameRow" in $$props) $$invalidate(10, classNameRow = $$props.classNameRow);
    		if ("classNameCell" in $$props) $$invalidate(11, classNameCell = $$props.classNameCell);
    		if ("filterSelections" in $$props) $$invalidate(2, filterSelections = $$props.filterSelections);
    		if ("sliceBegin" in $$props) $$invalidate(20, sliceBegin = $$props.sliceBegin);
    		if ("sliceEnd" in $$props) $$invalidate(21, sliceEnd = $$props.sliceEnd);
    		if ("disableFilterHeader" in $$props) $$invalidate(22, disableFilterHeader = $$props.disableFilterHeader);
    		if ("$$scope" in $$props) $$invalidate(25, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		columns,
    		rows,
    		sortBy,
    		sortOrder,
    		iconAsc,
    		iconDesc,
    		classNameTable,
    		classNameThead,
    		classNameTbody,
    		classNameSelect,
    		classNameRow,
    		classNameCell,
    		filterSelections,
    		sliceBegin,
    		sliceEnd,
    		disableFilterHeader,
    		sortFunction,
    		showFilterHeader,
    		filterValues,
    		searchValues,
    		columnByKey,
    		asStringArray,
    		calculateFilterValues,
    		updateSortOrder,
    		handleClickCol,
    		handleClickRow,
    		handleClickCell,
    		c_rows
    	});

    	$$self.$inject_state = $$props => {
    		if ("columns" in $$props) $$invalidate(3, columns = $$props.columns);
    		if ("rows" in $$props) $$invalidate(19, rows = $$props.rows);
    		if ("sortBy" in $$props) $$invalidate(0, sortBy = $$props.sortBy);
    		if ("sortOrder" in $$props) $$invalidate(1, sortOrder = $$props.sortOrder);
    		if ("iconAsc" in $$props) $$invalidate(4, iconAsc = $$props.iconAsc);
    		if ("iconDesc" in $$props) $$invalidate(5, iconDesc = $$props.iconDesc);
    		if ("classNameTable" in $$props) $$invalidate(6, classNameTable = $$props.classNameTable);
    		if ("classNameThead" in $$props) $$invalidate(7, classNameThead = $$props.classNameThead);
    		if ("classNameTbody" in $$props) $$invalidate(8, classNameTbody = $$props.classNameTbody);
    		if ("classNameSelect" in $$props) $$invalidate(9, classNameSelect = $$props.classNameSelect);
    		if ("classNameRow" in $$props) $$invalidate(10, classNameRow = $$props.classNameRow);
    		if ("classNameCell" in $$props) $$invalidate(11, classNameCell = $$props.classNameCell);
    		if ("filterSelections" in $$props) $$invalidate(2, filterSelections = $$props.filterSelections);
    		if ("sliceBegin" in $$props) $$invalidate(20, sliceBegin = $$props.sliceBegin);
    		if ("sliceEnd" in $$props) $$invalidate(21, sliceEnd = $$props.sliceEnd);
    		if ("disableFilterHeader" in $$props) $$invalidate(22, disableFilterHeader = $$props.disableFilterHeader);
    		if ("sortFunction" in $$props) $$invalidate(23, sortFunction = $$props.sortFunction);
    		if ("showFilterHeader" in $$props) $$invalidate(14, showFilterHeader = $$props.showFilterHeader);
    		if ("filterValues" in $$props) $$invalidate(12, filterValues = $$props.filterValues);
    		if ("searchValues" in $$props) searchValues = $$props.searchValues;
    		if ("columnByKey" in $$props) $$invalidate(24, columnByKey = $$props.columnByKey);
    		if ("c_rows" in $$props) $$invalidate(13, c_rows = $$props.c_rows);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*columnByKey, sortBy*/ 16777217) {
    			{
    				let col = columnByKey[sortBy];

    				if (col !== undefined && col.sortable === true && typeof col.value === "function") {
    					$$invalidate(23, sortFunction = r => col.value(r));
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*rows, filterSelections, columnByKey, sortFunction, sortOrder, sliceBegin, sliceEnd*/ 28835846) {
    			$$invalidate(13, c_rows = rows.filter(r => {
    				// get search and filter results/matches
    				return Object.keys(filterSelections).every(f => {
    					// check search (text input) matches
    					let resSearch = filterSelections[f] === "" || columnByKey[f].searchValue && (columnByKey[f].searchValue(r) + "").toLocaleLowerCase().indexOf((filterSelections[f] + "").toLocaleLowerCase()) >= 0;

    					// check filter (dropdown) matches
    					let resFilter = resSearch || filterSelections[f] === undefined || // default to value() if filterValue() not provided in col
    					filterSelections[f] === (typeof columnByKey[f].filterValue === "function"
    					? columnByKey[f].filterValue(r)
    					: columnByKey[f].value(r));

    					return resFilter;
    				});
    			}).map(r => Object.assign({}, r, { $sortOn: sortFunction(r) })).sort((a, b) => {
    				if (a.$sortOn > b.$sortOn) return sortOrder; else if (a.$sortOn < b.$sortOn) return -sortOrder;
    				return 0;
    			}).slice(sliceBegin || 0, sliceEnd || undefined));
    		}

    		if ($$self.$$.dirty[0] & /*columns, rows*/ 524296) {
    			{
    				// if filters are enabled, watch rows and columns
    				if (showFilterHeader && columns && rows) {
    					calculateFilterValues();
    				}
    			}
    		}
    	};

    	return [
    		sortBy,
    		sortOrder,
    		filterSelections,
    		columns,
    		iconAsc,
    		iconDesc,
    		classNameTable,
    		classNameThead,
    		classNameTbody,
    		classNameSelect,
    		classNameRow,
    		classNameCell,
    		filterValues,
    		c_rows,
    		showFilterHeader,
    		asStringArray,
    		handleClickCol,
    		handleClickRow,
    		handleClickCell,
    		rows,
    		sliceBegin,
    		sliceEnd,
    		disableFilterHeader,
    		sortFunction,
    		columnByKey,
    		$$scope,
    		slots,
    		input_input_handler,
    		select_change_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class SvelteTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$7,
    			create_fragment$7,
    			safe_not_equal,
    			{
    				columns: 3,
    				rows: 19,
    				sortBy: 0,
    				sortOrder: 1,
    				iconAsc: 4,
    				iconDesc: 5,
    				classNameTable: 6,
    				classNameThead: 7,
    				classNameTbody: 8,
    				classNameSelect: 9,
    				classNameRow: 10,
    				classNameCell: 11,
    				filterSelections: 2,
    				sliceBegin: 20,
    				sliceEnd: 21,
    				disableFilterHeader: 22
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteTable",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*columns*/ ctx[3] === undefined && !("columns" in props)) {
    			console.warn("<SvelteTable> was created without expected prop 'columns'");
    		}

    		if (/*rows*/ ctx[19] === undefined && !("rows" in props)) {
    			console.warn("<SvelteTable> was created without expected prop 'rows'");
    		}
    	}

    	get columns() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set columns(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortBy() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortBy(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sortOrder() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sortOrder(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconAsc() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconAsc(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconDesc() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconDesc(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameTable() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameTable(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameThead() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameThead(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameTbody() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameTbody(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameSelect() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameSelect(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameRow() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameRow(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNameCell() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNameCell(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filterSelections() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filterSelections(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sliceBegin() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sliceBegin(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sliceEnd() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sliceEnd(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disableFilterHeader() {
    		throw new Error("<SvelteTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disableFilterHeader(value) {
    		throw new Error("<SvelteTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // export const allSkills = [
    //   // 'あ行のスキル',
    //   'アイテム使用強化',
    //   '泡沫の舞',
    //   '炎鱗の恩恵',
    //   '鬼火纏',
    //   // 'か行のスキル',
    //   'ガード強化',
    //   'ガード性能',
    //   '会心撃【属性】',
    //   '回避距離UP',
    //   '回避性能',
    //   '回復速度',
    //   '翔蟲使い',
    //   '火事場力',
    //   '滑走強化',
    //   '霞皮の恩恵',
    //   '雷属性攻撃強化',
    //   '雷耐性',
    //   '貫通弾・貫通矢強化',
    //   '気絶耐性',
    //   'キノコ大好き',
    //   '逆襲',
    //   '強化持続',
    //   'KO術',
    //   '広域化',
    //   '幸運',
    //   '鋼殻の恩恵',
    //   '攻撃',
    //   '剛刃研磨',
    //   '高速変形',
    //   '氷属性攻撃強化',
    //   '氷耐性',
    //   '渾身',
    //   // 'さ行のスキル',
    //   '逆恨み',
    //   '散弾・拡散矢強化',
    //   '死中に活',
    //   '弱点特効',
    //   'ジャンプ鉄人',
    //   '集中',
    //   '植生学',
    //   '心眼',
    //   '睡眠属性強化',
    //   '睡眠耐性',
    //   'スタミナ急速回復',
    //   'スタミナ奪取',
    //   '精霊の加護',
    //   '攻めの守勢',
    //   '装填拡張',
    //   '装填速度',
    //   '速射強化',
    //   '属性やられ耐性',
    //   // 'た行のスキル',
    //   '体術',
    //   '耐震',
    //   '体力回復量UP',
    //   '匠',
    //   '達人芸',
    //   '弾丸節約',
    //   '弾導強化',
    //   '力の解放',
    //   '地質学',
    //   '超会心',
    //   '挑戦者',
    //   '通常弾・連射矢強化',
    //   '泥雪耐性',
    //   '砥石使用高速化',
    //   '特殊射撃強化',
    //   '毒属性強化',
    //   '毒耐性',
    //   '飛び込み',
    //   '鈍器使い',
    //   // 'な行のスキル',
    //   '納刀術',
    //   '乗り名人',
    //   // 'は行のスキル',
    //   '破壊王',
    //   '剥ぎ取り鉄人',
    //   '剥ぎ取り名人',
    //   '爆破属性強化',
    //   '爆破やられ耐性',
    //   '抜刀術【力】',
    //   '抜刀術【技】',
    //   '早食い',
    //   '腹減り耐性',
    //   '反動軽減',
    //   '火属性攻撃強化',
    //   '火耐性',
    //   'ひるみ軽減',
    //   '風圧耐性',
    //   '風紋の一致',
    //   '笛吹き名人',
    //   '不屈',
    //   'フルチャージ',
    //   'ブレ抑制',
    //   '壁面移動',
    //   '防御',
    //   '砲術',
    //   '砲弾装填',
    //   '捕獲名人',
    //   'ボマー',
    //   // 'ま行のスキル',
    //   '麻痺属性強化',
    //   '麻痺耐性',
    //   '満足感',
    //   '見切り',
    //   '水属性攻撃強化',
    //   '水耐性',
    //   '耳栓',
    //   // 'や行のスキル',
    //   '弓溜め段階解放',
    //   '陽動',
    //   // 'ら行のスキル',
    //   '雷紋の一致',
    //   'ランナー',
    //   '龍属性攻撃強化',
    //   '龍耐性',
    //   // 'わ行のスキル',
    //   '業物',
    // ]


    const allSkillDetails = [
      // 'あ行のスキル',
      { name: 'アイテム使用強化',   hiragana: 'あいてむしようきょうか',           englishCharacters: 'aitemusiyoukyouka'            },
      { name: '泡沫の舞',           hiragana: 'うたかたのまい',                   englishCharacters: 'utakatanomai'                 },
      { name: '炎鱗の恩恵',         hiragana: 'えんりんのおんけい',               englishCharacters: 'enrinnoonkei'                 },
      { name: '鬼火纏',             hiragana: 'おにびまとい',                     englishCharacters: 'onibimatoi'                   },
      // 'か行のスキル',
      { name: 'ガード強化',         hiragana: 'がーどきょうか',                   englishCharacters: 'ga-dokyouka'                  },
      { name: 'ガード性能',         hiragana: 'がーどせいのう',                   englishCharacters: 'ga-doseinou'                  },
      { name: '会心撃【属性】',     hiragana: 'かいしんげきぞくせい',             englishCharacters: 'kaisingekizokusei'            },
      { name: '回避距離UP',         hiragana: 'かいひきょりあっぷ',               englishcharacters: 'kaihikyoriappu'               },
      { name: '回避性能',           hiragana: 'かいひせいのう',                   englishCharacters: 'kaihiseinou'                  },
      { name: '回復速度',           hiragana: 'かいふくそくど',                   englishCharacters: 'kaihukusokudo'                },
      { name: '翔蟲使い',           hiragana: 'かけりむしつかい',                 englishCharacters: 'kakerimusitukai'              },
      { name: '火事場力',           hiragana: 'かじばりょく',                     englishCharacters: 'kajibaryoku'                  },
      { name: '滑走強化',           hiragana: 'かっそうきょうか',                 englishCharacters: 'kassoukyouka'                 },
      { name: '霞皮の恩恵',         hiragana: 'かすみがわのおんけい',             englishCharacters: 'kasumigawanoonkei'            },
      { name: '雷属性攻撃強化',     hiragana: 'かみなりぞくせいこうげききょうか', englishCharacters: 'kaminarizokuseikougekikyouka' },
      { name: '雷耐性',             hiragana: 'かみなりたいせい',                 englishCharacters: 'kaminaritaisei'               },
      { name: '貫通弾・貫通矢強化', hiragana: 'かんつうだんかんつうやきょうか',   englishCharacters: 'kantuudankantuuyakyouka'      },
      { name: '気絶耐性',           hiragana: 'きぜつたいせい',                   englishCharacters: 'kizetutaisei'                 },
      { name: 'キノコ大好き',       hiragana: 'きのこだいすき',                   englishCharacters: 'kinokodaisuki'                },
      { name: '逆襲',               hiragana: 'ぎゃくしゅう',                     englishCharacters: 'gyakusyuu'                    },
      { name: '強化持続',           hiragana: 'きょうかじぞく',                   englishCharacters: 'kyoukajizoku'                 },
      { name: 'KO術',               hiragana: 'けーおーじゅつ',                   englishcharacters: 'ke-o-jutu'                    },
      { name: '広域化',             hiragana: 'こういきか',                       englishCharacters: 'kouikika'                     },
      { name: '幸運',               hiragana: 'こううん',                         englishCharacters: 'kouun'                        },
      { name: '鋼殻の恩恵',         hiragana: 'こうかくのおんけい',               englishCharacters: 'koukakunoonkei'               },
      { name: '攻撃',               hiragana: 'こうげき',                         englishCharacters: 'kougeki'                      },
      { name: '剛刃研磨',           hiragana: 'ごうじんけんま',                   englishCharacters: 'goujinkenma'                  },
      { name: '高速変形',           hiragana: 'こうそくへんけい',                 englishCharacters: 'kousokuhenkei'                },
      { name: '氷属性攻撃強化',     hiragana: 'こおりぞくせいきょうか',           englishCharacters: 'koorizokuseikyouka'           },
      { name: '氷耐性',             hiragana: 'こおりたいせい',                   englishCharacters: 'kooritaisei'                  },
      { name: '渾身',               hiragana: 'こんしん',                         englishCharacters: 'konsin'                       },
      // 'さ行のスキル',
      { name: '逆恨み',             hiragana: 'さかうらみ',                       englishCharacters: 'sakaurami'                    },
      { name: '散弾・拡散矢強化',   hiragana: 'さんだんかんつうやきょうか',       englishCharacters: 'sandankantuuyakyouka'         },
      { name: '死中に活',           hiragana: 'しちゅうにかつ',                   englishCharacters: 'sityuunikatu'                 },
      { name: '弱点特効',           hiragana: 'じゃくてんとっこう',               englishCharacters: 'jakutentokkou'                },
      { name: 'ジャンプ鉄人',       hiragana: 'じゃんぷてつじん',                 englishCharacters: 'janputetujin'                 },
      { name: '集中',               hiragana: 'しゅうちゅう',                     englishCharacters: 'syuutyuu'                     },
      { name: '植生学',             hiragana: 'しょくせいがく',                   englishCharacters: 'syokuseigaku'                 },
      { name: '心眼',               hiragana: 'しんがん',                         englishCharacters: 'singan'                       },
      { name: '睡眠属性強化',       hiragana: 'すいみんぞくせいきょうか',         englishCharacters: 'suiminzokuseikyouka'          },
      { name: '睡眠耐性',           hiragana: 'すいみんたいせい',                 englishCharacters: 'suimintaisei'                 },
      { name: 'スタミナ急速回復',   hiragana: 'すたみなきゅうそくかいふく',       englishCharacters: 'sutaminakyuusokukaihuku'      },
      { name: 'スタミナ奪取',       hiragana: 'すたみなだっしゅ',                 englishCharacters: 'sutaminadassyu'               },
      { name: '精霊の加護',         hiragana: 'せいれいのかご',                   englishCharacters: 'seireinokago'                 },
      { name: '攻めの守勢',         hiragana: 'せめのしゅせい',                   englishCharacters: 'semenosyusei'                 },
      { name: '装填拡張',           hiragana: 'そうてんかくちょう',               englishCharacters: 'soutenkakutyou'               },
      { name: '装填速度',           hiragana: 'そうてんそくど',                   englishCharacters: 'soutensokudo'                 },
      { name: '速射強化',           hiragana: 'そくしゃきょうか',                 englishCharacters: 'sokusyakyouka'                },
      { name: '属性やられ耐性',     hiragana: 'ぞくせいやられたいせい',           englishCharacters: 'zokuseiyararetaisei'          },
      // 'た行のスキル',
      { name: '体術',               hiragana: 'たいじゅつ',                       englishCharacters: 'taijutu'                      },
      { name: '耐震',               hiragana: 'たいしん',                         englishCharacters: 'taisin'                       },
      { name: '体力回復量UP',       hiragana: 'たいりょくかいふくりょうあっぷ',   englishcharacters: 'tairyokukaihukuryouappu'      },
      { name: '匠',                 hiragana: 'たくみ',                           englishCharacters: 'takumi'                       },
      { name: '達人芸',             hiragana: 'たつじんげい',                     englishCharacters: 'tatujingei'                   },
      { name: '弾丸節約',           hiragana: 'だんがんせつやく',                 englishCharacters: 'dangansetuyaku'               },
      { name: '弾導強化',           hiragana: 'だんどうきょうか',                 englishCharacters: 'dandoukyouka'                 },
      { name: '力の解放',           hiragana: 'ちからのかいほう',                 englishCharacters: 'tikaranokaihou'               },
      { name: '地質学',             hiragana: 'ちしつがく',                       englishCharacters: 'tisitugaku'                   },
      { name: '超会心',             hiragana: 'ちょうかいしん',                   englishCharacters: 'tyoukaisin'                   },
      { name: '挑戦者',             hiragana: 'ちょうせんしゃ',                   englishCharacters: 'tyousensya'                   },
      { name: '通常弾・連射矢強化', hiragana: 'つうじょうだんそくしゃやきょうか', englishCharacters: 'tuujoudansokusyayakyouka'     },
      { name: '泥雪耐性',           hiragana: 'でいせつたいせい',                 englishCharacters: 'deisetutaisei'                },
      { name: '砥石使用高速化',     hiragana: 'といししようこうそくか',           englishCharacters: 'toisisiyoukousokuka'          },
      { name: '特殊射撃強化',       hiragana: 'とくしゅしゃげききょうか',         englishCharacters: 'tokusyusyagekikyouka'         },
      { name: '毒属性強化',         hiragana: 'どくぞくせいきょうか',             englishCharacters: 'dokuzokuseikyouka'            },
      { name: '毒耐性',             hiragana: 'どくたいせい',                     englishCharacters: 'dokutaisei'                   },
      { name: '飛び込み',           hiragana: 'とびこみ',                         englishCharacters: 'tobikomi'                     },
      { name: '鈍器使い',           hiragana: 'どんきつかい',                     englishCharacters: 'donkitukai'                   },
      // 'な行のスキル',
      { name: '納刀術',             hiragana: 'のうとうじゅつ',                   englishCharacters: 'noutoujutu'                   },
      { name: '乗り名人',           hiragana: 'のりめいじん',                     englishCharacters: 'norimeijin'                   },
      // 'は行のスキル',
      { name: '破壊王',             hiragana: 'はかいおう',                       englishCharacters: 'hakaiou'                      },
      { name: '剥ぎ取り鉄人',       hiragana: 'はぎとりてつじん',                 englishCharacters: 'hagitoritetujin'              },
      { name: '剥ぎ取り名人',       hiragana: 'はぎとりめいじん',                 englishCharacters: 'hagitorimeijin'               },
      { name: '爆破属性強化',       hiragana: 'ばくはぞくせいきょうか',           englishCharacters: 'bakuhazokuseikyouka'          },
      { name: '爆破やられ耐性',     hiragana: 'ばくはやられたいせい',             englishCharacters: 'bakuhayararetaisei'           },
      { name: '抜刀術【力】',       hiragana: 'ばっとうじゅつちから',             englishCharacters: 'battoujututikara'             },
      { name: '抜刀術【技】',       hiragana: 'ばっとうじゅつわざ',               englishCharacters: 'battoujutuwaza'               },
      { name: '早食い',             hiragana: 'はやぐい',                         englishCharacters: 'hayagui'                      },
      { name: '腹減り耐性',         hiragana: 'はらへりたいせい',                 englishCharacters: 'haraheritaisei'               },
      { name: '反動軽減',           hiragana: 'はんどうけいげん',                 englishCharacters: 'handoukeigen'                 },
      { name: '火属性攻撃強化',     hiragana: 'ひぞくせいこうげききょうか',       englishCharacters: 'hizokuseikougekikyouka'       },
      { name: '火耐性',             hiragana: 'ひたいせい',                       englishCharacters: 'hitaisei'                     },
      { name: 'ひるみ軽減',         hiragana: 'ひるみけいげん',                   englishCharacters: 'hirumikeigen'                 },
      { name: '風圧耐性',           hiragana: 'ふうあつたいせい',                 englishCharacters: 'huuatutaisei'                 },
      { name: '風紋の一致',         hiragana: 'ふうもんのいっち',                 englishCharacters: 'huumonnoitti'                 },
      { name: '笛吹き名人',         hiragana: 'ふえふきめいじん',                 englishCharacters: 'huehukimeijin'                },
      { name: '不屈',               hiragana: 'ふくつ',                           englishCharacters: 'hukutu'                       },
      { name: 'フルチャージ',       hiragana: 'ふるちゃーじ',                     englishCharacters: 'hurutya-ji'                   },
      { name: 'ブレ抑制',           hiragana: 'ぶれよくせい',                     englishCharacters: 'bureyokusei'                  },
      { name: '壁面移動',           hiragana: 'へきめんいどう',                   englishCharacters: 'hekimenidou'                  },
      { name: '防御',               hiragana: 'ぼうぎょ',                         englishCharacters: 'bougyo'                       },
      { name: '砲術',               hiragana: 'ほうじゅつ',                       englishCharacters: 'houjutu'                      },
      { name: '砲弾装填',           hiragana: 'ほうだんそうてん',                 englishCharacters: 'houdansouten'                 },
      { name: '捕獲名人',           hiragana: 'ほかくめいじん',                   englishCharacters: 'hokakumeijin'                 },
      { name: 'ボマー',             hiragana: 'ぼまー',                           englishCharacters: 'boma-'                        },
      // 'ま行のスキル',
      { name: '麻痺属性強化',       hiragana: 'まひぞくせいきょうか',             englishCharacters: 'mahizokuseikyouka'            },
      { name: '麻痺耐性',           hiragana: 'まひたいせい',                     englishCharacters: 'mahitaisei'                   },
      { name: '満足感',             hiragana: 'まんぞくかん',                     englishCharacters: 'manzokukan'                   },
      { name: '見切り',             hiragana: 'みきり',                           englishCharacters: 'mikiri'                       },
      { name: '水属性攻撃強化',     hiragana: 'みずぞくせいこうげききょうか',     englishCharacters: 'mizuzokuseikougekikyouka'     },
      { name: '水耐性',             hiragana: 'みずたいせい',                     englishCharacters: 'mizutaisei'                   },
      { name: '耳栓',               hiragana: 'みみせん',                         englishCharacters: 'mimisen'                      },
      // 'や行のスキル',
      { name: '弓溜め段階解放',     hiragana: 'ゆみためだんかいかいほう',         englishCharacters: 'yumitamedankaikaihou'         },
      { name: '陽動',               hiragana: 'ようどう',                         englishCharacters: 'youdou'                       },
      // 'ら行のスキル',
      { name: '雷紋の一致',         hiragana: 'らいもんのいっち',                 englishCharacters: 'raimonnoitti'                 },
      { name: 'ランナー',           hiragana: 'らんなー',                         englishCharacters: 'ranna-'                       },
      { name: '龍属性攻撃強化',     hiragana: 'りゅうぞくせいこうげききょうか',   englishCharacters: 'ryuuzokuseikougekikyouka'     },
      { name: '龍耐性',             hiragana: 'りゅうたいせい',                   englishCharacters: 'ryuutaisei'                   },
      // 'わ行のスキル',
      { name: '業物',               hiragana: 'わざもの',                         englishCharacters: 'wazamono'                     },
    ];



    const getAllSkillNames = () => allSkillDetails.map(i => i.name);

    /* src/CharmTable.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1 } = globals;
    const file$6 = "src/CharmTable.svelte";

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (182:10) {:else}
    function create_else_block_1(ctx) {
    	let html_tag;

    	let raw_value = (/*col*/ ctx[25].renderValue
    	? /*col*/ ctx[25].renderValue(/*row*/ ctx[20])
    	: /*col*/ ctx[25].value(/*row*/ ctx[20])) + "";

    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1048576 && raw_value !== (raw_value = (/*col*/ ctx[25].renderValue
    			? /*col*/ ctx[25].renderValue(/*row*/ ctx[20])
    			: /*col*/ ctx[25].value(/*row*/ ctx[20])) + "")) html_tag.p(raw_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(182:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (176:10) {#if col.renderComponent}
    function create_if_block_4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		/*col*/ ctx[25].renderComponent.props || {},
    		{ row: /*row*/ ctx[20] },
    		{ col: /*col*/ ctx[25] }
    	];

    	var switch_value = /*col*/ ctx[25].renderComponent.component || /*col*/ ctx[25].renderComponent;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*columns, row*/ 1048704)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*columns*/ 128 && get_spread_object(/*col*/ ctx[25].renderComponent.props || {}),
    					dirty & /*row*/ 1048576 && { row: /*row*/ ctx[20] },
    					dirty & /*columns*/ 128 && { col: /*col*/ ctx[25] }
    				])
    			: {};

    			if (switch_value !== (switch_value = /*col*/ ctx[25].renderComponent.component || /*col*/ ctx[25].renderComponent)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(176:10) {#if col.renderComponent}",
    		ctx
    	});

    	return block;
    }

    // (172:6) {#each columns as col}
    function create_each_block_1$2(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_4, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*col*/ ctx[25].renderComponent) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[13](/*col*/ ctx[25], /*row*/ ctx[20], /*n*/ ctx[24], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			t = space();
    			attr_dev(td, "class", "" + (null_to_empty([/*col*/ ctx[25].class].join(" ")) + " svelte-1bydddo"));
    			add_location(td, file$6, 172, 8, 6683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			if_blocks[current_block_type_index].m(td, null);
    			append_dev(td, t);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(td, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(172:6) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (171:4) 
    function create_row_slot(ctx) {
    	let tr;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*columns*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[14](/*row*/ ctx[20]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(tr, "slot", "row");
    			add_location(tr, file$6, 170, 4, 6581);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(tr, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*columns, row*/ 1048704) {
    				each_value_1 = /*columns*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_row_slot.name,
    		type: "slot",
    		source: "(171:4) ",
    		ctx
    	});

    	return block;
    }

    // (189:6) {#if isSubstitutableCharmsShown[row.rowid]}
    function create_if_block_1$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$2, create_if_block_3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*row*/ ctx[20].substitutableCharms == null) return 0;
    		if (/*row*/ ctx[20].substitutableCharms.length === 0) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(189:6) {#if isSubstitutableCharmsShown[row.rowid]}",
    		ctx
    	});

    	return block;
    }

    // (194:8) {:else}
    function create_else_block$3(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let each_value = /*row*/ ctx[20].substitutableCharms;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "row-substitutes");
    			add_location(div, file$6, 194, 10, 7588);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1048576) {
    				each_value = /*row*/ ctx[20].substitutableCharms;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 150 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 150 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(194:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (192:55) 
    function create_if_block_3(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(192:55) ",
    		ctx
    	});

    	return block;
    }

    // (190:8) {#if row.substitutableCharms == null}
    function create_if_block_2$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "searching...";
    			set_style(div, "width", "100%");
    			set_style(div, "border-bottom", "solid 1px #ddd");
    			add_location(div, file$6, 190, 10, 7407);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(190:8) {#if row.substitutableCharms == null}",
    		ctx
    	});

    	return block;
    }

    // (196:10) {#each row.substitutableCharms as c}
    function create_each_block$3(ctx) {
    	let div;
    	let t0_value = /*c*/ ctx[21].rowid + "";
    	let t0;
    	let t1;
    	let t2_value = /*c*/ ctx[21].skill1 + "";
    	let t2;
    	let t3_value = /*c*/ ctx[21].skill1Level + "";
    	let t3;
    	let t4;
    	let t5_value = /*c*/ ctx[21].skill2 + "";
    	let t5;
    	let t6_value = /*c*/ ctx[21].skill2Level + "";
    	let t6;
    	let t7;
    	let t8_value = /*c*/ ctx[21].slot1 + "";
    	let t8;
    	let t9;
    	let t10_value = /*c*/ ctx[21].slot2 + "";
    	let t10;
    	let t11;
    	let t12_value = /*c*/ ctx[21].slot3 + "";
    	let t12;
    	let t13;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(": ");
    			t2 = text(t2_value);
    			t3 = text(t3_value);
    			t4 = text(", ");
    			t5 = text(t5_value);
    			t6 = text(t6_value);
    			t7 = text(", ");
    			t8 = text(t8_value);
    			t9 = text("-");
    			t10 = text(t10_value);
    			t11 = text("-");
    			t12 = text(t12_value);
    			t13 = space();
    			set_style(div, "width", "100%");
    			set_style(div, "text-align", "left");
    			set_style(div, "padding", "0.3rem 2rem");
    			add_location(div, file$6, 196, 12, 7712);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			append_dev(div, t7);
    			append_dev(div, t8);
    			append_dev(div, t9);
    			append_dev(div, t10);
    			append_dev(div, t11);
    			append_dev(div, t12);
    			append_dev(div, t13);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*row*/ 1048576 && t0_value !== (t0_value = /*c*/ ctx[21].rowid + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*row*/ 1048576 && t2_value !== (t2_value = /*c*/ ctx[21].skill1 + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*row*/ 1048576 && t3_value !== (t3_value = /*c*/ ctx[21].skill1Level + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*row*/ 1048576 && t5_value !== (t5_value = /*c*/ ctx[21].skill2 + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*row*/ 1048576 && t6_value !== (t6_value = /*c*/ ctx[21].skill2Level + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*row*/ 1048576 && t8_value !== (t8_value = /*c*/ ctx[21].slot1 + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*row*/ 1048576 && t10_value !== (t10_value = /*c*/ ctx[21].slot2 + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*row*/ 1048576 && t12_value !== (t12_value = /*c*/ ctx[21].slot3 + "")) set_data_dev(t12, t12_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(196:10) {#each row.substitutableCharms as c}",
    		ctx
    	});

    	return block;
    }

    // (205:6) {#if isScreenshotShown[row.rowid]}
    function create_if_block$3(ctx) {
    	let div;
    	let canvas;
    	let canvas_id_value;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			canvas = element("canvas");
    			attr_dev(canvas, "id", canvas_id_value = "charm-table-row-" + /*row*/ ctx[20].rowid + "-screenshot");
    			set_style(canvas, "width", "100%");
    			add_location(canvas, file$6, 206, 10, 8119);
    			set_style(div, "width", "100%");
    			set_style(div, "border-bottom", "solid 1px #ddd");
    			add_location(div, file$6, 205, 8, 8017);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, canvas);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*row*/ 1048576 && canvas_id_value !== (canvas_id_value = "charm-table-row-" + /*row*/ ctx[20].rowid + "-screenshot")) {
    				attr_dev(canvas, "id", canvas_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 100 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 100 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(205:6) {#if isScreenshotShown[row.rowid]}",
    		ctx
    	});

    	return block;
    }

    // (188:4) 
    function create_after_row_slot(ctx) {
    	let div;
    	let t;
    	let div_id_value;
    	let current;
    	let if_block0 = /*isSubstitutableCharmsShown*/ ctx[5][/*row*/ ctx[20].rowid] && create_if_block_1$2(ctx);
    	let if_block1 = /*isScreenshotShown*/ ctx[4][/*row*/ ctx[20].rowid] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "slot", "after-row");
    			attr_dev(div, "id", div_id_value = "charm-table-row-" + /*row*/ ctx[20].rowid);
    			set_style(div, "width", "100%");
    			add_location(div, file$6, 187, 4, 7217);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*isSubstitutableCharmsShown*/ ctx[5][/*row*/ ctx[20].rowid]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*isSubstitutableCharmsShown, row*/ 1048608) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*isScreenshotShown*/ ctx[4][/*row*/ ctx[20].rowid]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*isScreenshotShown, row*/ 1048592) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*row*/ 1048576 && div_id_value !== (div_id_value = "charm-table-row-" + /*row*/ ctx[20].rowid)) {
    				attr_dev(div, "id", div_id_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_after_row_slot.name,
    		type: "slot",
    		source: "(188:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let sveltetable;
    	let updating_sliceBegin;
    	let updating_sliceEnd;
    	let current;

    	function sveltetable_sliceBegin_binding(value) {
    		/*sveltetable_sliceBegin_binding*/ ctx[15](value);
    	}

    	function sveltetable_sliceEnd_binding(value) {
    		/*sveltetable_sliceEnd_binding*/ ctx[16](value);
    	}

    	let sveltetable_props = {
    		columns: /*columns*/ ctx[7],
    		rows: /*charms*/ ctx[3],
    		classNameTable: ["table table-striped table-hover table-responsible"],
    		classNameThead: ["table-dark hide-first-child.disabled"],
    		disableFilterHeader: /*disableFilterHeader*/ ctx[2],
    		$$slots: {
    			"after-row": [
    				create_after_row_slot,
    				({ row }) => ({ 20: row }),
    				({ row }) => row ? 1048576 : 0
    			],
    			row: [
    				create_row_slot,
    				({ n, row }) => ({ 24: n, 20: row }),
    				({ n, row }) => (n ? 16777216 : 0) | (row ? 1048576 : 0)
    			]
    		},
    		$$scope: { ctx }
    	};

    	if (/*sliceBegin*/ ctx[0] !== void 0) {
    		sveltetable_props.sliceBegin = /*sliceBegin*/ ctx[0];
    	}

    	if (/*sliceEnd*/ ctx[1] !== void 0) {
    		sveltetable_props.sliceEnd = /*sliceEnd*/ ctx[1];
    	}

    	sveltetable = new SvelteTable({ props: sveltetable_props, $$inline: true });
    	binding_callbacks.push(() => bind(sveltetable, "sliceBegin", sveltetable_sliceBegin_binding));
    	binding_callbacks.push(() => bind(sveltetable, "sliceEnd", sveltetable_sliceEnd_binding));
    	sveltetable.$on("clickCol", /*onSort*/ ctx[8]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(sveltetable.$$.fragment);
    			attr_dev(div, "class", "charm-table svelte-1bydddo");
    			attr_dev(div, "style", /*styleVars*/ ctx[6]);
    			add_location(div, file$6, 160, 0, 6136);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(sveltetable, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sveltetable_changes = {};
    			if (dirty & /*charms*/ 8) sveltetable_changes.rows = /*charms*/ ctx[3];
    			if (dirty & /*disableFilterHeader*/ 4) sveltetable_changes.disableFilterHeader = /*disableFilterHeader*/ ctx[2];

    			if (dirty & /*$$scope, row, isScreenshotShown, isSubstitutableCharmsShown*/ 269484080) {
    				sveltetable_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_sliceBegin && dirty & /*sliceBegin*/ 1) {
    				updating_sliceBegin = true;
    				sveltetable_changes.sliceBegin = /*sliceBegin*/ ctx[0];
    				add_flush_callback(() => updating_sliceBegin = false);
    			}

    			if (!updating_sliceEnd && dirty & /*sliceEnd*/ 2) {
    				updating_sliceEnd = true;
    				sveltetable_changes.sliceEnd = /*sliceEnd*/ ctx[1];
    				add_flush_callback(() => updating_sliceEnd = false);
    			}

    			sveltetable.$set(sveltetable_changes);

    			if (!current || dirty & /*styleVars*/ 64) {
    				attr_dev(div, "style", /*styleVars*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sveltetable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sveltetable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(sveltetable);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const N_CHARM_SLOT_MAX = 3;

    function instance$6($$self, $$props, $$invalidate) {
    	let styleVars;
    	let $charmManager;
    	validate_store(charmManager, "charmManager");
    	component_subscribe($$self, charmManager, $$value => $$invalidate(17, $charmManager = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharmTable", slots, []);
    	let { headerColor = "mediumseagreen" } = $$props;
    	let { disableFilterHeader = false } = $$props;
    	let { showImageColumn = true } = $$props;
    	let { showSubstitutesColumn = true } = $$props;
    	let { charms } = $$props;
    	let { sliceBegin } = $$props;
    	let { sliceEnd } = $$props;
    	const allSkills = getAllSkillNames();

    	const columns = [
    		{
    			key: "id",
    			title: "ID",
    			value: v => v.rowid,
    			sortable: true,
    			filterOptions: rows => {
    				const UNIT = 50;

    				// generate groupings of 1-50, 51-100, etc...
    				let nums = {};

    				rows.forEach(row => {
    					let num = Math.floor(row.rowid / UNIT);

    					if (nums[num] === undefined) nums[num] = {
    						name: `${num * UNIT + 1} 〜 ${(num + 1) * UNIT}`,
    						value: num
    					};
    				});

    				// fix order
    				nums = Object.entries(nums).sort().reduce((o, [k, v]) => (o[k] = v, o), {});

    				return Object.values(nums);
    			},
    			filterValue: v => Math.floor((v.rowid - 1) / 50)
    		},
    		{
    			key: "skill1",
    			title: "スキル1",
    			value: v => v.skill1,
    			filterOptions: allSkills,
    			sortable: true
    		},
    		{
    			key: "skill1Level",
    			title: "スキル1 Lv",
    			value: v => v.skill1Level,
    			filterOptions: [0, 1, 2, 3, 4, 5, 6, 7],
    			sortable: true
    		},
    		{
    			key: "skill2",
    			title: "スキル2",
    			value: v => v.skill2,
    			filterOptions: allSkills,
    			sortable: true
    		},
    		{
    			key: "skill2Level",
    			title: "スキル2 Lv",
    			value: v => v.skill2Level,
    			filterOptions: [0, 1, 2, 3, 4, 5, 6, 7],
    			sortable: true
    		},
    		...Array.from({ length: N_CHARM_SLOT_MAX }, (_, i) => i + 1).map(i => ({
    			key: `slot${i}`,
    			title: `スロット${i}`,
    			value: v => v[`slot${i}`],
    			renderValue: v => v[`slot${i}`] || "-",
    			sortable: true,
    			filterOptions: [0, 1, 2, 3]
    		})),
    		{
    			key: "evaluation",
    			title: "合計Lv",
    			value: v => v.evaluation || "-",
    			// filterOptions: rows => [...new Set(rows.map(i => i.evaluation))],
    			filterOptions: [...Array(21).keys()],
    			sortable: true
    		},
    		{
    			key: "image",
    			title: "画像",
    			value: v => v.imagename ? "有り" : "無し",
    			renderValue: v => v.imagename
    			? "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-camera-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z\"/> <path d=\"M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z\"/> </svg>"
    			: "",
    			sortable: true,
    			filterOptions: ["有り", "無し"],
    			onClick: toggleScreenshot
    		},
    		{
    			key: "substitutableCharms",
    			title: "代替",
    			value: v => (v.substitutableCharms?.length) ? "有り" : "無し",
    			renderValue: v => {
    				const question = "<span style=\"color: gray\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-question-square-fill\" viewBox=\"0 0 16 16\"> <path d=\"M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.496 6.033a.237.237 0 0 1-.24-.247C5.35 4.091 6.737 3.5 8.005 3.5c1.396 0 2.672.73 2.672 2.24 0 1.08-.635 1.594-1.244 2.057-.737.559-1.01.768-1.01 1.486v.105a.25.25 0 0 1-.25.25h-.81a.25.25 0 0 1-.25-.246l-.004-.217c-.038-.927.495-1.498 1.168-1.987.59-.444.965-.736.965-1.371 0-.825-.628-1.168-1.314-1.168-.803 0-1.253.478-1.342 1.134-.018.137-.128.25-.266.25h-.825zm2.325 6.443c-.584 0-1.009-.394-1.009-.927 0-.552.425-.94 1.01-.94.609 0 1.028.388 1.028.94 0 .533-.42.927-1.029.927z\"/> </svg> </span>";
    				const up = "<span style=\"color: mediumseagreen\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-arrow-up-square-fill\" viewBox=\"0 0 16 16\"> <path d=\"M2 16a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2zm6.5-4.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 1 0z\"/> </svg> </span>";

    				return v.substitutableCharms == null
    				? question
    				: v.substitutableCharms.length ? up : "";
    			},
    			sortable: true,
    			filterOptions: ["有り", "無し"]
    		}
    	].filter(i => {
    		switch (i.key) {
    			case "image":
    				return showImageColumn;
    			case "substitutableCharms":
    				return showSubstitutesColumn;
    			default:
    				return true;
    		}
    	});

    	// fields
    	let isScreenshotShown = [];

    	let isSubstitutableCharmsShown = [];

    	// handlers
    	function onSort() {
    		// close all accordion
    		$$invalidate(4, isScreenshotShown = []);

    		$$invalidate(5, isSubstitutableCharmsShown = []);
    	}

    	function onClickRow({ row }) {
    		const index = row.rowid;
    		$$invalidate(5, isSubstitutableCharmsShown[index] = !isSubstitutableCharmsShown[index], isSubstitutableCharmsShown);
    	}

    	async function toggleScreenshot({ e, row }) {
    		e.stopPropagation();
    		const index = row.rowid;
    		const toShow = !isScreenshotShown[index];
    		$$invalidate(4, isScreenshotShown[index] = toShow, isScreenshotShown);

    		if (toShow) {
    			// console.log(charms[index].imagename)
    			const screenshot = await $charmManager.getScreenshot(row.imagename);

    			// await new Promise((resolve) => requestAnimationFrame(resolve))
    			cv.imshow(`charm-table-row-${index}-screenshot`, screenshot);
    		}
    	}

    	const writable_props = [
    		"headerColor",
    		"disableFilterHeader",
    		"showImageColumn",
    		"showSubstitutesColumn",
    		"charms",
    		"sliceBegin",
    		"sliceEnd"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CharmTable> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (col, row, n, e) => {
    		if (col.onClick) {
    			col.onClick({ e, row, col, index: n });
    		}
    	};

    	const click_handler_1 = row => onClickRow({ row });

    	function sveltetable_sliceBegin_binding(value) {
    		sliceBegin = value;
    		$$invalidate(0, sliceBegin);
    	}

    	function sveltetable_sliceEnd_binding(value) {
    		sliceEnd = value;
    		$$invalidate(1, sliceEnd);
    	}

    	$$self.$$set = $$props => {
    		if ("headerColor" in $$props) $$invalidate(10, headerColor = $$props.headerColor);
    		if ("disableFilterHeader" in $$props) $$invalidate(2, disableFilterHeader = $$props.disableFilterHeader);
    		if ("showImageColumn" in $$props) $$invalidate(11, showImageColumn = $$props.showImageColumn);
    		if ("showSubstitutesColumn" in $$props) $$invalidate(12, showSubstitutesColumn = $$props.showSubstitutesColumn);
    		if ("charms" in $$props) $$invalidate(3, charms = $$props.charms);
    		if ("sliceBegin" in $$props) $$invalidate(0, sliceBegin = $$props.sliceBegin);
    		if ("sliceEnd" in $$props) $$invalidate(1, sliceEnd = $$props.sliceEnd);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		SvelteTable,
    		getAllSkillNames,
    		charmManager,
    		headerColor,
    		disableFilterHeader,
    		showImageColumn,
    		showSubstitutesColumn,
    		charms,
    		sliceBegin,
    		sliceEnd,
    		N_CHARM_SLOT_MAX,
    		allSkills,
    		columns,
    		isScreenshotShown,
    		isSubstitutableCharmsShown,
    		onSort,
    		onClickRow,
    		toggleScreenshot,
    		$charmManager,
    		styleVars
    	});

    	$$self.$inject_state = $$props => {
    		if ("headerColor" in $$props) $$invalidate(10, headerColor = $$props.headerColor);
    		if ("disableFilterHeader" in $$props) $$invalidate(2, disableFilterHeader = $$props.disableFilterHeader);
    		if ("showImageColumn" in $$props) $$invalidate(11, showImageColumn = $$props.showImageColumn);
    		if ("showSubstitutesColumn" in $$props) $$invalidate(12, showSubstitutesColumn = $$props.showSubstitutesColumn);
    		if ("charms" in $$props) $$invalidate(3, charms = $$props.charms);
    		if ("sliceBegin" in $$props) $$invalidate(0, sliceBegin = $$props.sliceBegin);
    		if ("sliceEnd" in $$props) $$invalidate(1, sliceEnd = $$props.sliceEnd);
    		if ("isScreenshotShown" in $$props) $$invalidate(4, isScreenshotShown = $$props.isScreenshotShown);
    		if ("isSubstitutableCharmsShown" in $$props) $$invalidate(5, isSubstitutableCharmsShown = $$props.isSubstitutableCharmsShown);
    		if ("styleVars" in $$props) $$invalidate(6, styleVars = $$props.styleVars);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*headerColor, showImageColumn, showSubstitutesColumn*/ 7168) {
    			$$invalidate(6, styleVars = Object.entries({
    				"header-background-color": headerColor,
    				"table-width": `${61 + (showImageColumn ? 3 : 0) + (showSubstitutesColumn ? 3 : 0)}rem`
    			}).map(([k, v]) => `--${k}:${v}`).join(";"));
    		}
    	};

    	return [
    		sliceBegin,
    		sliceEnd,
    		disableFilterHeader,
    		charms,
    		isScreenshotShown,
    		isSubstitutableCharmsShown,
    		styleVars,
    		columns,
    		onSort,
    		onClickRow,
    		headerColor,
    		showImageColumn,
    		showSubstitutesColumn,
    		click_handler,
    		click_handler_1,
    		sveltetable_sliceBegin_binding,
    		sveltetable_sliceEnd_binding
    	];
    }

    class CharmTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			headerColor: 10,
    			disableFilterHeader: 2,
    			showImageColumn: 11,
    			showSubstitutesColumn: 12,
    			charms: 3,
    			sliceBegin: 0,
    			sliceEnd: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmTable",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*charms*/ ctx[3] === undefined && !("charms" in props)) {
    			console.warn("<CharmTable> was created without expected prop 'charms'");
    		}

    		if (/*sliceBegin*/ ctx[0] === undefined && !("sliceBegin" in props)) {
    			console.warn("<CharmTable> was created without expected prop 'sliceBegin'");
    		}

    		if (/*sliceEnd*/ ctx[1] === undefined && !("sliceEnd" in props)) {
    			console.warn("<CharmTable> was created without expected prop 'sliceEnd'");
    		}
    	}

    	get headerColor() {
    		throw new Error("<CharmTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set headerColor(value) {
    		throw new Error("<CharmTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disableFilterHeader() {
    		throw new Error("<CharmTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disableFilterHeader(value) {
    		throw new Error("<CharmTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showImageColumn() {
    		throw new Error("<CharmTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showImageColumn(value) {
    		throw new Error("<CharmTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showSubstitutesColumn() {
    		throw new Error("<CharmTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showSubstitutesColumn(value) {
    		throw new Error("<CharmTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charms() {
    		throw new Error("<CharmTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charms(value) {
    		throw new Error("<CharmTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sliceBegin() {
    		throw new Error("<CharmTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sliceBegin(value) {
    		throw new Error("<CharmTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sliceEnd() {
    		throw new Error("<CharmTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sliceEnd(value) {
    		throw new Error("<CharmTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CharmSearcher.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/CharmSearcher.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[26] = list;
    	child_ctx[27] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[28] = list;
    	child_ctx[29] = i;
    	return child_ctx;
    }

    // (126:8) {#each [...Array(skillFilters.filter(i => i).length + 1).keys()] as i}
    function create_each_block_2$1(ctx) {
    	let div;
    	let autocomplete0;
    	let updating_selectedItem;
    	let t0;
    	let autocomplete1;
    	let updating_selectedItem_1;
    	let t1;
    	let current;

    	function autocomplete0_selectedItem_binding(value) {
    		/*autocomplete0_selectedItem_binding*/ ctx[13](value, /*i*/ ctx[23]);
    	}

    	let autocomplete0_props = {
    		items: allSkillDetails,
    		inputId: "input-skill-" + /*i*/ ctx[23],
    		labelFieldName: "name",
    		valueFieldName: "name",
    		keywordsFunction: func_1,
    		placeholder: "スキル" + (/*i*/ ctx[23] + 1),
    		showClear: true,
    		hideArrow: true,
    		className: "autocomplete-skill"
    	};

    	if (/*skillFilters*/ ctx[0][/*i*/ ctx[23]] !== void 0) {
    		autocomplete0_props.selectedItem = /*skillFilters*/ ctx[0][/*i*/ ctx[23]];
    	}

    	autocomplete0 = new SimpleAutocomplete({
    			props: autocomplete0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete0, "selectedItem", autocomplete0_selectedItem_binding));

    	function autocomplete1_selectedItem_binding(value) {
    		/*autocomplete1_selectedItem_binding*/ ctx[14](value, /*i*/ ctx[23]);
    	}

    	let autocomplete1_props = {
    		items: /*SKILL_LEVEL_LIST*/ ctx[11],
    		inputId: "input-skill-level-" + /*i*/ ctx[23],
    		placeholder: "Lv",
    		hideArrow: true,
    		className: "autocomplete-skill-level"
    	};

    	if (/*skillLevelFilters*/ ctx[1][/*i*/ ctx[23]] !== void 0) {
    		autocomplete1_props.selectedItem = /*skillLevelFilters*/ ctx[1][/*i*/ ctx[23]];
    	}

    	autocomplete1 = new SimpleAutocomplete({
    			props: autocomplete1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete1, "selectedItem", autocomplete1_selectedItem_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(autocomplete0.$$.fragment);
    			t0 = space();
    			create_component(autocomplete1.$$.fragment);
    			t1 = space();
    			add_location(div, file$5, 126, 10, 3427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(autocomplete0, div, null);
    			append_dev(div, t0);
    			mount_component(autocomplete1, div, null);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const autocomplete0_changes = {};
    			if (dirty & /*skillFilters*/ 1) autocomplete0_changes.inputId = "input-skill-" + /*i*/ ctx[23];
    			if (dirty & /*skillFilters*/ 1) autocomplete0_changes.placeholder = "スキル" + (/*i*/ ctx[23] + 1);

    			if (!updating_selectedItem && dirty & /*skillFilters, Array*/ 1) {
    				updating_selectedItem = true;
    				autocomplete0_changes.selectedItem = /*skillFilters*/ ctx[0][/*i*/ ctx[23]];
    				add_flush_callback(() => updating_selectedItem = false);
    			}

    			autocomplete0.$set(autocomplete0_changes);
    			const autocomplete1_changes = {};
    			if (dirty & /*skillFilters*/ 1) autocomplete1_changes.inputId = "input-skill-level-" + /*i*/ ctx[23];

    			if (!updating_selectedItem_1 && dirty & /*skillLevelFilters, Array, skillFilters*/ 3) {
    				updating_selectedItem_1 = true;
    				autocomplete1_changes.selectedItem = /*skillLevelFilters*/ ctx[1][/*i*/ ctx[23]];
    				add_flush_callback(() => updating_selectedItem_1 = false);
    			}

    			autocomplete1.$set(autocomplete1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(autocomplete0.$$.fragment, local);
    			transition_in(autocomplete1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(autocomplete0.$$.fragment, local);
    			transition_out(autocomplete1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(autocomplete0);
    			destroy_component(autocomplete1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(126:8) {#each [...Array(skillFilters.filter(i => i).length + 1).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    // (151:8) {#each [...Array(MAX_SLOTS).keys()] as i}
    function create_each_block_1$1(ctx) {
    	let autocomplete;
    	let updating_selectedItem;
    	let t;
    	let current;

    	function autocomplete_selectedItem_binding(value) {
    		/*autocomplete_selectedItem_binding*/ ctx[15](value, /*i*/ ctx[23]);
    	}

    	let autocomplete_props = {
    		items: [...Array(3).keys()].map(func_2),
    		placeholder: "スロット" + (/*i*/ ctx[23] + 1),
    		inputId: "input-slot-" + /*i*/ ctx[23],
    		showClear: true,
    		hideArrow: true,
    		className: "autocomplete-slot-level"
    	};

    	if (/*slots*/ ctx[2][/*i*/ ctx[23]] !== void 0) {
    		autocomplete_props.selectedItem = /*slots*/ ctx[2][/*i*/ ctx[23]];
    	}

    	autocomplete = new SimpleAutocomplete({
    			props: autocomplete_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(autocomplete, "selectedItem", autocomplete_selectedItem_binding));

    	const block = {
    		c: function create() {
    			create_component(autocomplete.$$.fragment);
    			t = text(" ");
    		},
    		m: function mount(target, anchor) {
    			mount_component(autocomplete, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const autocomplete_changes = {};

    			if (!updating_selectedItem && dirty & /*slots, Array, MAX_SLOTS*/ 4) {
    				updating_selectedItem = true;
    				autocomplete_changes.selectedItem = /*slots*/ ctx[2][/*i*/ ctx[23]];
    				add_flush_callback(() => updating_selectedItem = false);
    			}

    			autocomplete.$set(autocomplete_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(autocomplete.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(autocomplete.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(autocomplete, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(151:8) {#each [...Array(MAX_SLOTS).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    // (186:6) {:else}
    function create_else_block$2(ctx) {
    	let t0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t5;
    	let charmtable;
    	let updating_charms;
    	let updating_sliceBegin;
    	let updating_sliceEnd;
    	let t6;
    	let div;
    	let ul;
    	let li0;
    	let span1;
    	let span0;
    	let li0_class_value;
    	let t8;
    	let t9;
    	let li1;
    	let span3;
    	let span2;
    	let li1_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	function charmtable_charms_binding(value) {
    		/*charmtable_charms_binding*/ ctx[17](value);
    	}

    	function charmtable_sliceBegin_binding(value) {
    		/*charmtable_sliceBegin_binding*/ ctx[18](value);
    	}

    	function charmtable_sliceEnd_binding(value) {
    		/*charmtable_sliceEnd_binding*/ ctx[19](value);
    	}

    	let charmtable_props = {
    		disableFilterHeader: true,
    		headerColor: "dodgerblue"
    	};

    	if (/*searchResultsToShow*/ ctx[8] !== void 0) {
    		charmtable_props.charms = /*searchResultsToShow*/ ctx[8];
    	}

    	if (/*sliceBegin*/ ctx[9] !== void 0) {
    		charmtable_props.sliceBegin = /*sliceBegin*/ ctx[9];
    	}

    	if (/*sliceEnd*/ ctx[10] !== void 0) {
    		charmtable_props.sliceEnd = /*sliceEnd*/ ctx[10];
    	}

    	charmtable = new CharmTable({ props: charmtable_props, $$inline: true });
    	binding_callbacks.push(() => bind(charmtable, "charms", charmtable_charms_binding));
    	binding_callbacks.push(() => bind(charmtable, "sliceBegin", charmtable_sliceBegin_binding));
    	binding_callbacks.push(() => bind(charmtable, "sliceEnd", charmtable_sliceEnd_binding));
    	let each_value = [...Array(/*nPages*/ ctx[6]).keys()];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			t0 = text("show\n        ");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "10";
    			option1 = element("option");
    			option1.textContent = "25";
    			option2 = element("option");
    			option2.textContent = "50";
    			option3 = element("option");
    			option3.textContent = "100";
    			t5 = text("\n        charms\n        ");
    			create_component(charmtable.$$.fragment);
    			t6 = space();
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "«";
    			t8 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			li1 = element("li");
    			span3 = element("span");
    			span2 = element("span");
    			span2.textContent = "»";
    			option0.__value = "10";
    			option0.value = option0.__value;
    			add_location(option0, file$5, 188, 10, 5764);
    			option1.__value = "25";
    			option1.value = option1.__value;
    			add_location(option1, file$5, 189, 10, 5794);
    			option2.__value = "50";
    			option2.value = option2.__value;
    			add_location(option2, file$5, 190, 10, 5824);
    			option3.__value = "100";
    			option3.value = option3.__value;
    			add_location(option3, file$5, 191, 10, 5854);
    			if (/*itemsPerPage*/ ctx[5] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[16].call(select));
    			add_location(select, file$5, 187, 8, 5719);
    			attr_dev(span0, "aria-hidden", "true");
    			add_location(span0, file$5, 204, 16, 6407);
    			attr_dev(span1, "class", "page-link");
    			add_location(span1, file$5, 203, 14, 6335);
    			attr_dev(li0, "class", li0_class_value = "page-item " + (/*currentPage*/ ctx[4] === 0 ? "disabled" : ""));
    			attr_dev(li0, "aria-label", "Previous");
    			add_location(li0, file$5, 202, 12, 6238);
    			attr_dev(span2, "aria-hidden", "true");
    			add_location(span2, file$5, 214, 16, 6927);
    			attr_dev(span3, "class", "page-link");
    			add_location(span3, file$5, 213, 14, 6855);

    			attr_dev(li1, "class", li1_class_value = "page-item " + (/*currentPage*/ ctx[4] === /*nPages*/ ctx[6] - 1
    			? "disabled"
    			: ""));

    			attr_dev(li1, "aria-label", "Next");
    			add_location(li1, file$5, 212, 12, 6751);
    			attr_dev(ul, "class", "pagination svelte-5c44pb");
    			add_location(ul, file$5, 201, 10, 6202);
    			attr_dev(div, "id", "charm-search-result-pager");
    			attr_dev(div, "class", "svelte-5c44pb");
    			add_location(div, file$5, 200, 8, 6155);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, select, anchor);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(select, option3);
    			select_option(select, /*itemsPerPage*/ ctx[5]);
    			insert_dev(target, t5, anchor);
    			mount_component(charmtable, target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, span1);
    			append_dev(span1, span0);
    			append_dev(ul, t8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(ul, t9);
    			append_dev(ul, li1);
    			append_dev(li1, span3);
    			append_dev(span3, span2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[16]),
    					listen_dev(span1, "click", /*click_handler*/ ctx[20], false, false, false),
    					listen_dev(span3, "click", /*click_handler_2*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*itemsPerPage*/ 32) {
    				select_option(select, /*itemsPerPage*/ ctx[5]);
    			}

    			const charmtable_changes = {};

    			if (!updating_charms && dirty & /*searchResultsToShow*/ 256) {
    				updating_charms = true;
    				charmtable_changes.charms = /*searchResultsToShow*/ ctx[8];
    				add_flush_callback(() => updating_charms = false);
    			}

    			if (!updating_sliceBegin && dirty & /*sliceBegin*/ 512) {
    				updating_sliceBegin = true;
    				charmtable_changes.sliceBegin = /*sliceBegin*/ ctx[9];
    				add_flush_callback(() => updating_sliceBegin = false);
    			}

    			if (!updating_sliceEnd && dirty & /*sliceEnd*/ 1024) {
    				updating_sliceEnd = true;
    				charmtable_changes.sliceEnd = /*sliceEnd*/ ctx[10];
    				add_flush_callback(() => updating_sliceEnd = false);
    			}

    			charmtable.$set(charmtable_changes);

    			if (!current || dirty & /*currentPage*/ 16 && li0_class_value !== (li0_class_value = "page-item " + (/*currentPage*/ ctx[4] === 0 ? "disabled" : ""))) {
    				attr_dev(li0, "class", li0_class_value);
    			}

    			if (dirty & /*Array, nPages, currentPage*/ 80) {
    				each_value = [...Array(/*nPages*/ ctx[6]).keys()];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, t9);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*currentPage, nPages*/ 80 && li1_class_value !== (li1_class_value = "page-item " + (/*currentPage*/ ctx[4] === /*nPages*/ ctx[6] - 1
    			? "disabled"
    			: ""))) {
    				attr_dev(li1, "class", li1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(charmtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(charmtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(select);
    			if (detaching) detach_dev(t5);
    			destroy_component(charmtable, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(186:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (184:43) 
    function create_if_block_2$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "not found";
    			set_style(div, "text-align", "center");
    			add_location(div, file$5, 184, 8, 5636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(184:43) ",
    		ctx
    	});

    	return block;
    }

    // (182:38) 
    function create_if_block_1$1(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(182:38) ",
    		ctx
    	});

    	return block;
    }

    // (180:6) {#if isSpinnerShown}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "spinner-border text-info");
    			attr_dev(div, "role", "status");
    			add_location(div, file$5, 180, 8, 5463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(180:6) {#if isSpinnerShown}",
    		ctx
    	});

    	return block;
    }

    // (208:12) {#each [...Array(nPages).keys()] as i}
    function create_each_block$2(ctx) {
    	let li;
    	let span;
    	let t_value = /*i*/ ctx[23] + 1 + "";
    	let t;
    	let li_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[21](/*i*/ ctx[23]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "page-link");
    			add_location(span, file$5, 209, 16, 6627);
    			attr_dev(li, "class", li_class_value = "page-item " + (/*i*/ ctx[23] === /*currentPage*/ ctx[4] ? "active" : ""));
    			add_location(li, file$5, 208, 14, 6552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, span);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*nPages*/ 64 && t_value !== (t_value = /*i*/ ctx[23] + 1 + "")) set_data_dev(t, t_value);

    			if (dirty & /*nPages, currentPage*/ 80 && li_class_value !== (li_class_value = "page-item " + (/*i*/ ctx[23] === /*currentPage*/ ctx[4] ? "active" : ""))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(208:12) {#each [...Array(nPages).keys()] as i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div5;
    	let div4;
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let br;
    	let t3;
    	let t4;
    	let hr;
    	let t5;
    	let div3;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_2 = [...Array(/*skillFilters*/ ctx[0].filter(func).length + 1).keys()];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value_1 = [...Array(MAX_SLOTS).keys()];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const if_block_creators = [create_if_block$2, create_if_block_1$1, create_if_block_2$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isSpinnerShown*/ ctx[7]) return 0;
    		if (/*searchResults*/ ctx[3] == null) return 1;
    		if (/*searchResults*/ ctx[3].length === 0) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("スキル:\n        ");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div1 = element("div");
    			t2 = text("スロット:");
    			br = element("br");
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			hr = element("hr");
    			t5 = space();
    			div3 = element("div");
    			if_block.c();
    			attr_dev(div0, "id", "skills");
    			attr_dev(div0, "class", "svelte-5c44pb");
    			add_location(div0, file$5, 123, 6, 3307);
    			add_location(br, file$5, 149, 13, 4428);
    			attr_dev(div1, "id", "slots");
    			attr_dev(div1, "class", "svelte-5c44pb");
    			add_location(div1, file$5, 148, 6, 4398);
    			attr_dev(div2, "id", "charm-search-form");
    			attr_dev(div2, "class", "svelte-5c44pb");
    			add_location(div2, file$5, 122, 4, 3272);
    			attr_dev(hr, "class", "svelte-5c44pb");
    			add_location(hr, file$5, 176, 4, 5387);
    			attr_dev(div3, "id", "charm-search-result");
    			attr_dev(div3, "class", "svelte-5c44pb");
    			add_location(div3, file$5, 178, 4, 5397);
    			attr_dev(div4, "id", "charm-searcher");
    			attr_dev(div4, "class", "svelte-5c44pb");
    			add_location(div4, file$5, 120, 2, 3215);
    			attr_dev(div5, "class", "tab-content svelte-5c44pb");
    			add_location(div5, file$5, 119, 0, 3187);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, br);
    			append_dev(div1, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div4, t4);
    			append_dev(div4, hr);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			if_blocks[current_block_type_index].m(div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", handleKeydown, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*SKILL_LEVEL_LIST, Array, skillFilters, skillLevelFilters, allSkillDetails*/ 2051) {
    				each_value_2 = [...Array(/*skillFilters*/ ctx[0].filter(func).length + 1).keys()];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_2$1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*Array, MAX_SLOTS, slots*/ 4) {
    				each_value_1 = [...Array(MAX_SLOTS).keys()];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div3, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const MAX_SKILL_LEVEL = 7;
    const MAX_SLOTS = 3;

    function handleKeydown(event) {
    	if (event.keyCode === 27) {
    		// escape
    		document.body.click();

    		return;
    	}

    	if (!(event.ctrlKey && event.metaKey || event.ctrlKey && event.altKey)) {
    		return;
    	}

    	let prefix;

    	if (event.key === "k") {
    		prefix = "input-skill-";
    	} else if (event.key === "l") {
    		prefix = "input-skill-level-";
    	} else if (event.key === "t") {
    		prefix = "input-slot-";
    	} else {
    		return;
    	}

    	const focusedId = document.activeElement.id;

    	if (focusedId.startsWith(prefix)) {
    		const currentSuffix = parseInt(focusedId.replace(prefix, ""));
    		const nextFocus = document.getElementById(`${prefix}${currentSuffix + 1}`) || document.getElementById(`${prefix}0`);
    		document.body.click();
    		nextFocus.focus();
    	} else {
    		const nextFocus = document.getElementById(`${prefix}0`);
    		document.body.click();
    		nextFocus.focus();
    	}
    }

    const func = i => i;
    const func_1 = s => `${s.name} ${s.hiragana} ${s.englishCharacters}`;
    const func_2 = i => i + 1;

    function instance$5($$self, $$props, $$invalidate) {
    	let nPages;
    	let searchResultsToShow;
    	let sliceBegin;
    	let sliceEnd;
    	let $charmManager;
    	validate_store(charmManager, "charmManager");
    	component_subscribe($$self, charmManager, $$value => $$invalidate(12, $charmManager = $$value));
    	let { $$slots: slots$1 = {}, $$scope } = $$props;
    	validate_slots("CharmSearcher", slots$1, []);
    	const SKILL_LEVEL_LIST = [...Array(MAX_SKILL_LEVEL).keys()].map(i => i + 1);
    	let skillFilters = [];
    	let skillLevelFilters = [];
    	let slots = [];
    	let isSpinnerShown = false;
    	let searchResults = null;

    	// table pagination
    	let currentPage = 0, itemsPerPage = 10;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CharmSearcher> was created with unknown prop '${key}'`);
    	});

    	function autocomplete0_selectedItem_binding(value, i) {
    		if ($$self.$$.not_equal(skillFilters[i], value)) {
    			skillFilters[i] = value;
    			$$invalidate(0, skillFilters);
    		}
    	}

    	function autocomplete1_selectedItem_binding(value, i) {
    		if ($$self.$$.not_equal(skillLevelFilters[i], value)) {
    			skillLevelFilters[i] = value;
    			($$invalidate(1, skillLevelFilters), $$invalidate(0, skillFilters));
    		}
    	}

    	function autocomplete_selectedItem_binding(value, i) {
    		if ($$self.$$.not_equal(slots[i], value)) {
    			slots[i] = value;
    			((($$invalidate(2, slots), $$invalidate(0, skillFilters)), $$invalidate(1, skillLevelFilters)), $$invalidate(12, $charmManager));
    		}
    	}

    	function select_change_handler() {
    		itemsPerPage = select_value(this);
    		$$invalidate(5, itemsPerPage);
    	}

    	function charmtable_charms_binding(value) {
    		searchResultsToShow = value;
    		((((($$invalidate(8, searchResultsToShow), $$invalidate(3, searchResults)), $$invalidate(2, slots)), $$invalidate(0, skillFilters)), $$invalidate(1, skillLevelFilters)), $$invalidate(12, $charmManager));
    	}

    	function charmtable_sliceBegin_binding(value) {
    		sliceBegin = value;
    		(((((((($$invalidate(9, sliceBegin), $$invalidate(5, itemsPerPage)), $$invalidate(4, currentPage)), $$invalidate(3, searchResults)), $$invalidate(6, nPages)), $$invalidate(2, slots)), $$invalidate(0, skillFilters)), $$invalidate(1, skillLevelFilters)), $$invalidate(12, $charmManager));
    	}

    	function charmtable_sliceEnd_binding(value) {
    		sliceEnd = value;
    		(((((((($$invalidate(10, sliceEnd), $$invalidate(5, itemsPerPage)), $$invalidate(4, currentPage)), $$invalidate(3, searchResults)), $$invalidate(6, nPages)), $$invalidate(2, slots)), $$invalidate(0, skillFilters)), $$invalidate(1, skillLevelFilters)), $$invalidate(12, $charmManager));
    	}

    	const click_handler = () => $$invalidate(4, currentPage--, currentPage);
    	const click_handler_1 = i => $$invalidate(4, currentPage = i);
    	const click_handler_2 = () => $$invalidate(4, currentPage++, currentPage);

    	$$self.$capture_state = () => ({
    		AutoComplete: SimpleAutocomplete,
    		CharmTable,
    		allSkillDetails,
    		charmManager,
    		MAX_SKILL_LEVEL,
    		SKILL_LEVEL_LIST,
    		MAX_SLOTS,
    		skillFilters,
    		skillLevelFilters,
    		slots,
    		isSpinnerShown,
    		searchResults,
    		currentPage,
    		itemsPerPage,
    		handleKeydown,
    		nPages,
    		searchResultsToShow,
    		sliceBegin,
    		sliceEnd,
    		$charmManager
    	});

    	$$self.$inject_state = $$props => {
    		if ("skillFilters" in $$props) $$invalidate(0, skillFilters = $$props.skillFilters);
    		if ("skillLevelFilters" in $$props) $$invalidate(1, skillLevelFilters = $$props.skillLevelFilters);
    		if ("slots" in $$props) $$invalidate(2, slots = $$props.slots);
    		if ("isSpinnerShown" in $$props) $$invalidate(7, isSpinnerShown = $$props.isSpinnerShown);
    		if ("searchResults" in $$props) $$invalidate(3, searchResults = $$props.searchResults);
    		if ("currentPage" in $$props) $$invalidate(4, currentPage = $$props.currentPage);
    		if ("itemsPerPage" in $$props) $$invalidate(5, itemsPerPage = $$props.itemsPerPage);
    		if ("nPages" in $$props) $$invalidate(6, nPages = $$props.nPages);
    		if ("searchResultsToShow" in $$props) $$invalidate(8, searchResultsToShow = $$props.searchResultsToShow);
    		if ("sliceBegin" in $$props) $$invalidate(9, sliceBegin = $$props.sliceBegin);
    		if ("sliceEnd" in $$props) $$invalidate(10, sliceEnd = $$props.sliceEnd);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*skillFilters, skillLevelFilters*/ 3) {
    			// form update (skill)
    			{
    				for (const i in skillFilters) {
    					if (skillFilters[i] && skillLevelFilters[i] == null) {
    						$$invalidate(1, skillLevelFilters[i] = 1, skillLevelFilters);
    					}

    					if (skillFilters[i] == null) {
    						skillFilters.splice(i, 1);
    						skillLevelFilters.splice(i, 1);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*slots, skillFilters, skillLevelFilters, $charmManager*/ 4103) {
    			{
    				$$invalidate(7, isSpinnerShown = true);
    				$$invalidate(2, slots = slots.filter(i => i));

    				const base = JSON.stringify({
    					skills: skillFilters.map(i => i.name),
    					skillLevels: skillLevelFilters,
    					slots
    				});

    				const search = () => {
    					if (!skillFilters.length && !skillLevelFilters.length && !slots.length) {
    						$$invalidate(3, searchResults = null);
    						return;
    					}

    					if (typeof Module.getSubstitutesAll !== "function") {
    						setTimeout(search, 100);
    						return;
    					}

    					const matchIds = Module.getSubstitutes(
    						JSON.stringify($charmManager.charms.map(i => {
    							const { substitutableCharms, imagename, evaluation, ...rest } = i;
    							return rest;
    						})),
    						base
    					);

    					$$invalidate(3, searchResults = JSON.parse(matchIds).map(id => $charmManager.charms.find(i => i.rowid === id)));
    				};

    				search();
    				$$invalidate(7, isSpinnerShown = false);
    			}
    		}

    		if ($$self.$$.dirty & /*searchResults, itemsPerPage*/ 40) {
    			$$invalidate(6, nPages = Math.ceil((searchResults || []).length / itemsPerPage));
    		}

    		if ($$self.$$.dirty & /*searchResults, nPages*/ 72) {
    			{
    				if (searchResults && nPages) {
    					$$invalidate(4, currentPage = 0);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*searchResults*/ 8) {
    			$$invalidate(8, searchResultsToShow = searchResults); //?.slice(itemsPerPage * currentPage, itemsPerPage * (currentPage+1))
    		}

    		if ($$self.$$.dirty & /*itemsPerPage, currentPage*/ 48) {
    			$$invalidate(9, sliceBegin = itemsPerPage * currentPage);
    		}

    		if ($$self.$$.dirty & /*itemsPerPage, currentPage*/ 48) {
    			$$invalidate(10, sliceEnd = itemsPerPage * (currentPage + 1));
    		}

    		if ($$self.$$.dirty & /*slots*/ 4) {
    			// form update (slot)
    			$$invalidate(2, slots = slots.sort((a, b) => b - a));
    		}
    	};

    	return [
    		skillFilters,
    		skillLevelFilters,
    		slots,
    		searchResults,
    		currentPage,
    		itemsPerPage,
    		nPages,
    		isSpinnerShown,
    		searchResultsToShow,
    		sliceBegin,
    		sliceEnd,
    		SKILL_LEVEL_LIST,
    		$charmManager,
    		autocomplete0_selectedItem_binding,
    		autocomplete1_selectedItem_binding,
    		autocomplete_selectedItem_binding,
    		select_change_handler,
    		charmtable_charms_binding,
    		charmtable_sliceBegin_binding,
    		charmtable_sliceEnd_binding,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class CharmSearcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmSearcher",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/CharmList.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/CharmList.svelte";

    // (21:4) {:else}
    function create_else_block$1(ctx) {
    	let charmtable;
    	let updating_charms;
    	let current;

    	function charmtable_charms_binding(value) {
    		/*charmtable_charms_binding*/ ctx[1](value);
    	}

    	let charmtable_props = {};

    	if (/*charms*/ ctx[0] !== void 0) {
    		charmtable_props.charms = /*charms*/ ctx[0];
    	}

    	charmtable = new CharmTable({ props: charmtable_props, $$inline: true });
    	binding_callbacks.push(() => bind(charmtable, "charms", charmtable_charms_binding));

    	const block = {
    		c: function create() {
    			create_component(charmtable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(charmtable, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const charmtable_changes = {};

    			if (!updating_charms && dirty & /*charms*/ 1) {
    				updating_charms = true;
    				charmtable_changes.charms = /*charms*/ ctx[0];
    				add_flush_callback(() => updating_charms = false);
    			}

    			charmtable.$set(charmtable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(charmtable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(charmtable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(charmtable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(21:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (17:4) {#if charms == null}
    function create_if_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "spinner-border text-info svelte-2qpa7f");
    			attr_dev(div, "role", "status");
    			add_location(div, file$4, 17, 6, 389);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(17:4) {#if charms == null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*charms*/ ctx[0] == null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block.c();
    			attr_dev(div0, "id", "charm-list");
    			attr_dev(div0, "class", "svelte-2qpa7f");
    			add_location(div0, file$4, 15, 2, 336);
    			attr_dev(div1, "class", "tab-content svelte-2qpa7f");
    			add_location(div1, file$4, 14, 0, 308);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $charmManager;
    	validate_store(charmManager, "charmManager");
    	component_subscribe($$self, charmManager, $$value => $$invalidate(2, $charmManager = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharmList", slots, []);
    	let charms;

    	setInterval(
    		() => {
    			// WORKAROUND: charms does not follow charManager.charms...
    			if (charms !== $charmManager?.charms) {
    				$$invalidate(0, charms = $charmManager?.charms);
    			}
    		},
    		1000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CharmList> was created with unknown prop '${key}'`);
    	});

    	function charmtable_charms_binding(value) {
    		charms = value;
    		$$invalidate(0, charms);
    	}

    	$$self.$capture_state = () => ({
    		CharmTable,
    		charmManager,
    		charms,
    		$charmManager
    	});

    	$$self.$inject_state = $$props => {
    		if ("charms" in $$props) $$invalidate(0, charms = $$props.charms);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [charms, charmtable_charms_binding];
    }

    class CharmList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmList",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/VideoReader.svelte generated by Svelte v3.38.2 */

    const file$3 = "src/VideoReader.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let video;
    	let track;
    	let video_id_value;
    	let video_src_value;
    	let video_alt_value;
    	let video_style_value;
    	let t0;
    	let div0;
    	let progress_1;
    	let t1;
    	let span;
    	let t2_value = Math.floor(/*progress*/ ctx[4] * 100) + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			video = element("video");
    			track = element("track");
    			t0 = space();
    			div0 = element("div");
    			progress_1 = element("progress");
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = text("%");
    			attr_dev(track, "kind", "captions");
    			add_location(track, file$3, 85, 4, 2238);
    			attr_dev(video, "id", video_id_value = "video" + /*index*/ ctx[0]);
    			attr_dev(video, "class", "video-preview svelte-syjktf");
    			if (video.src !== (video_src_value = /*videoData*/ ctx[1])) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "width", videoWidth);
    			attr_dev(video, "height", videoHeight);
    			attr_dev(video, "alt", video_alt_value = "preview" + /*index*/ ctx[0]);
    			attr_dev(video, "style", video_style_value = /*isVideoVisible*/ ctx[2] ? "" : "display: none");
    			add_location(video, file$3, 77, 2, 1971);
    			progress_1.value = /*progress*/ ctx[4];
    			attr_dev(progress_1, "class", "svelte-syjktf");
    			add_location(progress_1, file$3, 89, 4, 2286);
    			attr_dev(span, "class", "progress-text svelte-syjktf");
    			add_location(span, file$3, 90, 4, 2329);
    			add_location(div0, file$3, 88, 2, 2276);
    			attr_dev(div1, "class", "video-reader svelte-syjktf");
    			add_location(div1, file$3, 76, 0, 1942);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, video);
    			append_dev(video, track);
    			/*video_binding*/ ctx[9](video);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, progress_1);
    			append_dev(div0, t1);
    			append_dev(div0, span);
    			append_dev(span, t2);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*index*/ 1 && video_id_value !== (video_id_value = "video" + /*index*/ ctx[0])) {
    				attr_dev(video, "id", video_id_value);
    			}

    			if (dirty & /*videoData*/ 2 && video.src !== (video_src_value = /*videoData*/ ctx[1])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (dirty & /*index*/ 1 && video_alt_value !== (video_alt_value = "preview" + /*index*/ ctx[0])) {
    				attr_dev(video, "alt", video_alt_value);
    			}

    			if (dirty & /*isVideoVisible*/ 4 && video_style_value !== (video_style_value = /*isVideoVisible*/ ctx[2] ? "" : "display: none")) {
    				attr_dev(video, "style", video_style_value);
    			}

    			if (dirty & /*progress*/ 16) {
    				prop_dev(progress_1, "value", /*progress*/ ctx[4]);
    			}

    			if (dirty & /*progress*/ 16 && t2_value !== (t2_value = Math.floor(/*progress*/ ctx[4] * 100) + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*video_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const FRAME_RATE = 29.97;
    const videoWidth = 1280;
    const videoHeight = 720;

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VideoReader", slots, []);
    	let { nSplits } = $$props;
    	let { index } = $$props;
    	let { videoName } = $$props;
    	let { videoData } = $$props;
    	let { isVideoVisible = false } = $$props;
    	let { charmScanner } = $$props;
    	let { onFinish } = $$props;
    	let beginTime, endTime;
    	let domVideo;
    	let capture;
    	let frame = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
    	let progress = 0;

    	(async () => {
    		await new Promise(r => requestAnimationFrame(r));
    		await new Promise(r => $$invalidate(3, domVideo.oncanplay = r, domVideo));
    		capture = new cv.VideoCapture(domVideo);
    		beginTime = index * domVideo.duration / nSplits;
    		endTime = (index + 1) * domVideo.duration / nSplits;
    		domVideo.addEventListener("seeked", processCurrentFrame);

    		// console.log( domVideo.currentTime, domVideo.duration, index, nSplits, beginTime, endTime )
    		if (domVideo.currentTime != beginTime) {
    			$$invalidate(3, domVideo.currentTime = beginTime, domVideo);
    		} else {
    			processCurrentFrame();
    		}
    	})();

    	const processCurrentFrame = async () => {
    		// console.log( {currentTime: domVideo.currentTime, endTime} )
    		if (endTime - domVideo.currentTime < 1 / FRAME_RATE) {
    			// const nScanedCharms = charmScanner.countCharms()
    			// console.log(nScanedCharms)
    			// insertScript = charmScanner.generateInsertScript()
    			$$invalidate(4, progress = 1);

    			// console.log(charmScanner.charms)
    			onFinish();

    			return;
    		}

    		capture.read(frame);
    		charmScanner.scan(frame, videoName); // TODO: コールバックにして汎用クラスにする
    		seekFrames(1, FRAME_RATE);
    		$$invalidate(4, progress = (domVideo.currentTime - beginTime) / (endTime - beginTime));
    	};

    	const seekFrames = (nFrames, fps) => {
    		const currentFrame = domVideo.currentTime * fps;
    		const newPosition = 0.00001 + (currentFrame + nFrames) / fps;

    		// plus 0.00001 is workaround for safari
    		$$invalidate(3, domVideo.currentTime = Math.min(endTime, newPosition), domVideo);
    	};

    	const writable_props = [
    		"nSplits",
    		"index",
    		"videoName",
    		"videoData",
    		"isVideoVisible",
    		"charmScanner",
    		"onFinish"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VideoReader> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domVideo = $$value;
    			$$invalidate(3, domVideo);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("nSplits" in $$props) $$invalidate(5, nSplits = $$props.nSplits);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("videoName" in $$props) $$invalidate(6, videoName = $$props.videoName);
    		if ("videoData" in $$props) $$invalidate(1, videoData = $$props.videoData);
    		if ("isVideoVisible" in $$props) $$invalidate(2, isVideoVisible = $$props.isVideoVisible);
    		if ("charmScanner" in $$props) $$invalidate(7, charmScanner = $$props.charmScanner);
    		if ("onFinish" in $$props) $$invalidate(8, onFinish = $$props.onFinish);
    	};

    	$$self.$capture_state = () => ({
    		FRAME_RATE,
    		videoWidth,
    		videoHeight,
    		nSplits,
    		index,
    		videoName,
    		videoData,
    		isVideoVisible,
    		charmScanner,
    		onFinish,
    		beginTime,
    		endTime,
    		domVideo,
    		capture,
    		frame,
    		progress,
    		processCurrentFrame,
    		seekFrames
    	});

    	$$self.$inject_state = $$props => {
    		if ("nSplits" in $$props) $$invalidate(5, nSplits = $$props.nSplits);
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("videoName" in $$props) $$invalidate(6, videoName = $$props.videoName);
    		if ("videoData" in $$props) $$invalidate(1, videoData = $$props.videoData);
    		if ("isVideoVisible" in $$props) $$invalidate(2, isVideoVisible = $$props.isVideoVisible);
    		if ("charmScanner" in $$props) $$invalidate(7, charmScanner = $$props.charmScanner);
    		if ("onFinish" in $$props) $$invalidate(8, onFinish = $$props.onFinish);
    		if ("beginTime" in $$props) beginTime = $$props.beginTime;
    		if ("endTime" in $$props) endTime = $$props.endTime;
    		if ("domVideo" in $$props) $$invalidate(3, domVideo = $$props.domVideo);
    		if ("capture" in $$props) capture = $$props.capture;
    		if ("frame" in $$props) frame = $$props.frame;
    		if ("progress" in $$props) $$invalidate(4, progress = $$props.progress);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		index,
    		videoData,
    		isVideoVisible,
    		domVideo,
    		progress,
    		nSplits,
    		videoName,
    		charmScanner,
    		onFinish,
    		video_binding
    	];
    }

    class VideoReader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			nSplits: 5,
    			index: 0,
    			videoName: 6,
    			videoData: 1,
    			isVideoVisible: 2,
    			charmScanner: 7,
    			onFinish: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VideoReader",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nSplits*/ ctx[5] === undefined && !("nSplits" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'nSplits'");
    		}

    		if (/*index*/ ctx[0] === undefined && !("index" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'index'");
    		}

    		if (/*videoName*/ ctx[6] === undefined && !("videoName" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'videoName'");
    		}

    		if (/*videoData*/ ctx[1] === undefined && !("videoData" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'videoData'");
    		}

    		if (/*charmScanner*/ ctx[7] === undefined && !("charmScanner" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'charmScanner'");
    		}

    		if (/*onFinish*/ ctx[8] === undefined && !("onFinish" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'onFinish'");
    		}
    	}

    	get nSplits() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nSplits(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videoName() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoName(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get videoData() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videoData(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isVideoVisible() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isVideoVisible(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmScanner() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmScanner(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFinish() {
    		throw new Error("<VideoReader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFinish(value) {
    		throw new Error("<VideoReader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CharmScanner.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$2 = "src/CharmScanner.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (104:6) {#each $videoReaderProps as props}
    function create_each_block$1(ctx) {
    	let videoreader;
    	let current;
    	const videoreader_spread_levels = [/*props*/ ctx[21]];
    	let videoreader_props = {};

    	for (let i = 0; i < videoreader_spread_levels.length; i += 1) {
    		videoreader_props = assign(videoreader_props, videoreader_spread_levels[i]);
    	}

    	videoreader = new VideoReader({ props: videoreader_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(videoreader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(videoreader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const videoreader_changes = (dirty & /*$videoReaderProps*/ 256)
    			? get_spread_update(videoreader_spread_levels, [get_spread_object(/*props*/ ctx[21])])
    			: {};

    			videoreader.$set(videoreader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(videoreader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(videoreader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(videoreader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(104:6) {#each $videoReaderProps as props}",
    		ctx
    	});

    	return block;
    }

    // (110:33) 
    function create_if_block_2(ctx) {
    	let t0;
    	let t1_value = 1 + Number(/*currentFileIndex*/ ctx[4]) + "";
    	let t1;
    	let t2;
    	let t3_value = /*files*/ ctx[2].length + "";
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			t0 = text("Processing ");
    			t1 = text(t1_value);
    			t2 = text("/");
    			t3 = text(t3_value);
    			t4 = text(" file. Please wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentFileIndex*/ 16 && t1_value !== (t1_value = 1 + Number(/*currentFileIndex*/ ctx[4]) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*files*/ 4 && t3_value !== (t3_value = /*files*/ ctx[2].length + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(110:33) ",
    		ctx
    	});

    	return block;
    }

    // (108:6) {#if isScanFinished}
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Completed!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(108:6) {#if isScanFinished}",
    		ctx
    	});

    	return block;
    }

    // (132:6) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading Files...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(132:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (122:6) {#if isInitialized}
    function create_if_block(ctx) {
    	let input;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div = element("div");
    			div.textContent = "Click to Select Movie";
    			set_style(input, "display", "none");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".mp4");
    			input.multiple = true;
    			attr_dev(input, "class", "svelte-18sy7xy");
    			add_location(input, file$2, 122, 8, 2939);
    			if (img.src !== (img_src_value = "https://static.thenounproject.com/png/625182-200.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-18sy7xy");
    			add_location(img, file$2, 129, 8, 3160);
    			attr_dev(div, "class", "svelte-18sy7xy");
    			add_location(div, file$2, 130, 8, 3276);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[12](input);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, img, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*onFileSelected*/ ctx[9], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[11]),
    					listen_dev(img, "click", /*click_handler*/ ctx[13], false, false, false),
    					listen_dev(div, "click", /*click_handler_1*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[12](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(122:6) {#if isInitialized}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let t0;
    	let t1;
    	let div2;
    	let div1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let textarea;
    	let t6;
    	let div3;
    	let current;
    	let each_value = /*$videoReaderProps*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function select_block_type(ctx, dirty) {
    		if (/*isScanFinished*/ ctx[5]) return create_if_block_1;
    		if (/*files*/ ctx[2].length > 0) return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*isInitialized*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t2 = text("Found ");
    			t3 = text(/*nScanedCharms*/ ctx[6]);
    			t4 = text(" charms.");
    			t5 = space();
    			textarea = element("textarea");
    			t6 = space();
    			div3 = element("div");
    			if_block1.c();
    			attr_dev(div0, "id", "status");
    			attr_dev(div0, "class", "svelte-18sy7xy");
    			add_location(div0, file$2, 102, 4, 2428);
    			attr_dev(div1, "class", "svelte-18sy7xy");
    			add_location(div1, file$2, 116, 6, 2756);
    			attr_dev(textarea, "placeholder", "納刀術,2,ひるみ軽減,1,1,0,0");
    			textarea.value = /*exportData*/ ctx[7];
    			attr_dev(textarea, "class", "svelte-18sy7xy");
    			add_location(textarea, file$2, 117, 6, 2803);
    			attr_dev(div2, "id", "result");
    			attr_dev(div2, "class", "svelte-18sy7xy");
    			add_location(div2, file$2, 115, 4, 2732);
    			attr_dev(div3, "id", "upload");
    			attr_dev(div3, "class", "svelte-18sy7xy");
    			add_location(div3, file$2, 120, 4, 2887);
    			attr_dev(div4, "id", "scanner");
    			attr_dev(div4, "class", "svelte-18sy7xy");
    			add_location(div4, file$2, 101, 2, 2405);
    			attr_dev(div5, "class", "tab-content svelte-18sy7xy");
    			add_location(div5, file$2, 100, 0, 2377);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div2, t5);
    			append_dev(div2, textarea);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			if_block1.m(div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$videoReaderProps*/ 256) {
    				each_value = /*$videoReaderProps*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (!current || dirty & /*nScanedCharms*/ 64) set_data_dev(t3, /*nScanedCharms*/ ctx[6]);

    			if (!current || dirty & /*exportData*/ 128) {
    				prop_dev(textarea, "value", /*exportData*/ ctx[7]);
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_each(each_blocks, detaching);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $videoReaderProps,
    		$$unsubscribe_videoReaderProps = noop,
    		$$subscribe_videoReaderProps = () => ($$unsubscribe_videoReaderProps(), $$unsubscribe_videoReaderProps = subscribe(videoReaderProps, $$value => $$invalidate(8, $videoReaderProps = $$value)), videoReaderProps);

    	let $charmManager;
    	validate_store(charmManager, "charmManager");
    	component_subscribe($$self, charmManager, $$value => $$invalidate(17, $charmManager = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_videoReaderProps());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharmScanner", slots, []);
    	const N_VIDEO_SPLITS = (navigator.hardwareConcurrency || 8) / 2;
    	let { charmScanner } = $$props;
    	let { isInitialized } = $$props;
    	let domInput; // input 要素
    	let files = []; // 選択されたローカルファイル

    	// video reader
    	let videoReaderProps = writable([]);

    	validate_store(videoReaderProps, "videoReaderProps");
    	$$subscribe_videoReaderProps();
    	let countFinishVideoRead;
    	let isVideoReadFinished;

    	// progress
    	let currentFileIndex = -1;

    	let isScanFinished = false;

    	// result
    	let nScanedCharms = 0;

    	let exportData = "";

    	function initVideoReaders() {
    		$$subscribe_videoReaderProps($$invalidate(3, videoReaderProps = writable([])));
    		countFinishVideoRead = 0;
    		isVideoReadFinished = false;
    	}

    	async function onFileSelected(e) {
    		const files = e.target.files;

    		if (files == null) {
    			return;
    		}

    		$$invalidate(5, isScanFinished = false);

    		// console.log(files)
    		for (let i = 0; i < files.length; i++) {
    			$$invalidate(4, currentFileIndex = i);
    			const file = files[i];
    			console.log(file.name, Date());
    			initVideoReaders();
    			const reader = new FileReader();
    			reader.readAsDataURL(file);

    			await new Promise(resolve => {
    					reader.onload = resolve;
    				});

    			for (let i = 0; i < N_VIDEO_SPLITS; i++) {
    				const index = $videoReaderProps.length;

    				set_store_value(
    					videoReaderProps,
    					$videoReaderProps[index] = {
    						index,
    						videoName: file.name,
    						videoData: reader.result,
    						charmScanner,
    						nSplits: N_VIDEO_SPLITS,
    						onFinish: onFinishVideoRead
    					},
    					$videoReaderProps
    				);
    			}

    			// console.log($videoReaderProps)
    			await new Promise(resolve => requestAnimationFrame(resolve));

    			await new Promise(resolve => {
    					setInterval(
    						() => {
    							$$invalidate(6, nScanedCharms = charmScanner.countCharms());
    							$$invalidate(7, exportData = charmScanner.exportAsText());

    							if (isVideoReadFinished) {
    								resolve();
    							}
    						},
    						1000
    					);
    				});

    			const charms = charmScanner.getCharms();
    			await $charmManager.registerCharms(charms);
    		}

    		const charms = charmScanner.getCharms();
    		console.log(JSON.stringify(charms));
    		$$invalidate(5, isScanFinished = true);
    	}

    	function onFinishVideoRead() {
    		if (++countFinishVideoRead !== N_VIDEO_SPLITS) {
    			return;
    		}

    		isVideoReadFinished = true;
    	}

    	const writable_props = ["charmScanner", "isInitialized"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<CharmScanner> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate(2, files);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			domInput = $$value;
    			$$invalidate(1, domInput);
    		});
    	}

    	const click_handler = () => {
    		domInput.click();
    	};

    	const click_handler_1 = () => {
    		domInput.click;
    	};

    	$$self.$$set = $$props => {
    		if ("charmScanner" in $$props) $$invalidate(10, charmScanner = $$props.charmScanner);
    		if ("isInitialized" in $$props) $$invalidate(0, isInitialized = $$props.isInitialized);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		VideoReader,
    		charmManager,
    		N_VIDEO_SPLITS,
    		charmScanner,
    		isInitialized,
    		domInput,
    		files,
    		videoReaderProps,
    		countFinishVideoRead,
    		isVideoReadFinished,
    		currentFileIndex,
    		isScanFinished,
    		nScanedCharms,
    		exportData,
    		initVideoReaders,
    		onFileSelected,
    		onFinishVideoRead,
    		$videoReaderProps,
    		$charmManager
    	});

    	$$self.$inject_state = $$props => {
    		if ("charmScanner" in $$props) $$invalidate(10, charmScanner = $$props.charmScanner);
    		if ("isInitialized" in $$props) $$invalidate(0, isInitialized = $$props.isInitialized);
    		if ("domInput" in $$props) $$invalidate(1, domInput = $$props.domInput);
    		if ("files" in $$props) $$invalidate(2, files = $$props.files);
    		if ("videoReaderProps" in $$props) $$subscribe_videoReaderProps($$invalidate(3, videoReaderProps = $$props.videoReaderProps));
    		if ("countFinishVideoRead" in $$props) countFinishVideoRead = $$props.countFinishVideoRead;
    		if ("isVideoReadFinished" in $$props) isVideoReadFinished = $$props.isVideoReadFinished;
    		if ("currentFileIndex" in $$props) $$invalidate(4, currentFileIndex = $$props.currentFileIndex);
    		if ("isScanFinished" in $$props) $$invalidate(5, isScanFinished = $$props.isScanFinished);
    		if ("nScanedCharms" in $$props) $$invalidate(6, nScanedCharms = $$props.nScanedCharms);
    		if ("exportData" in $$props) $$invalidate(7, exportData = $$props.exportData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isInitialized,
    		domInput,
    		files,
    		videoReaderProps,
    		currentFileIndex,
    		isScanFinished,
    		nScanedCharms,
    		exportData,
    		$videoReaderProps,
    		onFileSelected,
    		charmScanner,
    		input_change_handler,
    		input_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class CharmScanner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { charmScanner: 10, isInitialized: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmScanner",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*charmScanner*/ ctx[10] === undefined && !("charmScanner" in props)) {
    			console_1.warn("<CharmScanner> was created without expected prop 'charmScanner'");
    		}

    		if (/*isInitialized*/ ctx[0] === undefined && !("isInitialized" in props)) {
    			console_1.warn("<CharmScanner> was created without expected prop 'isInitialized'");
    		}
    	}

    	get charmScanner() {
    		throw new Error("<CharmScanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmScanner(value) {
    		throw new Error("<CharmScanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isInitialized() {
    		throw new Error("<CharmScanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isInitialized(value) {
    		throw new Error("<CharmScanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/NavOptions.svelte generated by Svelte v3.38.2 */

    const navOptions = [
    	// { tabTitle: 'Usage',   component: Usage },
    	{
    		tabTitle: "護石スキャン",
    		component: CharmScanner,
    		iconData: [
    			"M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z"
    		]
    	},
    	{
    		tabTitle: "護石管理",
    		component: CharmList,
    		iconData: [
    			"M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm15 2h-4v3h4V4zm0 4h-4v3h4V8zm0 4h-4v3h3a1 1 0 0 0 1-1v-2zm-5 3v-3H6v3h4zm-5 0v-3H1v2a1 1 0 0 0 1 1h3zm-4-4h4V8H1v3zm0-4h4V4H1v3zm5-3v3h4V4H6zm4 4H6v3h4V8z"
    		]
    	},
    	{
    		tabTitle: "護石スペック検索",
    		component: CharmSearcher,
    		iconData: [
    			"M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
    		]
    	},
    	{
    		tabTitle: "護石エクスポート",
    		component: CharmIxporter,
    		iconData: [
    			"M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"
    		]
    	},
    	{
    		tabTitle: "ヘルプ",
    		component: Description,
    		iconData: [
    			"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z",
    			"m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
    		]
    	}
    ];

    /* src/Nav.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/Nav.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (32:12) {#each (option.iconData || []) as iconData}
    function create_each_block_2(ctx) {
    	let path;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", /*iconData*/ ctx[10]);
    			add_location(path, file$1, 32, 14, 936);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(32:12) {#each (option.iconData || []) as iconData}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#each navOptions as option, i}
    function create_each_block_1(ctx) {
    	let li;
    	let button;
    	let svg;
    	let t0;
    	let span;
    	let t1_value = /*option*/ ctx[6].tabTitle + "";
    	let t1;
    	let button_class_value;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*option*/ ctx[6].iconData || [];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			svg = svg_element("svg");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			span = element("span");
    			t1 = text(t1_value);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "19");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$1, 30, 10, 782);
    			set_style(span, "display", /*isNavigationOpen*/ ctx[0] ? "inline" : "none");
    			attr_dev(span, "class", "svelte-nk63sn");
    			add_location(span, file$1, 35, 10, 1004);
    			attr_dev(button, "id", /*i*/ ctx[8]);

    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*currentNavOptionId*/ ctx[3] == /*i*/ ctx[8]
    			? "active navigation-link"
    			: "navigation-link") + " svelte-nk63sn"));

    			attr_dev(button, "role", "tab");
    			add_location(button, file$1, 25, 8, 574);
    			attr_dev(li, "class", "navigation-item svelte-nk63sn");
    			add_location(li, file$1, 24, 6, 537);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, svg);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(svg, null);
    			}

    			append_dev(button, t0);
    			append_dev(button, span);
    			append_dev(span, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*switchComponent*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*navOptions*/ 0) {
    				each_value_2 = /*option*/ ctx[6].iconData || [];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(svg, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}

    			if (dirty & /*isNavigationOpen*/ 1) {
    				set_style(span, "display", /*isNavigationOpen*/ ctx[0] ? "inline" : "none");
    			}

    			if (dirty & /*currentNavOptionId*/ 8 && button_class_value !== (button_class_value = "" + (null_to_empty(/*currentNavOptionId*/ ctx[3] == /*i*/ ctx[8]
    			? "active navigation-link"
    			: "navigation-link") + " svelte-nk63sn"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(24:4) {#each navOptions as option, i}",
    		ctx
    	});

    	return block;
    }

    // (54:4) {#each navOptions as option, i}
    function create_each_block(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let div_class_value;
    	let current;

    	const switch_instance_spread_levels = [
    		{
    			isInitialized: /*isInitialized*/ ctx[1],
    			charmScanner: /*charmScanner*/ ctx[2]
    		},
    		{
    			onActivate: /*onActivate*/ ctx[4][/*i*/ ctx[8]]
    		}
    	];

    	var switch_value = /*option*/ ctx[6].component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();

    			attr_dev(div, "class", div_class_value = "h-100 " + (/*currentNavOptionId*/ ctx[3] == /*i*/ ctx[8]
    			? "d-block"
    			: "d-none"));

    			add_location(div, file$1, 54, 6, 1659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*isInitialized, charmScanner, onActivate*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*isInitialized, charmScanner*/ 6 && {
    						isInitialized: /*isInitialized*/ ctx[1],
    						charmScanner: /*charmScanner*/ ctx[2]
    					},
    					dirty & /*onActivate*/ 16 && {
    						onActivate: /*onActivate*/ ctx[4][/*i*/ ctx[8]]
    					}
    				])
    			: {};

    			if (switch_value !== (switch_value = /*option*/ ctx[6].component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty & /*currentNavOptionId*/ 8 && div_class_value !== (div_class_value = "h-100 " + (/*currentNavOptionId*/ ctx[3] == /*i*/ ctx[8]
    			? "d-block"
    			: "d-none"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(54:4) {#each navOptions as option, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let ul;
    	let t0;
    	let div0;
    	let a;
    	let t2;
    	let script;
    	let script_src_value;
    	let t3;
    	let div1;
    	let current;
    	let each_value_1 = navOptions;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = navOptions;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "Tweet";
    			t2 = space();
    			script = element("script");
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(a, "href", "https://twitter.com/share?ref_src=twsrc%5Etfw");
    			attr_dev(a, "class", "twitter-share-button");
    			attr_dev(a, "data-text", "");
    			attr_dev(a, "data-url", "https://mhrise-charm-scanner.yuzu-k.com");
    			attr_dev(a, "data-hashtags", "MHRise,護石,ツール");
    			attr_dev(a, "data-show-count", "false");
    			add_location(a, file$1, 40, 6, 1196);
    			script.async = true;
    			if (script.src !== (script_src_value = "https://platform.twitter.com/widgets.js")) attr_dev(script, "src", script_src_value);
    			attr_dev(script, "charset", "utf-8");
    			add_location(script, file$1, 48, 6, 1476);
    			set_style(div0, "position", "fixed");
    			set_style(div0, "bottom", "0");
    			set_style(div0, "left", "5px");
    			add_location(div0, file$1, 39, 4, 1137);
    			attr_dev(ul, "class", "navigation svelte-nk63sn");
    			set_style(ul, "width", /*isNavigationOpen*/ ctx[0] ? "14rem" : "3.2rem");
    			add_location(ul, file$1, 22, 2, 416);
    			attr_dev(div1, "class", "navigation-content svelte-nk63sn");
    			add_location(div1, file$1, 52, 2, 1584);
    			attr_dev(div2, "id", "container");
    			attr_dev(div2, "class", "svelte-nk63sn");
    			add_location(div2, file$1, 21, 0, 393);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, ul);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul, null);
    			}

    			append_dev(ul, t0);
    			append_dev(ul, div0);
    			append_dev(div0, a);
    			append_dev(div0, t2);
    			append_dev(div0, script);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentNavOptionId, switchComponent, isNavigationOpen, navOptions*/ 41) {
    				each_value_1 = navOptions;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(ul, t0);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (!current || dirty & /*isNavigationOpen*/ 1) {
    				set_style(ul, "width", /*isNavigationOpen*/ ctx[0] ? "14rem" : "3.2rem");
    			}

    			if (dirty & /*currentNavOptionId, navOptions, isInitialized, charmScanner, onActivate*/ 30) {
    				each_value = navOptions;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Nav", slots, []);
    	let { isNavigationOpen } = $$props;
    	let { isInitialized } = $$props;
    	let { charmScanner } = $$props;
    	let currentNavOptionId = 4;
    	let onActivate = {};

    	function switchComponent(e) {
    		$$invalidate(3, currentNavOptionId = e.srcElement.closest("button").id);

    		if (onActivate[currentNavOptionId]) {
    			onActivate[currentNavOptionId]();
    		}
    	}

    	const writable_props = ["isNavigationOpen", "isInitialized", "charmScanner"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("isNavigationOpen" in $$props) $$invalidate(0, isNavigationOpen = $$props.isNavigationOpen);
    		if ("isInitialized" in $$props) $$invalidate(1, isInitialized = $$props.isInitialized);
    		if ("charmScanner" in $$props) $$invalidate(2, charmScanner = $$props.charmScanner);
    	};

    	$$self.$capture_state = () => ({
    		navOptions,
    		isNavigationOpen,
    		isInitialized,
    		charmScanner,
    		currentNavOptionId,
    		onActivate,
    		switchComponent
    	});

    	$$self.$inject_state = $$props => {
    		if ("isNavigationOpen" in $$props) $$invalidate(0, isNavigationOpen = $$props.isNavigationOpen);
    		if ("isInitialized" in $$props) $$invalidate(1, isInitialized = $$props.isInitialized);
    		if ("charmScanner" in $$props) $$invalidate(2, charmScanner = $$props.charmScanner);
    		if ("currentNavOptionId" in $$props) $$invalidate(3, currentNavOptionId = $$props.currentNavOptionId);
    		if ("onActivate" in $$props) $$invalidate(4, onActivate = $$props.onActivate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		isNavigationOpen,
    		isInitialized,
    		charmScanner,
    		currentNavOptionId,
    		onActivate,
    		switchComponent
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			isNavigationOpen: 0,
    			isInitialized: 1,
    			charmScanner: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*isNavigationOpen*/ ctx[0] === undefined && !("isNavigationOpen" in props)) {
    			console.warn("<Nav> was created without expected prop 'isNavigationOpen'");
    		}

    		if (/*isInitialized*/ ctx[1] === undefined && !("isInitialized" in props)) {
    			console.warn("<Nav> was created without expected prop 'isInitialized'");
    		}

    		if (/*charmScanner*/ ctx[2] === undefined && !("charmScanner" in props)) {
    			console.warn("<Nav> was created without expected prop 'charmScanner'");
    		}
    	}

    	get isNavigationOpen() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isNavigationOpen(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isInitialized() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isInitialized(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmScanner() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmScanner(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let hamburger;
    	let updating_isOpen;
    	let t0;
    	let h1;
    	let t2;
    	let div0;
    	let nav;
    	let t3;
    	let div1;
    	let current;

    	function hamburger_isOpen_binding(value) {
    		/*hamburger_isOpen_binding*/ ctx[3](value);
    	}

    	let hamburger_props = {};

    	if (/*isNavigationOpen*/ ctx[0] !== void 0) {
    		hamburger_props.isOpen = /*isNavigationOpen*/ ctx[0];
    	}

    	hamburger = new Hamburger({ props: hamburger_props, $$inline: true });
    	binding_callbacks.push(() => bind(hamburger, "isOpen", hamburger_isOpen_binding));

    	const nav_spread_levels = [
    		{
    			isNavigationOpen: /*isNavigationOpen*/ ctx[0],
    			isInitialized: /*isInitialized*/ ctx[1],
    			charmScanner: /*charmScanner*/ ctx[2]
    		}
    	];

    	let nav_props = {};

    	for (let i = 0; i < nav_spread_levels.length; i += 1) {
    		nav_props = assign(nav_props, nav_spread_levels[i]);
    	}

    	nav = new Nav({ props: nav_props, $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			create_component(hamburger.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = `${TITLE}`;
    			t2 = space();
    			div0 = element("div");
    			create_component(nav.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			div1.textContent = `v${VERSION}`;
    			attr_dev(h1, "class", "svelte-1kyfeff");
    			add_location(h1, file, 39, 3, 1018);
    			attr_dev(header, "class", "svelte-1kyfeff");
    			add_location(header, file, 37, 2, 958);
    			attr_dev(div0, "id", "nav-wrapper");
    			attr_dev(div0, "class", "svelte-1kyfeff");
    			add_location(div0, file, 49, 2, 1460);
    			attr_dev(div1, "id", "version");
    			attr_dev(div1, "class", "svelte-1kyfeff");
    			add_location(div1, file, 52, 2, 1559);
    			attr_dev(main, "class", "svelte-1kyfeff");
    			add_location(main, file, 36, 0, 949);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			mount_component(hamburger, header, null);
    			append_dev(header, t0);
    			append_dev(header, h1);
    			append_dev(main, t2);
    			append_dev(main, div0);
    			mount_component(nav, div0, null);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const hamburger_changes = {};

    			if (!updating_isOpen && dirty & /*isNavigationOpen*/ 1) {
    				updating_isOpen = true;
    				hamburger_changes.isOpen = /*isNavigationOpen*/ ctx[0];
    				add_flush_callback(() => updating_isOpen = false);
    			}

    			hamburger.$set(hamburger_changes);

    			const nav_changes = (dirty & /*isNavigationOpen, isInitialized, charmScanner*/ 7)
    			? get_spread_update(nav_spread_levels, [
    					{
    						isNavigationOpen: /*isNavigationOpen*/ ctx[0],
    						isInitialized: /*isInitialized*/ ctx[1],
    						charmScanner: /*charmScanner*/ ctx[2]
    					}
    				])
    			: {};

    			nav.$set(nav_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hamburger.$$.fragment, local);
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hamburger.$$.fragment, local);
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(hamburger);
    			destroy_component(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TITLE = "MHRise Charm Scanner";
    const VERSION = "0.5.6";

    function instance($$self, $$props, $$invalidate) {
    	let $charmManager;
    	validate_store(charmManager, "charmManager");
    	component_subscribe($$self, charmManager, $$value => $$invalidate(4, $charmManager = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let isNavigationOpen = true;
    	let isInitialized = false;
    	let charmScanner;

    	window.addEventListener("load", async () => {
    		$$invalidate(2, charmScanner = new MHRiseCharmScanner());
    		set_store_value(charmManager, $charmManager = new MHRiseCharmManager(), $charmManager);
    		await charmScanner.init();
    		$$invalidate(1, isInitialized = true);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function hamburger_isOpen_binding(value) {
    		isNavigationOpen = value;
    		$$invalidate(0, isNavigationOpen);
    	}

    	$$self.$capture_state = () => ({
    		MHRiseCharmManager,
    		MHRiseCharmScanner,
    		Hamburger,
    		Nav,
    		charmManager,
    		TITLE,
    		VERSION,
    		isNavigationOpen,
    		isInitialized,
    		charmScanner,
    		$charmManager
    	});

    	$$self.$inject_state = $$props => {
    		if ("isNavigationOpen" in $$props) $$invalidate(0, isNavigationOpen = $$props.isNavigationOpen);
    		if ("isInitialized" in $$props) $$invalidate(1, isInitialized = $$props.isInitialized);
    		if ("charmScanner" in $$props) $$invalidate(2, charmScanner = $$props.charmScanner);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isNavigationOpen, isInitialized, charmScanner, hamburger_isOpen_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
        // name: 'world'
        }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
