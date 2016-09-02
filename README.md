# take-oath

> "Promisify" that works

## Requirements

- ES6 (Node >= 6)

## Installation

```
npm i take-oath
```

## Examples

### Promisify a module

```javascript
const takeOath = require('take-oath')
const {readdir} = takeOath('fs')

readdir('/path/to/directory').then(files => {})
```

The module can be a function or an object.

### Promisify a function

```javascript
const takeOath = require('take-oath')

const inc = (number, callback) => {
  callback(number + 1)
}

takeOath(inc)(2).then(console.log) // 3
```

You can also bind the function to a context...

```javascript
const takeOath = require('take-oath')

const obj = {number: 1}

const inc = (callback) => {
  callback(this.number + 1)
}

takeOath(inc, obj)().then(console.log) // 2
```

### Promisify all functions in an Object

```javascript
const takeOath = require('take-oath')

const obj = {
  fn1: cb => cb('foo'),
  fn2: cb => cb('bar')
}

takeOath(obj).fn1().then(console.log) // foo
```
