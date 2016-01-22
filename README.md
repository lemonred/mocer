# mocer [![Build Status](https://travis-ci.org/forsigner/mocer.svg?branch=master)](https://travis-ci.org/forsigner/mocer) [![NPM Version](http://img.shields.io/npm/v/mocer.svg?style=flat)](https://www.npmjs.org/package/mocer)

Setup a mock server easily.

Why use this module?
- Build a bridge between Frontend and Backend
- This allows for parallel development

## Usage

To use mocer, you has two choices: Cli or Middleware.

### Use as command line

#### Step 1 : install globally.

```
$ npm install -g mocer
```

#### Step 2 : create mock file
After create a server, you can add some md file to mocks dir, for example:

```bash
my-project
├── app.js
├── mocks
│   ├── users
│   │   ├── 1.GET.md
│   │   ├── 2.GET.md
│   │   └── 3.GET.md
│   ├── users.GET.md
│   ├── users.POST.md
│   └── users.PUT.md
└── package.json
```

#### Step 3 : start mock server

```
$ cd my-project/mocks
$ mocer --baseDir .
```

And boom!！ You will see something in you browser.


###  Use as A middleware for Node.js (browser-sync、express、 connect).

#### Step 1 : create a server
**if browser-sync**

```javascript
var mocer = require('mocer');
var gulp = require('gulp');
var browserSync = require('browser-sync').create();

// Static server
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
    baseDir: './',
    middleware: [
      mocer(__dirname + '/mocks')
    ]}
  });
});
```

**if express**

```javascript
var express = require('express');
var mocer = require('mocer');

var app = express();
app.use(mocer(__dirname + '/mocks'));
app.listen(3000);
```

**if connect**

```javascript
var connect = require('connect');
var mocer = require('mocer');

var app = connect();
app.use(mocer(__dirname + '/mocks'));
app.listen(3000);
```

#### Step 2 : create mock md file
After create a server, you can add some md file to mocks dir, for example:

```bash
my-project
├── app.js
├── mocks
│   ├── users
│   │   ├── 1.GET.md
│   │   └── 2.GET.md
│   ├── users.GET.md
│   ├── users.POST.md
│   └── users.PUT.md
└── package.json
```

#### Step 3 : enjoy it
After start your server, you can use it.

**For example 1 :**

`curl -i http://localhost:12306/users?_status=200` will get response:

```bash
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Date: Mon, 27 Jul 2015 16:23:34 GMT
Connection: keep-alive
Transfer-Encoding: chunked

[{
  "id": 1,
  "name": "foo",
  "email": "foo@gmail.com",
}, {
  "id": 2,
  "name": "bar",
  "email": "bar@gmail.com",
}]
```

`_status=200` mean that you get a response with http status code 200. By default, `_status` equal to `200`. so, `curl http://localhost:12306/users` will get a collect response too.

**For example 2 :**

`curl -X POST http://localhost:12306/users?_status=422` will get response:

```bash

HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json;charset=UTF-8
Date: Mon, 27 Jul 2015 16:22:45 GMT
Connection: keep-alive
Transfer-Encoding: chunked

{
  "code" : 1234,
  "description" : "bad email format"
}
```
