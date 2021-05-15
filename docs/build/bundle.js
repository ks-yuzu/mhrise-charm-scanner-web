
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
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

    class MHRiseCharmManager {
      db = null


      constructor() {
        this.db = openDatabase('mhrise-charm-manager', '', 'MHRise charm manager', 5000);
        this._createTable();
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


      async reset() {
        await this.sql('drop table if exists charms');
        await this._createTable();
      }


      async registerCharms(charms) {
        const values = charms
          .map(c => `("${c.skills[0]}", ${c.skillLevels[0]}, "${c.skills[1]}", ${c.skillLevels[1]}, ${c.slots.replace(/-/g, ', ')})`)
          .join(',\n');

        await this.sql(`insert or ignore into charms values ${values}`);
      }


      async searchCharms(query) {
        const {tx, result} = await this.sql(query);
        return result.rows
      }


      async _createTable() {
        await this.sql(`create table if not exists charms(
               skill1      varchar(20),
               skill1Level int,
               skill2      varchar(20),
               skill2Level int,
               slot1       int,
               slot2       int,
               slot3       int,
               unique (skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3))`);
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

      store(params) {
        const {page, row, col} = params;
        this.charms[page][row][col] = params;
        this.nCharms++;
      }

      scan(screenshot) {
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
        this.store({page, row, col, rarity, slots, skills, skillLevels});
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

    /* src/Description.svelte generated by Svelte v3.38.2 */

    const file$6 = "src/Description.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let t0;
    	let br0;
    	let t1;
    	let a0;
    	let t3;
    	let br1;
    	let t4;
    	let br2;
    	let t5;
    	let br3;
    	let t6;
    	let a1;
    	let t8;
    	let br4;
    	let t9;
    	let br5;
    	let t10;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			t0 = text("モンスターハンターライズの護石を自動読み取りするツールです。");
    			br0 = element("br");
    			t1 = text("\n    Nintendo Switch の 30 秒キャプチャ動画を用意するだけで, 護石のスキルやスロットが読み取れます。\n    (");
    			a0 = element("a");
    			a0.textContent = "動画例";
    			t3 = text(")");
    			br1 = element("br");
    			t4 = space();
    			br2 = element("br");
    			t5 = text("\n    出力形式は、<スキル1>,<スキル1Lv>,<スキル2>,<スキル2Lv>,<スロット1Lv>,<スロット2Lv>,<スロット3Lv> です。");
    			br3 = element("br");
    			t6 = space();
    			a1 = element("a");
    			a1.textContent = "泣きシミュ";
    			t8 = text(" さんでそのままインポートできます。");
    			br4 = element("br");
    			t9 = space();
    			br5 = element("br");
    			t10 = text("\n    機能追加、UI 改善は随時行っていきます。");
    			add_location(br0, file$6, 3, 34, 202);
    			attr_dev(a0, "href", "sample/input.mp4");
    			add_location(a0, file$6, 5, 5, 275);
    			add_location(br1, file$6, 5, 40, 310);
    			add_location(br2, file$6, 6, 4, 319);
    			add_location(br3, file$6, 7, 117, 441);
    			attr_dev(a1, "href", "https://mhrise.wiki-db.com/sim/");
    			add_location(a1, file$6, 8, 4, 450);
    			add_location(br4, file$6, 8, 73, 519);
    			add_location(br5, file$6, 9, 4, 528);
    			set_style(p, "margin", "auto");
    			set_style(p, "max-width", "100%");
    			set_style(p, "width", "54rem");
    			set_style(p, "text-align", "left");
    			add_location(p, file$6, 2, 2, 94);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$6, 1, 2, 68);
    			attr_dev(div1, "id", "description");
    			attr_dev(div1, "class", "card border border-light shadow-sm svelte-2ij5js");
    			add_location(div1, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t0);
    			append_dev(p, br0);
    			append_dev(p, t1);
    			append_dev(p, a0);
    			append_dev(p, t3);
    			append_dev(p, br1);
    			append_dev(p, t4);
    			append_dev(p, br2);
    			append_dev(p, t5);
    			append_dev(p, br3);
    			append_dev(p, t6);
    			append_dev(p, a1);
    			append_dev(p, t8);
    			append_dev(p, br4);
    			append_dev(p, t9);
    			append_dev(p, br5);
    			append_dev(p, t10);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Description", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Description> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Description extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Description",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules/svelte-table/src/SvelteTable.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$1 } = globals;
    const file$5 = "node_modules/svelte-table/src/SvelteTable.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[33] = list[i];
    	child_ctx[35] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    const get_row_slot_changes = dirty => ({ row: dirty[0] & /*c_rows*/ 8192 });
    const get_row_slot_context = ctx => ({ row: /*row*/ ctx[33], n: /*n*/ ctx[35] });

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
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
    	child_ctx[36] = list[i];
    	child_ctx[41] = list;
    	child_ctx[42] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[43] = list[i];
    	return child_ctx;
    }

    // (132:4) {#if showFilterHeader}
    function create_if_block_4(ctx) {
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

    			attr_dev(tr, "class", "svelte-w7dofd");
    			add_location(tr, file$5, 132, 6, 3635);
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
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(132:4) {#if showFilterHeader}",
    		ctx
    	});

    	return block;
    }

    // (138:58) 
    function create_if_block_6(ctx) {
    	let select;
    	let option;
    	let select_class_value;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*filterValues*/ ctx[12][/*col*/ ctx[36].key];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	function select_change_handler() {
    		/*select_change_handler*/ ctx[25].call(select, /*col*/ ctx[36]);
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
    			add_location(option, file$5, 139, 16, 3971);
    			attr_dev(select, "class", select_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameSelect*/ ctx[9])) + " svelte-w7dofd"));
    			if (/*filterSelections*/ ctx[2][/*col*/ ctx[36].key] === void 0) add_render_callback(select_change_handler);
    			add_location(select, file$5, 138, 14, 3868);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", select_change_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*filterValues, columns*/ 4104) {
    				each_value_4 = /*filterValues*/ ctx[12][/*col*/ ctx[36].key];
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

    			if (dirty[0] & /*classNameSelect*/ 512 && select_class_value !== (select_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameSelect*/ ctx[9])) + " svelte-w7dofd"))) {
    				attr_dev(select, "class", select_class_value);
    			}

    			if (dirty[0] & /*filterSelections, columns, filterValues*/ 4108) {
    				select_option(select, /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]);
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
    		source: "(138:58) ",
    		ctx
    	});

    	return block;
    }

    // (136:12) {#if col.searchValue !== undefined}
    function create_if_block_5(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[24].call(input, /*col*/ ctx[36]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			add_location(input, file$5, 136, 14, 3748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*filterSelections, columns, filterValues*/ 4108 && input.value !== /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]) {
    				set_input_value(input, /*filterSelections*/ ctx[2][/*col*/ ctx[36].key]);
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
    		source: "(136:12) {#if col.searchValue !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (141:16) {#each filterValues[col.key] as option}
    function create_each_block_4(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[43].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[43].value;
    			option.value = option.__value;
    			add_location(option, file$5, 141, 18, 4081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filterValues, columns*/ 4104 && t_value !== (t_value = /*option*/ ctx[43].name + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*filterValues, columns*/ 4104 && option_value_value !== (option_value_value = /*option*/ ctx[43].value)) {
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
    		source: "(141:16) {#each filterValues[col.key] as option}",
    		ctx
    	});

    	return block;
    }

    // (134:8) {#each columns as col}
    function create_each_block_3(ctx) {
    	let th;
    	let t;

    	function select_block_type(ctx, dirty) {
    		if (/*col*/ ctx[36].searchValue !== undefined) return create_if_block_5;
    		if (/*filterValues*/ ctx[12][/*col*/ ctx[36].key] !== undefined) return create_if_block_6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			th = element("th");
    			if (if_block) if_block.c();
    			t = space();
    			add_location(th, file$5, 134, 10, 3681);
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
    		source: "(134:8) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (163:10) {:else}
    function create_else_block_1(ctx) {
    	let th;
    	let t0_value = /*col*/ ctx[36].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let th_class_value;
    	let if_block = /*sortBy*/ ctx[0] === /*col*/ ctx[36].key && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(th, "class", th_class_value = "" + (null_to_empty(/*col*/ ctx[36].headerClass) + " svelte-w7dofd"));
    			add_location(th, file$5, 163, 12, 4730);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t0);
    			append_dev(th, t1);
    			if (if_block) if_block.m(th, null);
    			append_dev(th, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*columns*/ 8 && t0_value !== (t0_value = /*col*/ ctx[36].title + "")) set_data_dev(t0, t0_value);

    			if (/*sortBy*/ ctx[0] === /*col*/ ctx[36].key) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					if_block.m(th, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*columns, filterValues*/ 4104 && th_class_value !== (th_class_value = "" + (null_to_empty(/*col*/ ctx[36].headerClass) + " svelte-w7dofd"))) {
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
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(163:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (153:10) {#if col.sortable}
    function create_if_block_1$1(ctx) {
    	let th;
    	let t0_value = /*col*/ ctx[36].title + "";
    	let t0;
    	let t1;
    	let t2;
    	let th_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*sortBy*/ ctx[0] === /*col*/ ctx[36].key && create_if_block_2$1(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[26](/*col*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(th, "class", th_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](["isSortable", /*col*/ ctx[36].headerClass])) + " svelte-w7dofd"));
    			add_location(th, file$5, 153, 12, 4399);
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
    			if (dirty[0] & /*columns*/ 8 && t0_value !== (t0_value = /*col*/ ctx[36].title + "")) set_data_dev(t0, t0_value);

    			if (/*sortBy*/ ctx[0] === /*col*/ ctx[36].key) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(th, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*columns, filterValues*/ 4104 && th_class_value !== (th_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](["isSortable", /*col*/ ctx[36].headerClass])) + " svelte-w7dofd"))) {
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(153:10) {#if col.sortable}",
    		ctx
    	});

    	return block;
    }

    // (168:14) {#if sortBy === col.key}
    function create_if_block_3(ctx) {
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(168:14) {#if sortBy === col.key}",
    		ctx
    	});

    	return block;
    }

    // (159:14) {#if sortBy === col.key}
    function create_if_block_2$1(ctx) {
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(159:14) {#if sortBy === col.key}",
    		ctx
    	});

    	return block;
    }

    // (152:8) {#each columns as col}
    function create_each_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*col*/ ctx[36].sortable) return create_if_block_1$1;
    		return create_else_block_1;
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(152:8) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (150:62)        
    function fallback_block_1(ctx) {
    	let tr;
    	let each_value_2 = /*columns*/ ctx[3];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(tr, file$5, 150, 6, 4322);
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
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
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
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(150:62)        ",
    		ctx
    	});

    	return block;
    }

    // (192:14) {:else}
    function create_else_block$2(ctx) {
    	let html_tag;

    	let raw_value = (/*col*/ ctx[36].renderValue
    	? /*col*/ ctx[36].renderValue(/*row*/ ctx[33])
    	: /*col*/ ctx[36].value(/*row*/ ctx[33])) + "";

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
    			if (dirty[0] & /*columns, c_rows*/ 8200 && raw_value !== (raw_value = (/*col*/ ctx[36].renderValue
    			? /*col*/ ctx[36].renderValue(/*row*/ ctx[33])
    			: /*col*/ ctx[36].value(/*row*/ ctx[33])) + "")) html_tag.p(raw_value);
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(192:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (186:14) {#if col.renderComponent}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		/*col*/ ctx[36].renderComponent.props || {},
    		{ row: /*row*/ ctx[33] },
    		{ col: /*col*/ ctx[36] }
    	];

    	var switch_value = /*col*/ ctx[36].renderComponent.component || /*col*/ ctx[36].renderComponent;

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
    					dirty[0] & /*columns*/ 8 && get_spread_object(/*col*/ ctx[36].renderComponent.props || {}),
    					dirty[0] & /*c_rows*/ 8192 && { row: /*row*/ ctx[33] },
    					dirty[0] & /*columns*/ 8 && { col: /*col*/ ctx[36] }
    				])
    			: {};

    			if (switch_value !== (switch_value = /*col*/ ctx[36].renderComponent.component || /*col*/ ctx[36].renderComponent)) {
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(186:14) {#if col.renderComponent}",
    		ctx
    	});

    	return block;
    }

    // (181:10) {#each columns as col}
    function create_each_block_1(ctx) {
    	let td;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let td_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*col*/ ctx[36].renderComponent) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[27](/*row*/ ctx[33], /*col*/ ctx[36], ...args);
    	}

    	const block = {
    		c: function create() {
    			td = element("td");
    			if_block.c();
    			t = space();
    			attr_dev(td, "class", td_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15]([/*col*/ ctx[36].class, /*classNameCell*/ ctx[11]])) + " svelte-w7dofd"));
    			add_location(td, file$5, 181, 12, 5265);
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

    			if (!current || dirty[0] & /*columns, classNameCell, filterValues*/ 6152 && td_class_value !== (td_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15]([/*col*/ ctx[36].class, /*classNameCell*/ ctx[11]])) + " svelte-w7dofd"))) {
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
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(181:10) {#each columns as col}",
    		ctx
    	});

    	return block;
    }

    // (179:40)          
    function fallback_block(ctx) {
    	let tr;
    	let tr_class_value;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*columns*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function click_handler_2(...args) {
    		return /*click_handler_2*/ ctx[28](/*row*/ ctx[33], ...args);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(tr, "class", tr_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameRow*/ ctx[10])) + " svelte-w7dofd"));
    			add_location(tr, file$5, 179, 8, 5138);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			insert_dev(target, t, anchor);
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
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
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

    			if (!current || dirty[0] & /*classNameRow*/ 1024 && tr_class_value !== (tr_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameRow*/ ctx[10])) + " svelte-w7dofd"))) {
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
    			if (detaching) detach_dev(t);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(179:40)          ",
    		ctx
    	});

    	return block;
    }

    // (178:4) {#each c_rows as row, n}
    function create_each_block$2(ctx) {
    	let current;
    	const row_slot_template = /*#slots*/ ctx[23].row;
    	const row_slot = create_slot(row_slot_template, ctx, /*$$scope*/ ctx[22], get_row_slot_context);
    	const row_slot_or_fallback = row_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (row_slot_or_fallback) row_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (row_slot_or_fallback) {
    				row_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (row_slot) {
    				if (row_slot.p && (!current || dirty[0] & /*$$scope, c_rows*/ 4202496)) {
    					update_slot(row_slot, row_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_row_slot_changes, get_row_slot_context);
    				}
    			} else {
    				if (row_slot_or_fallback && row_slot_or_fallback.p && dirty[0] & /*classNameRow, c_rows, columns, classNameCell*/ 11272) {
    					row_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(row_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(row_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (row_slot_or_fallback) row_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(178:4) {#each c_rows as row, n}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let table;
    	let thead;
    	let t0;
    	let thead_class_value;
    	let t1;
    	let tbody;
    	let tbody_class_value;
    	let table_class_value;
    	let current;
    	let if_block = /*showFilterHeader*/ ctx[14] && create_if_block_4(ctx);
    	const header_slot_template = /*#slots*/ ctx[23].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[22], get_header_slot_context);
    	const header_slot_or_fallback = header_slot || fallback_block_1(ctx);
    	let each_value = /*c_rows*/ ctx[13];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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

    			attr_dev(thead, "class", thead_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameThead*/ ctx[7])) + " svelte-w7dofd"));
    			add_location(thead, file$5, 130, 2, 3556);
    			attr_dev(tbody, "class", tbody_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTbody*/ ctx[8])) + " svelte-w7dofd"));
    			add_location(tbody, file$5, 176, 2, 5014);
    			attr_dev(table, "class", table_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTable*/ ctx[6])) + " svelte-w7dofd"));
    			add_location(table, file$5, 129, 0, 3508);
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
    				if (header_slot.p && (!current || dirty[0] & /*$$scope, sortOrder, sortBy*/ 4194307)) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			} else {
    				if (header_slot_or_fallback && header_slot_or_fallback.p && dirty[0] & /*columns, sortOrder, iconAsc, iconDesc, sortBy*/ 59) {
    					header_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (!current || dirty[0] & /*classNameThead*/ 128 && thead_class_value !== (thead_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameThead*/ ctx[7])) + " svelte-w7dofd"))) {
    				attr_dev(thead, "class", thead_class_value);
    			}

    			if (dirty[0] & /*asStringArray, classNameRow, handleClickRow, c_rows, columns, classNameCell, handleClickCell, $$scope*/ 4631560) {
    				each_value = /*c_rows*/ ctx[13];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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

    			if (!current || dirty[0] & /*classNameTbody*/ 256 && tbody_class_value !== (tbody_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTbody*/ ctx[8])) + " svelte-w7dofd"))) {
    				attr_dev(tbody, "class", tbody_class_value);
    			}

    			if (!current || dirty[0] & /*classNameTable*/ 64 && table_class_value !== (table_class_value = "" + (null_to_empty(/*asStringArray*/ ctx[15](/*classNameTable*/ ctx[6])) + " svelte-w7dofd"))) {
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let c_rows;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SvelteTable", slots, ['header','row']);
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
    	let sortFunction = () => "";

    	let showFilterHeader = columns.some(c => {
    		// check if there are any filter or search headers
    		return c.filterOptions !== undefined || c.searchValue !== undefined;
    	});

    	let filterValues = {};
    	let searchValues = {};
    	let columnByKey = {};

    	columns.forEach(col => {
    		$$invalidate(21, columnByKey[col.key] = col, columnByKey);
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
    		"filterSelections"
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
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
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
    		if ("sortFunction" in $$props) $$invalidate(20, sortFunction = $$props.sortFunction);
    		if ("showFilterHeader" in $$props) $$invalidate(14, showFilterHeader = $$props.showFilterHeader);
    		if ("filterValues" in $$props) $$invalidate(12, filterValues = $$props.filterValues);
    		if ("searchValues" in $$props) searchValues = $$props.searchValues;
    		if ("columnByKey" in $$props) $$invalidate(21, columnByKey = $$props.columnByKey);
    		if ("c_rows" in $$props) $$invalidate(13, c_rows = $$props.c_rows);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*columnByKey, sortBy*/ 2097153) {
    			{
    				let col = columnByKey[sortBy];

    				if (col !== undefined && col.sortable === true && typeof col.value === "function") {
    					$$invalidate(20, sortFunction = r => col.value(r));
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*rows, filterSelections, columnByKey, sortFunction, sortOrder*/ 3670022) {
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
    			}));
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
    			instance$5,
    			create_fragment$5,
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
    				filterSelections: 2
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvelteTable",
    			options,
    			id: create_fragment$5.name
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
    }

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

    /* src/CharmList.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1 } = globals;
    const file$4 = "src/CharmList.svelte";

    // (145:2) {:else}
    function create_else_block$1(ctx) {
    	let sveltetable;
    	let current;

    	sveltetable = new SvelteTable({
    			props: {
    				columns: /*columns*/ ctx[1],
    				rows: /*charms*/ ctx[0],
    				classNameTable: ["table table-striped table-hover table-responsible"],
    				classNameThead: ["table-dark hide-first-child.disabled"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sveltetable.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sveltetable, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sveltetable_changes = {};
    			if (dirty & /*charms*/ 1) sveltetable_changes.rows = /*charms*/ ctx[0];
    			sveltetable.$set(sveltetable_changes);
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
    			destroy_component(sveltetable, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(145:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (141:2) {#if charms == null}
    function create_if_block$1(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "Loading...";
    			attr_dev(span, "class", "visually-hidden");
    			add_location(span, file$4, 142, 6, 3740);
    			set_style(div, "margin-top", "20%");
    			attr_dev(div, "class", "spinner-border text-info");
    			attr_dev(div, "role", "status");
    			add_location(div, file$4, 141, 4, 3657);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
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
    		source: "(141:2) {#if charms == null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
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
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "id", "charm-list");
    			attr_dev(div, "class", "svelte-1lpqfs6");
    			add_location(div, file$4, 139, 0, 3608);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const N_CHARM_SLOT_MAX = 3;

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharmList", slots, []);

    	const updateCharmTable = async () => {
    		const allCharms = await charmManager.searchCharms("select * from charms");

    		$$invalidate(0, charms = [...allCharms].map((elm, index) => {
    			return {
    				...elm,
    				id: 1 + index,
    				evaluation: skillToSlotLevel[elm.skill1] * elm.skill1Level + skillToSlotLevel[elm.skill2] * elm.skill2Level + elm.slot1 + elm.slot2 + elm.slot3
    			};
    		}));
    	};

    	const columns = [
    		{
    			key: "id",
    			title: "ID",
    			value: v => v.id,
    			sortable: true,
    			filterOptions: rows => {
    				// generate groupings of 0-10, 10-20 etc...
    				let nums = {};

    				rows.forEach(row => {
    					let num = Math.floor(row.id / 10);

    					if (nums[num] === undefined) nums[num] = {
    						name: `${num * 10} 〜 ${(num + 1) * 10}`,
    						value: num
    					};
    				});

    				// fix order
    				nums = Object.entries(nums).sort().reduce((o, [k, v]) => (o[k] = v, o), {});

    				return Object.values(nums);
    			},
    			filterValue: v => Math.floor(v.id / 10)
    		},
    		// {
    		//   key: "first_name",
    		//   title: "FIRST_NAME",
    		//   value: v => v.first_name,
    		//   sortable: true,
    		//   filterOptions: rows => {
    		//     // use first letter of first_name to generate filter
    		//     let letrs = {};
    		//     rows.forEach(row => {
    		//       let letr = row.first_name.charAt(0);
    		//       if (letrs[letr] === undefined)
    		//         letrs[letr] = {
    		//           name: `${letr.toUpperCase()}`,
    		//           value: letr.toLowerCase()
    		//         };
    		//     });
    		//     // fix order
    		//     letrs = Object.entries(letrs)
    		//       .sort()
    		//       .reduce((o, [k, v]) => ((o[k] = v), o), {});
    		//     return Object.values(letrs);
    		//   },
    		//   filterValue: v => v.first_name.charAt(0).toLowerCase()
    		// },
    		{
    			key: "skill1",
    			title: "スキル1",
    			value: v => v.skill1,
    			sortable: true
    		},
    		{
    			key: "skill1Level",
    			title: "スキル1 Lv",
    			value: v => v.skill1Level,
    			sortable: true
    		},
    		{
    			key: "skill2",
    			title: "スキル2",
    			value: v => v.skill2,
    			sortable: true
    		},
    		{
    			key: "skill2Level",
    			title: "スキル2 Lv",
    			value: v => v.skill2Level,
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
    			value: v => v.evaluation,
    			sortable: true
    		}
    	]; // {
    	//   key: "gender",
    	//   title: "GENDER",

    	//   value: v => v.gender,
    	//   renderValue: v => v.gender.charAt(0).toUpperCase() + v.gender.substring(1), // capitalize
    	//   sortable: true,
    	//   filterOptions: ["male", "female"] // provide array
    	// }
    	// fields
    	let charmManager = new MHRiseCharmManager();

    	let charms = null;

    	// init
    	const init = async () => {
    		if (charmManager == null) {
    			setTimeout(init, 1000);
    		} else {
    			await updateCharmTable();
    		}
    	};

    	init();
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CharmList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SvelteTable,
    		MHRiseCharmManager,
    		skillToSlotLevel,
    		updateCharmTable,
    		N_CHARM_SLOT_MAX,
    		columns,
    		charmManager,
    		charms,
    		init
    	});

    	$$self.$inject_state = $$props => {
    		if ("charmManager" in $$props) charmManager = $$props.charmManager;
    		if ("charms" in $$props) $$invalidate(0, charms = $$props.charms);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [charms, columns, updateCharmTable];
    }

    class CharmList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { updateCharmTable: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharmList",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get updateCharmTable() {
    		return this.$$.ctx[2];
    	}

    	set updateCharmTable(value) {
    		throw new Error("<CharmList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
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
    			add_location(track, file$3, 84, 4, 2189);
    			attr_dev(video, "id", video_id_value = "video" + /*index*/ ctx[0]);
    			attr_dev(video, "class", "video-preview svelte-syjktf");
    			if (video.src !== (video_src_value = /*videoData*/ ctx[1])) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "width", videoWidth);
    			attr_dev(video, "height", videoHeight);
    			attr_dev(video, "alt", video_alt_value = "preview" + /*index*/ ctx[0]);
    			attr_dev(video, "style", video_style_value = /*isVideoVisible*/ ctx[2] ? "" : "display: none");
    			add_location(video, file$3, 76, 2, 1922);
    			progress_1.value = /*progress*/ ctx[4];
    			attr_dev(progress_1, "class", "svelte-syjktf");
    			add_location(progress_1, file$3, 88, 4, 2237);
    			attr_dev(span, "class", "progress-text svelte-syjktf");
    			add_location(span, file$3, 89, 4, 2280);
    			add_location(div0, file$3, 87, 2, 2227);
    			attr_dev(div1, "class", "video-reader svelte-syjktf");
    			add_location(div1, file$3, 75, 0, 1893);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, video);
    			append_dev(video, track);
    			/*video_binding*/ ctx[8](video);
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
    			/*video_binding*/ ctx[8](null);
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
    			charmScanner.countCharms();

    			// console.log(nScanedCharms)
    			// insertScript = charmScanner.generateInsertScript()
    			$$invalidate(4, progress = 1);

    			// console.log(charmScanner.charms)
    			onFinish();

    			return;
    		}

    		capture.read(frame);
    		charmScanner.scan(frame);
    		seekFrames(1, FRAME_RATE);
    		$$invalidate(4, progress = (domVideo.currentTime - beginTime) / (endTime - beginTime));
    	};

    	const seekFrames = (nFrames, fps) => {
    		const currentFrame = domVideo.currentTime * fps;
    		const newPosition = 0.00001 + (currentFrame + nFrames) / fps;

    		// plus 0.00001 is workaround for safari
    		$$invalidate(3, domVideo.currentTime = Math.min(endTime, newPosition), domVideo);
    	};

    	const writable_props = ["nSplits", "index", "videoData", "isVideoVisible", "charmScanner", "onFinish"];

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
    		if ("videoData" in $$props) $$invalidate(1, videoData = $$props.videoData);
    		if ("isVideoVisible" in $$props) $$invalidate(2, isVideoVisible = $$props.isVideoVisible);
    		if ("charmScanner" in $$props) $$invalidate(6, charmScanner = $$props.charmScanner);
    		if ("onFinish" in $$props) $$invalidate(7, onFinish = $$props.onFinish);
    	};

    	$$self.$capture_state = () => ({
    		FRAME_RATE,
    		videoWidth,
    		videoHeight,
    		nSplits,
    		index,
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
    		if ("videoData" in $$props) $$invalidate(1, videoData = $$props.videoData);
    		if ("isVideoVisible" in $$props) $$invalidate(2, isVideoVisible = $$props.isVideoVisible);
    		if ("charmScanner" in $$props) $$invalidate(6, charmScanner = $$props.charmScanner);
    		if ("onFinish" in $$props) $$invalidate(7, onFinish = $$props.onFinish);
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
    			videoData: 1,
    			isVideoVisible: 2,
    			charmScanner: 6,
    			onFinish: 7
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

    		if (/*videoData*/ ctx[1] === undefined && !("videoData" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'videoData'");
    		}

    		if (/*charmScanner*/ ctx[6] === undefined && !("charmScanner" in props)) {
    			console.warn("<VideoReader> was created without expected prop 'charmScanner'");
    		}

    		if (/*onFinish*/ ctx[7] === undefined && !("onFinish" in props)) {
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
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (98:4) {#each $videoReaderProps as props}
    function create_each_block$1(ctx) {
    	let videoreader;
    	let current;
    	const videoreader_spread_levels = [/*props*/ ctx[22]];
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
    			? get_spread_update(videoreader_spread_levels, [get_spread_object(/*props*/ ctx[22])])
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
    		source: "(98:4) {#each $videoReaderProps as props}",
    		ctx
    	});

    	return block;
    }

    // (104:31) 
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
    		source: "(104:31) ",
    		ctx
    	});

    	return block;
    }

    // (102:4) {#if isScanFinished}
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
    		source: "(102:4) {#if isScanFinished}",
    		ctx
    	});

    	return block;
    }

    // (160:2) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Loading Files...";
    			add_location(div, file$2, 160, 4, 4510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(160:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (148:2) {#if fInitialized}
    function create_if_block(ctx) {
    	let div1;
    	let input;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Click to Select Movie";
    			set_style(input, "display", "none");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".mp4");
    			input.multiple = true;
    			attr_dev(input, "class", "svelte-1nkacec");
    			add_location(input, file$2, 149, 6, 4087);
    			if (img.src !== (img_src_value = "https://static.thenounproject.com/png/625182-200.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1nkacec");
    			add_location(img, file$2, 156, 6, 4304);
    			attr_dev(div0, "class", "svelte-1nkacec");
    			add_location(div0, file$2, 157, 6, 4418);
    			attr_dev(div1, "id", "upload");
    			attr_dev(div1, "class", "svelte-1nkacec");
    			add_location(div1, file$2, 148, 4, 4063);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			/*input_binding*/ ctx[14](input);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*change_handler*/ ctx[12], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[13]),
    					listen_dev(img, "click", /*click_handler*/ ctx[15], false, false, false),
    					listen_dev(div0, "click", /*click_handler_1*/ ctx[16], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*input_binding*/ ctx[14](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(148:2) {#if fInitialized}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let t1;
    	let div2;
    	let textarea;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
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
    		if (/*fInitialized*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			textarea = element("textarea");
    			t2 = space();
    			div1 = element("div");
    			t3 = text("Found ");
    			t4 = text(/*nScanedCharms*/ ctx[6]);
    			t5 = text(" charms in this scan.");
    			t6 = space();
    			if_block1.c();
    			attr_dev(div0, "id", "status");
    			attr_dev(div0, "class", "svelte-1nkacec");
    			add_location(div0, file$2, 96, 2, 2276);
    			attr_dev(textarea, "placeholder", "charms will be exported here");
    			textarea.value = /*exportData*/ ctx[7];
    			attr_dev(textarea, "class", "svelte-1nkacec");
    			add_location(textarea, file$2, 142, 6, 3872);
    			add_location(div1, file$2, 143, 6, 3955);
    			attr_dev(div2, "id", "result");
    			attr_dev(div2, "class", "svelte-1nkacec");
    			add_location(div2, file$2, 140, 2, 3819);
    			attr_dev(div3, "id", "scanner");
    			add_location(div3, file$2, 95, 0, 2255);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, textarea);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			append_dev(div3, t6);
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

    			if (!current || dirty & /*exportData*/ 128) {
    				prop_dev(textarea, "value", /*exportData*/ ctx[7]);
    			}

    			if (!current || dirty & /*nScanedCharms*/ 64) set_data_dev(t4, /*nScanedCharms*/ ctx[6]);

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
    			if (detaching) detach_dev(div3);
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

    const VIDEO_WIDTH = 1280; // switch のキャプチャ解像度
    const VIDEO_HEIGHT = 720;
    const VIDEO_FRAME_RATE = 29.97;

    function instance$2($$self, $$props, $$invalidate) {
    	let $videoReaderProps,
    		$$unsubscribe_videoReaderProps = noop,
    		$$subscribe_videoReaderProps = () => ($$unsubscribe_videoReaderProps(), $$unsubscribe_videoReaderProps = subscribe(videoReaderProps, $$value => $$invalidate(8, $videoReaderProps = $$value)), videoReaderProps);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_videoReaderProps());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharmScanner", slots, []);
    	const N_VIDEO_SPLITS = (navigator.hardwareConcurrency || 8) / 2;
    	let { charmScanner } = $$props;
    	let { charmManager } = $$props;
    	let { fInitialized } = $$props;
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
    			console.log(Date());
    			$$invalidate(4, currentFileIndex = i);
    			const file = files[i];
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
    		}

    		const charms = charmScanner.getCharms();
    		console.log(JSON.stringify(charms));
    		await charmManager.registerCharms(charms);
    		$$invalidate(5, isScanFinished = true);
    	}

    	function onFinishVideoRead() {
    		if (++countFinishVideoRead !== N_VIDEO_SPLITS) {
    			return;
    		}

    		isVideoReadFinished = true;
    	}

    	const writable_props = ["charmScanner", "charmManager", "fInitialized"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<CharmScanner> was created with unknown prop '${key}'`);
    	});

    	const change_handler = e => onFileSelected(e);

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
    		domInput.click();
    	};

    	$$self.$$set = $$props => {
    		if ("charmScanner" in $$props) $$invalidate(10, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(11, charmManager = $$props.charmManager);
    		if ("fInitialized" in $$props) $$invalidate(0, fInitialized = $$props.fInitialized);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		VideoReader,
    		VIDEO_WIDTH,
    		VIDEO_HEIGHT,
    		VIDEO_FRAME_RATE,
    		N_VIDEO_SPLITS,
    		charmScanner,
    		charmManager,
    		fInitialized,
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
    		$videoReaderProps
    	});

    	$$self.$inject_state = $$props => {
    		if ("charmScanner" in $$props) $$invalidate(10, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(11, charmManager = $$props.charmManager);
    		if ("fInitialized" in $$props) $$invalidate(0, fInitialized = $$props.fInitialized);
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
    		fInitialized,
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
    		charmManager,
    		change_handler,
    		input_change_handler,
    		input_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class CharmScanner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			charmScanner: 10,
    			charmManager: 11,
    			fInitialized: 0
    		});

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

    		if (/*charmManager*/ ctx[11] === undefined && !("charmManager" in props)) {
    			console_1.warn("<CharmScanner> was created without expected prop 'charmManager'");
    		}

    		if (/*fInitialized*/ ctx[0] === undefined && !("fInitialized" in props)) {
    			console_1.warn("<CharmScanner> was created without expected prop 'fInitialized'");
    		}
    	}

    	get charmScanner() {
    		throw new Error("<CharmScanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmScanner(value) {
    		throw new Error("<CharmScanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmManager() {
    		throw new Error("<CharmScanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmManager(value) {
    		throw new Error("<CharmScanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fInitialized() {
    		throw new Error("<CharmScanner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fInitialized(value) {
    		throw new Error("<CharmScanner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/NavOptions.svelte generated by Svelte v3.38.2 */

    const navOptions = [
    	// { tabTitle: 'Usage',   component: Usage },
    	{
    		tabTitle: "護石スキャン",
    		component: CharmScanner
    	},
    	{ tabTitle: "護石管理", component: CharmList },
    	{ tabTitle: "説明", component: Description }
    ];

    /* src/Nav.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/Nav.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (20:4) {#each navOptions as option, i}
    function create_each_block(ctx) {
    	let li;
    	let button;
    	let t0_value = /*option*/ ctx[6].tabTitle + "";
    	let t0;
    	let button_class_value;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "id", /*i*/ ctx[8]);

    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*currentNavOptionId*/ ctx[4] == /*i*/ ctx[8]
    			? "active nav-link p-2 ml-1"
    			: "nav-link p-2 ml-1") + " svelte-kkkgpk"));

    			attr_dev(button, "role", "tab");
    			add_location(button, file$1, 21, 8, 471);
    			attr_dev(li, "class", "nav-item svelte-kkkgpk");
    			add_location(li, file$1, 20, 6, 441);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			append_dev(button, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*switchComponent*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentNavOptionId*/ 16 && button_class_value !== (button_class_value = "" + (null_to_empty(/*currentNavOptionId*/ ctx[4] == /*i*/ ctx[8]
    			? "active nav-link p-2 ml-1"
    			: "nav-link p-2 ml-1") + " svelte-kkkgpk"))) {
    				attr_dev(button, "class", button_class_value);
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
    		id: create_each_block.name,
    		type: "each",
    		source: "(20:4) {#each navOptions as option, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let ul;
    	let t;
    	let div0;
    	let switch_instance;
    	let current;
    	let each_value = navOptions;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const switch_instance_spread_levels = [
    		{
    			fInitialized: /*fInitialized*/ ctx[0],
    			charmScanner: /*charmScanner*/ ctx[1],
    			charmManager: /*charmManager*/ ctx[2]
    		}
    	];

    	var switch_value = /*currentNavOption*/ ctx[3].component;

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
    			div1 = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(ul, "class", "nav nav-tabs svelte-kkkgpk");
    			add_location(ul, file$1, 18, 2, 373);
    			attr_dev(div0, "class", "nav-content svelte-kkkgpk");
    			add_location(div0, file$1, 32, 2, 754);
    			attr_dev(div1, "id", "container");
    			attr_dev(div1, "class", "svelte-kkkgpk");
    			add_location(div1, file$1, 17, 0, 350);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentNavOptionId, switchComponent, navOptions*/ 48) {
    				each_value = navOptions;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const switch_instance_changes = (dirty & /*fInitialized, charmScanner, charmManager*/ 7)
    			? get_spread_update(switch_instance_spread_levels, [
    					{
    						fInitialized: /*fInitialized*/ ctx[0],
    						charmScanner: /*charmScanner*/ ctx[1],
    						charmManager: /*charmManager*/ ctx[2]
    					}
    				])
    			: {};

    			if (switch_value !== (switch_value = /*currentNavOption*/ ctx[3].component)) {
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
    					mount_component(switch_instance, div0, null);
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			if (switch_instance) destroy_component(switch_instance);
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
    	let { fInitialized } = $$props;
    	let { charmScanner } = $$props;
    	let { charmManager } = $$props;
    	let currentNavOption = navOptions[2];
    	let currentNavOptionId = 2;

    	function switchComponent(e) {
    		$$invalidate(4, currentNavOptionId = e.srcElement.id);
    		$$invalidate(3, currentNavOption = navOptions[currentNavOptionId]);
    	}

    	const writable_props = ["fInitialized", "charmScanner", "charmManager"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fInitialized" in $$props) $$invalidate(0, fInitialized = $$props.fInitialized);
    		if ("charmScanner" in $$props) $$invalidate(1, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(2, charmManager = $$props.charmManager);
    	};

    	$$self.$capture_state = () => ({
    		navOptions,
    		fInitialized,
    		charmScanner,
    		charmManager,
    		currentNavOption,
    		currentNavOptionId,
    		switchComponent
    	});

    	$$self.$inject_state = $$props => {
    		if ("fInitialized" in $$props) $$invalidate(0, fInitialized = $$props.fInitialized);
    		if ("charmScanner" in $$props) $$invalidate(1, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(2, charmManager = $$props.charmManager);
    		if ("currentNavOption" in $$props) $$invalidate(3, currentNavOption = $$props.currentNavOption);
    		if ("currentNavOptionId" in $$props) $$invalidate(4, currentNavOptionId = $$props.currentNavOptionId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fInitialized,
    		charmScanner,
    		charmManager,
    		currentNavOption,
    		currentNavOptionId,
    		switchComponent
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			fInitialized: 0,
    			charmScanner: 1,
    			charmManager: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fInitialized*/ ctx[0] === undefined && !("fInitialized" in props)) {
    			console.warn("<Nav> was created without expected prop 'fInitialized'");
    		}

    		if (/*charmScanner*/ ctx[1] === undefined && !("charmScanner" in props)) {
    			console.warn("<Nav> was created without expected prop 'charmScanner'");
    		}

    		if (/*charmManager*/ ctx[2] === undefined && !("charmManager" in props)) {
    			console.warn("<Nav> was created without expected prop 'charmManager'");
    		}
    	}

    	get fInitialized() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fInitialized(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmScanner() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmScanner(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charmManager() {
    		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charmManager(value) {
    		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
<<<<<<< Updated upstream
    	let div;
    	let nav;
=======
    	let div0;
    	let nav;
    	let t2;
    	let div1;
>>>>>>> Stashed changes
    	let current;

    	const nav_spread_levels = [
    		{
    			fInitialized: /*fInitialized*/ ctx[0],
    			charmScanner: /*charmScanner*/ ctx[1],
    			charmManager: /*charmManager*/ ctx[2]
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
    			h1 = element("h1");
    			h1.textContent = `${TITLE}`;
    			t1 = space();
<<<<<<< Updated upstream
    			div = element("div");
    			create_component(nav.$$.fragment);
    			attr_dev(h1, "class", "svelte-1x3znbp");
    			add_location(h1, file, 25, 1, 548);
    			attr_dev(div, "id", "nav-wrapper");
    			attr_dev(div, "class", "svelte-1x3znbp");
    			add_location(div, file, 26, 2, 567);
    			attr_dev(main, "class", "svelte-1x3znbp");
    			add_location(main, file, 24, 0, 540);
=======
    			div0 = element("div");
    			create_component(nav.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			div1.textContent = `v${VERSION}`;
    			attr_dev(h1, "class", "svelte-16zfz7q");
    			add_location(h1, file, 26, 1, 572);
    			attr_dev(div0, "id", "nav-wrapper");
    			attr_dev(div0, "class", "svelte-16zfz7q");
    			add_location(div0, file, 27, 2, 591);
    			attr_dev(div1, "id", "version");
    			attr_dev(div1, "class", "svelte-16zfz7q");
    			add_location(div1, file, 30, 2, 689);
    			attr_dev(main, "class", "svelte-16zfz7q");
    			add_location(main, file, 25, 0, 564);
>>>>>>> Stashed changes
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
<<<<<<< Updated upstream
    			append_dev(main, div);
    			mount_component(nav, div, null);
=======
    			append_dev(main, div0);
    			mount_component(nav, div0, null);
    			append_dev(main, t2);
    			append_dev(main, div1);
>>>>>>> Stashed changes
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const nav_changes = (dirty & /*fInitialized, charmScanner, charmManager*/ 7)
    			? get_spread_update(nav_spread_levels, [
    					{
    						fInitialized: /*fInitialized*/ ctx[0],
    						charmScanner: /*charmScanner*/ ctx[1],
    						charmManager: /*charmManager*/ ctx[2]
    					}
    				])
    			: {};

    			nav.$set(nav_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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
<<<<<<< Updated upstream
=======
    const VERSION = 0.2;
>>>>>>> Stashed changes

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let fInitialized = false;
    	let charmScanner;
    	let charmManager;

    	// let updateCharmTable
    	window.addEventListener("load", async () => {
    		$$invalidate(1, charmScanner = new MHRiseCharmScanner());
    		$$invalidate(2, charmManager = new MHRiseCharmManager());
    		await charmScanner.init();
    		$$invalidate(0, fInitialized = true);
    	}); // updateCharmTable()

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		MHRiseCharmManager,
    		MHRiseCharmScanner,
    		Nav,
    		TITLE,
<<<<<<< Updated upstream
=======
    		VERSION,
>>>>>>> Stashed changes
    		fInitialized,
    		charmScanner,
    		charmManager
    	});

    	$$self.$inject_state = $$props => {
    		if ("fInitialized" in $$props) $$invalidate(0, fInitialized = $$props.fInitialized);
    		if ("charmScanner" in $$props) $$invalidate(1, charmScanner = $$props.charmScanner);
    		if ("charmManager" in $$props) $$invalidate(2, charmManager = $$props.charmManager);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fInitialized, charmScanner, charmManager];
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
