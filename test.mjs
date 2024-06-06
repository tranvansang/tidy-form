import {describe, test, mock} from 'node:test'
import makeForm from './index.mjs'
import assert from 'node:assert'

describe('makeForm()', () => {
	test('empty default', () => {
		const control = makeForm()
		assert.strictEqual(control.get('a'), undefined)

		control.set('a', 'b')
		assert.deepStrictEqual(control.get(), {a: 'b'})
		assert.deepStrictEqual(control.get(''), {a: 'b'})
	})
	test('subscription', () => {
		const fn = mock.fn()
		const control = makeForm()
		control.subscribe('a', fn)
		control.set('a', 'b')
		assert.strictEqual(fn.mock.calls[0].arguments[0], 'b')

		// should not fire listener
		control.set('b', 'c')
		assert.strictEqual(fn.mock.calls.length, 1)

		control.set('', {a: 'c'})
		assert.strictEqual(fn.mock.calls.length, 2)
		assert.strictEqual(fn.mock.calls[1].arguments[0], 'c')
	})
	test('deep subscription', () => {
		const control = makeForm()
		let fn

		// simple deep subscription
		fn = mock.fn()
		control.subscribe('a.b', fn)
		control.set('a', {b: 1})
		assert.strictEqual(fn.mock.calls[0].arguments[0], 1)

		// sub parent
		fn = mock.fn()
		control.subscribe('a.b', fn)
		control.set('a', {b: {c: 2}})
		assert.deepStrictEqual(fn.mock.calls[0].arguments[0], {c: 2})

		// sub child 1
		fn = mock.fn()
		control.subscribe('a.b.c.d', fn)
		control.set('a', {b: {c: {d: 3}}})
		assert.deepStrictEqual(fn.mock.calls[0].arguments[0], 3)

		// sub child 2
		fn = mock.fn()
		control.subscribe('a.b.c.d', fn)
		control.set('a', {b: {c: 2}})
		assert.deepStrictEqual(fn.mock.calls[0].arguments[0], undefined)

		// sub child 3
		fn = mock.fn()
		control.subscribe('a.b.c.d', fn)
		control.set('a.b', {c: {d: 3}})
		assert.deepStrictEqual(fn.mock.calls[0].arguments[0], 3)

		// fire on root
		fn = mock.fn()
		control.subscribe('c', fn)
		control.set('', {c: {d: 3}})
		assert.deepStrictEqual(fn.mock.calls[0].arguments[0], {d: 3})
	})
	test('fire order', () => {
		const control = makeForm()
		let cnt = 0
		let a, ab, abc, root

		control.subscribe(() => root = ++cnt)
		control.subscribe('a', () => a = ++cnt)
		control.subscribe('a.b', () => ab = ++cnt)
		control.subscribe('a.b.c', () => abc = ++cnt)

		control.set('a', {b: 1})
		assert.strictEqual(abc, 1)
		assert.strictEqual(ab, 2)
		assert.strictEqual(a, 3)
		assert.strictEqual(root, 4)
	})
})
