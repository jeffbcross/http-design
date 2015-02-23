# Http

_friend of the web since ‘91_

## Authors

By [Jeff Cross](https://github.com/jeffbcross) with much input from
[Caitlin Potter](https://github.com/caitp), [Ben Lesh](https://github.com/blesh),
[Igor Minar](https://github.com/igorminar), and other Angular team members. Jeff is the one
responsible for bad ideas and errors.

## Overview

Apps need a way to retrieve and change and assets from other places. Http is one of many reasonable
ways to accomplish this, and the most widely-available option for data access in the wild world wide
web. This doc is concerned with the Http collection of modules that will be part of Angular2,
heretofore referred to as Http.

The primary use cases for this library are:
  * Transactional data access, as opposed to continuous access provided by other means like
    WebSockets and Server-Sent Events
  * Facilitating fetching and manipulating of remote application models
  * Loading media into an application
  * Uploading files to servers

## Design Goals

### Simplicity

The tools in the Http toolbelt should be easy to comprehend from the start, easy to comprehend when
implementing advanced use cases, and easy to comprehend when reviewing someone else’s code.

### Platform Flexibility

Http should work as well in node.js as it works in a browser. In fact, it should be easy to make
work in any JavaScript environment that’s capable of http communication, with minimal work. It
should also be possible to use multiple underlying mechanisms in a single platform, like using JSONP
instead of XHR. And on a server, if an Angular2 app is being pre-rendered before being served,
perhaps the underlying Http mechanism would actually be connecting to the local filesystem,
database, or cache, to allow the app to re-use code without making unnecessary network calls.

### Testability

It should be easy to mock responses, verify requests made in order (and expressed in logical order
in tests), and execute tests synchronously.

### Performance

Inasmuch as is possible without introducing unreasonable magic or surprise to users, the Http lib
should be performance-conscious. Most of this will be accomplished by providing guidance or APIs to
tune performance, such as request cancellation, caching of resources, etc.

### Security

Since the library will target modern browsers, which have implemented many safeguards to prevent
XSRF and JSON vulnerabilities, Http will focus on exposing primitives to allow developers to add
security measures required for their application. The documentation for the library should make note
of what precautions users of the library should keep in mind to secure their applications.

### Feels Like Angular

Idioms and semantics should feel natural for users who are familiar with other Angular 2 APIs. Users
should expect the same design considerations and thoughtful implementation that characterizes the
rest of the framework. This may be the most appealing design goal, compared to other libraries.

### Love It or Leave It

Http is focused on accomplishing the established goals, and may not be the right fit for all
applications. So the rest of the core Angular2 framework should not give special treatment to Http,
so that developers can easily use the http library of their choice. Perhaps other parts of a broader
Angular2 data framework would be built with this Http implementation in mind, but it should be
possible to bridge other http libraries.

## Design Anti-Goals

### Only Understand Response Types

Http will not concern itself with the structure of data being sent or returned; it will only care
about the expected response type.

### Low Magic, Limited Scope

It should always be clear what the Http library is doing from looking at calls in code, without
worrying about how it has been configured somewhere else. Http should do as few things as possible,
and should not try to be too smart. Features like connection-retries should be made easy for
developers to manage, but should not be an automatic, opt-out feature of the library.

### Don’t Reinvent Wheels

Modern browsers have improved security features, increasingly improving caching ability, and baked-
in http caching (presuming servers send the correct headers). Http should defer as much work as
possible to browsers, and should provide logical hooks for developers to manage caching and headers
themselves.

Composable, Flat API Surface

Http may be accompanied by other libraries that provide features like
caching, data serialization, transformation, and validation. These tools should be used by
developers in conjunction with the Http library, and the Http library should not know or care how
they’re being used. In other words, Http can’t be configured to automatically leverage these tools
as part of a request/response lifecycle, though developers may define their own wrapper functions to
make certain processes seamless. Consequently, it’s up to developers to first fetch from a
proprietary cache before requesting from Http, if not relying on implicit browser cache mechanisms.



## Proposed Design

The primary building block of the Http implementation is a `Connection` object, which is created by
calling the `http` factory function, or another factory of the application's choosing. A
`Connection` instance represents a single request and response, and implements the `Observable`
interface.

Here is a simple example of loading a repository from Github's API:

```javascript
import {Http} from 'http';

class MyComponent {
  @Inject(Http);
  constructor(http:Http) {
    http('https://api.github.com/repos/angular/angular.js')
      .subscribe(function(res) {
        console.log(res.body);
      });
  }
}
```

The Http library will include the following `Connection` factories, and will provide an interface to
ensure third-party `Connection` implementations conform to the expected API.

 * Http
 * HttpJsonp
 * HttpNode
 * HttpMock
 * _HttpFetch_ TBD

### Connection

Connections are constructed with a single argument, either a url string, or a `ConnectionConfig`
object.

Using a callable function that accepts a single argument instead of instantiating connections via
"new" keyword enables creating connections in part of a functional chain without having to wrap the
instantiation in a closure. The requirement of using a factory function is only imposed on the
officially-supported `Connection` factories. Other conforming implementations may instantiate
Connections in whatever way suits the Connection, but the returned value should conform to the
`Observable` interface.

### `ConnectionConfig`

Connections implement the `Observable` interface, with the returned observable representing the
response. The `ConnectionConfig` can pass in optional observers to observe connection properties
"state", and "uploadProgress". The "progress" event of requests can be used to trigger calls to
onNext of the Connection Observer by setting the `getProgressively` property of the
`ConnectionConfig` to true.

```javascript
import {Http} from 'http';

class MyComponent {
  @Inject(Http);
  constructor(http:Http) {
    http({
      url: 'https://'
    })
  }
}
```

If the `ConnectionConfig` object contains has a property `getProgressively` with a value of "true,"
and the responseType is set to "text" or empty string, the observable sequence must be pushed to on
every request progress event, and must contain the full available response text. When the request
completes, the connection’s observer onComplete function should be called if present

Since subscribing to the Connection Observable returns a disposable object, if all subscriptions to
the observable are disposed prior to the underlying connection completing, the connection should
attempt to abort the connection, only for the sake of releasing the resources necessary to fulfill
the request. Aborting should not be relied upon to prevent an RPC from being called. The
`ConnectionConfig` can specify that a connection should persist even after subscriptions have been
disposed by setting the persistBeyondDisposal property to true.

### `BaseConnectionConfig`

The officially-supported connections will ship with an immutable `BaseConnectionConfig` object,
which can be used as a basis to create new `ConnectionConfig` objects, such as a shareable,
application-specific config. The `BaseConnectionConfig` will be immutable to prevent accidental
global state, such as one component in an application making changes to defaults, without another
component knowing about it. If an application needs a common default configuration different from
the provided base, it is encouraged as a best practice to create an injectable class derived from
the base config that can be shared across the app, and further copied for with Connection-instance-
specific properties.

The `BaseConnectionConfig` could also be replaced with a custom implementation in the Injector
during application bootstrap by creating a new binding.

```javascript
import {bootstrap} from 'angular2/angular2';
import {bind} from 'angular2/di';
import {MyAppConfig, MyAppComponent} from 'myapp';
import {BaseConnectionConfig} from 'http';

bootstrap(MyAppComponent, [
  bind(BaseConnectionConfig).toValue(MyAppConfig);
]);

```

Passed-in `ConnectionConfig` objects should be merged with the `BaseConnectionConfig` when creating
the `Connection`. Values from the `BaseConnectionConfig` object should replace undefined values in the
provided `ConnectionConfig` object. A `Connection` should throw an exception if the provided config
does not contain necessary values to execute a request.

### Annotations

### Types

#### `Connection` Interface

#### `ConnectionConfig` Interface

#### `BaseConnectionConfig` Class

#### `Response` Interface

#### `Observable` Interface

This will be a minimal subset of the RxJS `Observable` interface [found here](https://github.com/bor
isyankov/DefinitelyTyped/blob/8fea426543e19e19db32eb827a02d11bdab30383/rx/rx-lite.d.ts#L217).
Connections should all be able to upgrade to a compatible `Observable` interface if provided via
injection into the `Connection` class. This would be accomplished by binding the compatible
`Observable` class to the `Observable` token provided by the Http library prior to the `Connection`
being instantiated, such as at the `App Component` level or in the config passed to `bootstrap`.

```javascript
import {bind} from 'angular2/di';
import {bootstrap} from 'angular2/angular2';

boostrap(AppComponent, [
  bind(Observable).toValue(Rx.Observable)
]);

```

#### IDisposable Interface

[found here](https://github.com/borisyankov/DefinitelyTyped/blob/8fea426543e19e19db32eb827a02d11bdab30383/rx/rx-lite.d.ts#L66)

#### Testing with MockConnection

```javascript
describe(‘MyComponent’, function() {
  beforeEach(function() {

  });
});
```

### Performance Considerations

 * Connections in separate modules, load what you need
 * Abortable requests
 * Optionally cold connections

### Accessibility Considerations

### End User Experience Considerations

 * More insight into connection state to provide realtime status to users
 * Better support of streaming data
 * Better resilience in network flakes via `retry()`


### Mobile Considerations

### Caching

The cache requirements are different for Http in Angular 2 vs $http in Angular 1, since there is a
separate fetching mechanism for template loading. In Angular 1, every request for a component’s
template would make an http request that would try to grab the template from the $templateCache
service before making a network request. And even though Angular 2 supports fetching of modules,
which AngularJS 1 did not, these fetches will rely on ES6 `System.import` (or traceur equivalent),
not the Http library.

So Http will not be depended on by the core framework, and only needs to meet the needs of end-users
(developers), and other data access libraries that will be part of angular 2.



### JS/Dart-Specific Features



### Extensibility (Connection-swapping API, first-class JSONP, XHR, MockConnection) (Could use
annotations? @Connection(JSONP))

### Testability (Connection mocking)

 * In-band response (no "respondWhen" declared before tests)
 * Progressive response support

### Security

### Request/Response Transformation and Serialization

Use cases:
  * Append a session token to url for all requests to a certain host
  * Flatten a response from a single request, ie response "{data: []}" -> "[]"


(If using observable idioms, old way of an array of functions with same signature will not work)
(since a function could not be certain the structure after other functions have transformed it)
(Should requestTransforms and responseTransforms be part of the request config?)


### Authentication/Authorization

### Browser Support

## Recipes

### Request / Response Transformations

### Serialization

### Caching Responses and Reading from Cache

### Connection Retry / Backoff

(should be dynamic to not retry for specific auth codes, like 4xx)

### Synchronize to Local Database

### Transforming Requests
// Strip all headers if connection config contains arbitrary property
// Adding an XSRF token to requests
// Changing URLs

### Fetching in ServiceWorker

### Authentication

### Integration with Router Pipeline

### Integration with Templates

### Integration with Change Detection

### Short-polling

### Long-polling
//Use Observable.retryWhen?

### Making Requests within Observable Chain

### Bridging Request to ES6 Promise

### Incorporating into a Promise Chain

### Uploading a File

### Composing with EventSource

### Pre-Fetching Data

### with Annotation+Router Single Callback and Continuous Callback
