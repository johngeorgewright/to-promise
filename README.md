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

readdir('/path/to/directory').then(console.log)
```

The module can be a function or an object. `take-oath` is immutable in nature
and will not modify the original module in any way.

### Promisify a function

```javascript
const takeOath = require('take-oath')

const inc = (number, callback) => {
  callback(null, number + 1)
}

takeOath(inc)(2).then(console.log) // 3
```

You can also bind the function to a context...

```javascript
const takeOath = require('take-oath')

const obj = {number: 1}

const inc = function (callback) {
  callback(null, this.number + 1)
}

takeOath(inc, obj)().then(console.log) // 2
```

### Promisify all functions in an Object

```javascript
const takeOath = require('take-oath')

const obj = {
  fn1: cb => cb(null, 'foo'),
  fn2: cb => cb(new Error('bar'))
}

takeOath(obj).fn1().then(console.log) // foo
takeOath(obj).fn2().catch(console.error) // Error: bar
```

**Note**: `take-oath` is immutable in nature and will not modify the original
object.

## Cookbook

### Separating callback and promise methods

`take-oath` is fairly light weight and doesn't use any complex decisions on
whether the function should or should not be promisified. It is also immutable
by nature and will not modify the object. Therefore we recommend separating the
callback and promise style methods. Here's an example:

When using the `nedb` module to construct a datastore we have several callback
style functions on the datastore instance. However, when you don't pass the
callback it will return a chainable query instance. We'll need this to construct
more complex queries, but we may also want simple promise style methods for
simpler calls.

```javascript
// db.js

const promisify = require('take-oath')
const Datastore = require('nedb')
const db = new Datastore('./data.db')

db.promise = promisify(db)
module.exports = db
```

We've now got a datastore object as a module `./db.js`. The instance has both
the usual callback style methods and promise methods available on the `promise`
object.

```javascript
const db = require('./db')
const promisify = require('take-oath')

exports.getLatest = schemaVersion => {
  const query = db.findOne({schema: schemaVersion}).sort({insertedAt: -1})
  return promisify(query.exec, query)
}

exports.getAll = () => db.promise.findAll()
```

Now the above module can use the datastore in either way when appropriate.
