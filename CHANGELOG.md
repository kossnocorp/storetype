# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning].
This change log follows the format documented in [Keep a CHANGELOG].

[semantic versioning]: http://semver.org/
[keep a changelog]: http://keepachangelog.com/

## 8.0.0 - 2021-??-??

Typesaurus v8 includes two important changes that bring the type-safety to another level:

1. TODO

2. TODO

See below for details.

### Fixes

- Fixed `group` type to properly derive the collection model.

### Changed

- **BREAKING**: Use `lazyfire` for ESM-enabled web environments to make Firebase modules load on demand. It ensures maximum performance, but requires installation of additional dependency and change of application initialization.

  So, if you're using webpack or another ESM-enabled bundler, install `lazyfire`:

  ```bash
  npm install lazyfire --save
  # Or using Yarn:
  yarn add lazyfire
  ```

  And then change `firebase.initializeApp` to `configureApp`:

  ```diff
  -import * as firebase from 'firebase/app'
  -import 'firebase/firestore'
  +import { configureApp } from 'lazyfire'

  -firebase.initializeApp({
  +configureApp({
   // Firebase app configuration
  })
  ```

- **BREAKING**: Make TypeScript 3.8 the minimal supported version.

- **BREAKING**: `AnyUpdateValue` type was removed.

- **BREAKING**: `UpdateValue` type now accepts two type arguments: object and key instead of a single type.

- **BREAKING**: Disallowed using `value('remove')` on non-optional fields.

- **BREAKING**: Removed `AddModel` and `SetModel` in favor of universal `WriteModel`.

- **BREAKING**: `meta` argument in `doc` is again required.

- **BREAKING**: Make `environment` a required meta property.

- **BREAKING**: Moved `onMissing` to options in `getMany`.

- **BREAKING**: All modules now export functions as named exports instead of using `default`.

- **BREAKING**: `Query` type now exported from `typesaurus` or `typesaurus/types` instead of `typesaurus/query` and `typesaurus/onQuery`.

- **BREAKING**: Unless `firestoreData: true` is specified in the meta, `doc` will convert `undefined` to `null` in the data.

  The idea of the change is to match the Firestore behavior when composing a synthetic doc, which is helpful in tests or Typesaurus extensions.

- Export options types for all functions.

- `TransactionWriteFunction` no longer expect to return a promise.

- Allow quering optional fields, inluding nested map fields using `where`.

- Added `nullifyData` that deeply replaces `undefined` with `null` in the passed data. It used to match the Firestore behavior.

## 7.2.0 - 2021-05-25

- Replace deprecated `@firebase/rules-testing` with `@firebase/rules-unit-testing`.

## 7.1.0 - 2020-12-09

- Third argument in `doc` (`meta`) now optional.

## 7.0.0 - 2020-12-08

- **BREAKING**: [Transaction write functions now synchronous and don't return promises](https://github.com/kossnocorp/typesaurus/pull/64).

- Added `meta` to doc, which presents only in the web environment.

- [Added ability to query nested subcollection groups](https://github.com/kossnocorp/typesaurus/pull/52).

- [Added ability to access changes in `onAll` and `onQuery`](https://github.com/kossnocorp/typesaurus/pull/67).

## 6.2.0 - 2020-08-24

### Fixed

- [Fixed `onGetMany` notified only one time](https://github.com/kossnocorp/typesaurus/pull/66).

### Added

- Added `docId` constant-helper that allows to sort or filter by the document ID.

## 6.1.0 - 2020-07-27

### Added

- Added collection group support to `all` and `onAll`.

## 6.0.0 - 2020-04-16

### Changed

- **BREAKING**: When using with ESM-enabled bundler, you should transpile `node_modules`. TypeScript preserves many modern languages features when it compiles to ESM code. So if you have to support older browsers, use Babel to process the dependencies code.

- **BREAKING**: `add` now return `Ref` instead of `Doc` to avoid confusion that the returned data match the current database state which might be not a case when using with field values i.e. `value('serverDate')`.

- **BREAKING**: `set`, `transaction.set` and `batch.set` now return `Promise<void>` (or `void` in case of `batch.set`). The same reasoning as for the `add` (see above).

- **BREAKING**: `set`, `transaction.set` and `batch.set` now don't accept `merge` option. Instead use the new `upset` function that provides better typing and ensures data consistency.

- **BREAKING**: `value('serverDate')` now returns a simple object instead of monkey-patched `Date` instance.

- **BREAKING**: `ModelUpdate` renamed to `UpdateModel` for consitency with `SetModel` and `UpsetModel`.

- **BREAKING**: `ref` now don't generate id if the second argument is omitted, use `id` function to generate new id instead.

- `update` now allows passing partial data into nested fields. Previously only root fields were optional.

- Now the browser adaptor imports `firebase/app` and `firebase/firestore` on-demand (using ESM's `import()`) rather than in the root level of the library. That dramatically improves initial paint time and helps with bundle caching. Now every time you make a small change in the app, the user won't have to download `firestore` modules as well.

### Added

- Added ESM version of the code that enables tree-shaking.

- Added new `upset`, `batch.set` and `transaction.set` functions that sets or updates the value of given document. It replaces `merge` option available in the previous version of Typesaurus.

- Added new `id` function that generates random id for a document.

## 5.4.0 - 2020-04-14

### Fixes

- [Fixed `CollectionEntity` type definition](https://github.com/kossnocorp/typesaurus/pull/39).

### Added

- [Added `merge` option to `batch.set` and `transaction.set`](https://github.com/kossnocorp/typesaurus/pull/38).

## 5.3.0 - 2020-02-20

### Fixes

- [Fix union/remove update on an array of references](https://github.com/kossnocorp/typesaurus/pull/30).

### Added

- Added `onGetMany` function.

## 5.2.0 - 2020-02-04

- [Added testing module `typesaurus/testing`](https://typesaurus.com/modules/_testing_index_.html) with `injectTestingAdaptor` and `setApp` that allow to use Typesaurus with [`@w`](https://firebase.google.com/docs/rules/unit-tests#run_local_tests).

## 5.1.0 - 2020-01-27

### Added

- Added ability to use docs in cursors (`startAt`, `startAfter`, etc.). [#28](https://github.com/kossnocorp/typesaurus/pull/28)

## 5.0.0 - 2020-01-02

### Changed

- **BREAKING**: Rework the `subcollection` function to support nested subcollections. [#18](https://github.com/kossnocorp/typesaurus/pull/18)

- **BREAKING**: Rework the `transaction` function. Now it accepts two functions as arguments. The first function allows only reading, and another allows only writing. It will make it impossible to perform reads after writes, which would throw an exception as it's a Firebase limitation. [#16](https://github.com/kossnocorp/typesaurus/pull/16)

- Define the `transaction` function result type. [#16](https://github.com/kossnocorp/typesaurus/pull/16)

- Remove `@google-cloud/firestore`, `firebase`, and `firebase-admin` from the peer dependencies to get rid of unavoidable warnings when Typesaurus is used only in the web or Node.js environment. [#17](https://github.com/kossnocorp/typesaurus/pull/19)

## 4.1.0 - 2020-01-01

### Added

- Add `Batch` type that defines the object returned from the `batch` function.

## 4.0.1 - 2019-12-20

### Fixed

- Make `serverDate` value to actually call Firebase's `serverTimestamp` instead of passing current date.

## 4.0.0 - 2019-12-14

### Fixed

- Fix `array-contains` filter support in `where`.

### Changed

- **BREAKING**: `untypedWhereArrayContains` was removed in favor of native support of `array-contains` filter in `where`.

- **BREAKING**: Update Firebase dependencies to the latest versions:
  - `@google-cloud/firestore`: `>=2.6.0`
  - `firebase`: `>=7.5.0`
  - `firebase-admin`: `>=8.8.0`

### Added

- Added `in` and `array-contains-any` filters support to `where`. Read more about these filters in [the Firebase announcement](https://firebase.googleblog.com/2019/11/cloud-firestore-now-supports-in-queries.html).

## 3.0.0 - 2019-11-11

### Changed

- **BREAKING**: Remove deprecated `clear` that was renamed to `remove`.

- **BREAKING**: Return `null` instead of `undefined` when a document isn't found.

## 2.1.0 - 2019-11-05

### Changed

- Loose up peer dependency requirements. See [#5](https://github.com/kossnocorp/typesaurus/issues/5) for the reasoning.

### Added

- [Add `getMany` function](https://github.com/kossnocorp/typesaurus/pull/10). Kudos to [@thomastoye](https://github.com/thomastoye)!

## 2.0.0 - 2019-09-25

### Changed

- **BREAKING**: Move Firebase packages to the peer dependencies to prevent npm from installing two or more firebase-admin versions which cause obscure errors like "The default Firebase app does not exist".

## 1.2.0 - 2019-09-02

### Changed

- Now `ref` generates an id when one isn't passed.

## 1.1.0 - 2019-08-17

### Changed

- Rename `clear` to `remove` everywhere keeping `clear` as an alias which will be removed in the next major version.

### Added

- Export `field` from the package root

- Added support for `value` (i.e. `value('increment', 1)`) in the field paths.

- Add support for merge set that use the current document values as defaults:

  ```ts
  await set(user.ref, { name: 'Sasha', date: new Date(1987, 1, 11) })
  await set(user.ref, { name: 'Sasha' }, { merge: true })
  await get(user.ref)
  //=> { data: { name: 'Sasha', date: new Date(1987, 1, 11) }, ... }
  ```

## 1.0.0 - 2019-08-13

First public release.
