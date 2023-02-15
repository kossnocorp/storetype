import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  documentId,
  DocumentReference,
  endAt,
  endBefore,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  startAt,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { SubscriptionPromise } from '../../sp/index.ts'

export function schema(getSchema) {
  const schema = getSchema(schemaHelpers())
  return db(schema)
}

export class Collection {
  constructor(name, path) {
    this.type = 'collection'
    this.name = name
    this.path = path
    this.firebaseDB = getFirestore()

    this.update = (id, data, options) => {
      assertEnvironment(options?.as)
      const updateData =
        typeof data === 'function' ? data(updateHelpers()) : data
      if (!updateData) return

      const update = Array.isArray(updateData)
        ? updateFields(updateData)
        : updateData instanceof UpdateField
        ? updateFields([updateData])
        : updateData

      return updateDoc(
        this.firebaseDoc(id),
        unwrapData(this.firebaseDB, update)
      ).then(() => this.ref(id))
    }

    this.update.build = (id, options) => {
      assertEnvironment(options?.as)
      const fields = []
      return {
        ...updateHelpers('build', fields),
        run: () =>
          updateDoc(
            this.firebaseDoc(id),
            unwrapData(this.firebaseDB, updateFields(fields))
          ).then(() => this.ref(id))
      }
    }

    this.query = (queries, options) => {
      assertEnvironment(options?.as)
      const queriesResult = queries(queryHelpers())
      if (!queriesResult) return
      return _query(
        this.adapter(),
        [].concat(queriesResult).filter((q) => !!q)
      )
    }

    this.query.build = (options) => {
      assertEnvironment(options?.as)
      const queries = []
      return {
        ...queryHelpers('builder', queries),
        run: () => _query(this.adapter(), queries)
      }
    }
  }

  id(id) {
    if (id) return id
    else return Promise.resolve(doc(this.firebaseCollection()).id)
  }

  ref(id) {
    return new Ref(this, id)
  }

  doc(id, value, options) {
    if (!value && 'id' in id && 'data' in id && typeof id.data === 'function') {
      return this.doc(id.id, wrapData(id.data()))
    } else {
      assertEnvironment(options?.as)
      return new Doc(this, id, value)
    }
  }

  add(data, options) {
    assertEnvironment(options?.as)
    return addDoc(
      this.firebaseCollection(),
      writeData(this.firebaseDB, data)
    ).then((firebaseRef) => this.ref(firebaseRef.id))
  }

  set(id, data, options) {
    assertEnvironment(options?.as)
    return setDoc(this.firebaseDoc(id), writeData(this.firebaseDB, data)).then(
      () => this.ref(id)
    )
  }

  upset(id, data, options) {
    assertEnvironment(options?.as)
    return setDoc(this.firebaseDoc(id), writeData(this.firebaseDB, data), {
      merge: true
    }).then(() => this.ref(id))
  }

  remove(id) {
    return deleteDoc(this.firebaseDoc(id)).then(() => this.ref(id))
  }

  all(options) {
    assertEnvironment(options?.as)
    return all(this.adapter())
  }

  get(id, options) {
    assertEnvironment(options?.as)
    const doc = this.firebaseDoc(id)

    return new SubscriptionPromise({
      request: request({ kind: 'get', path: this.path, id }),

      get: async () => {
        const firebaseSnap = await getDoc(doc)
        const data = firebaseSnap.data()
        if (data) return new Doc(this, id, wrapData(data))
        return null
      },

      subscribe: (onResult, onError) =>
        onSnapshot(
          doc,
          (firebaseSnap) => {
            const data = firebaseSnap.data()
            if (data) onResult(new Doc(this, id, wrapData(data)))
            else onResult(null)
          },
          onError
        )
    })
  }

  many(ids, options) {
    assertEnvironment(options?.as)

    return new SubscriptionPromise({
      request: request({ kind: 'many', path: this.path, ids }),

      get: () => Promise.all(ids.map((id) => this.get(id))),

      subscribe: (onResult, onError) => {
        // Firestore#getAll doesn't like empty lists
        if (ids.length === 0) {
          onResult([])
          return () => {}
        }
        let waiting = ids.length
        const result = new Array(ids.length)
        const offs = ids.map((id, idIndex) =>
          this.get(id)
            .on((doc) => {
              result[idIndex] = doc
              if (waiting) waiting--
              if (waiting === 0) onResult(result)
            })
            .catch(onError)
        )
        return () => offs.map((off) => off())
      }
    })
  }

  adapter() {
    return {
      db: () => this.firebaseDB,
      collection: () => this.firebaseCollection(),
      doc: (snapshot) => new Doc(this, snapshot.id, wrapData(snapshot.data())),
      request: () => ({ path: this.path })
    }
  }

  firebaseCollection() {
    return collection(this.firebaseDB, this.path)
  }

  firebaseDoc(id) {
    return doc(this.firebaseDB, this.path, id)
  }
}

export class Ref {
  constructor(collection, id) {
    this.type = 'ref'
    this.collection = collection
    this.id = id

    this.update = (data, options) =>
      this.collection.update(this.id, data, options)

    this.update.build = (options) =>
      this.collection.update.build(this.id, options)
  }

  get(options) {
    return this.collection.get(this.id, options)
  }

  set(data, options) {
    return this.collection.set(this.id, data, options)
  }

  upset(data, options) {
    return this.collection.upset(this.id, data, options)
  }

  async remove() {
    return this.collection.remove(this.id)
  }
}

export class Doc {
  constructor(collection, id, data) {
    this.type = 'doc'
    this.collection = collection
    this.ref = new Ref(collection, id)
    this.data = data
    this.props = {
      environment: 'client',
      source: 'database', // TODO
      dateStrategy: 'none', // TODO
      pendingWrites: false // TODO
    }

    this.update = (data, options) => this.ref.update(data, options)

    this.update.build = (options) => this.ref.update.build(options)
  }

  get(options) {
    return this.ref.get(options)
  }

  set(data, options) {
    return this.ref.set(data, options)
  }

  upset(data, options) {
    return this.ref.upset(data, options)
  }

  remove() {
    return this.ref.remove()
  }

  test(props) {
    return Object.entries(props).every(
      ([key, value]) => this.props[key] === value
    )
  }

  narrow(cb) {
    const result = cb(this.data)
    if (result) return this
  }
}

export function all(adapter) {
  const firebaseCollection = adapter.collection()

  return new SubscriptionPromise({
    request: request({ kind: 'all', ...adapter.request() }),

    get: async () => {
      const snapshot = await getDocs(firebaseCollection)
      return snapshot.docs.map((doc) => adapter.doc(doc))
    },

    subscribe: (onResult, onError) =>
      onSnapshot(
        firebaseCollection,
        (firebaseSnap) => {
          const docs = firebaseSnap.docs.map((doc) => adapter.doc(doc))
          const changes = () =>
            firebaseSnap.docChanges().map((change) => ({
              type: change.type,
              oldIndex: change.oldIndex,
              newIndex: change.newIndex,
              doc:
                docs[
                  change.type === 'removed' ? change.oldIndex : change.newIndex
                ] ||
                // If change.type indicates 'removed', sometimes (not all the time) `docs` does not
                // contain the removed document. In that case, we'll restore it from `change.doc`:
                adapter.doc(
                  change.doc
                  // {
                  //   firestoreData: true,
                  //   environment: a.environment,
                  //   serverTimestamps: options?.serverTimestamps,
                  //   ...a.getDocMeta(change.doc)
                  // }
                )
            }))
          const meta = {
            changes,
            size: firebaseSnap.size,
            empty: firebaseSnap.empty
          }
          onResult(docs, meta)
        },
        onError
      )
  })
}

export function writeData(db, data) {
  return unwrapData(
    db,
    typeof data === 'function' ? data(writeHelpers()) : data
  )
}

export function writeHelpers() {
  return {
    serverDate: () => ({ type: 'value', kind: 'serverDate' }),

    remove: () => ({ type: 'value', kind: 'remove' }),

    increment: (number) => ({
      type: 'value',
      kind: 'increment',
      number
    }),

    arrayUnion: (values) => ({
      type: 'value',
      kind: 'arrayUnion',
      values: [].concat(values)
    }),

    arrayRemove: (values) => ({
      type: 'value',
      kind: 'arrayRemove',
      values: [].concat(values)
    })
  }
}

export function updateFields(fields) {
  return fields.reduce((acc, field) => {
    if (!field) return acc
    const { key, value } = field
    acc[Array.isArray(key) ? key.join('.') : key] = value
    return acc
  }, {})
}

class UpdateField {
  constructor(key, value) {
    this.key = key
    this.value = value
  }
}

export function updateHelpers(mode = 'helpers', acc) {
  function processField(value) {
    if (mode === 'helpers') {
      return value
    } else {
      // Builder mode
      acc.push(value)
    }
  }

  return {
    ...writeHelpers(),
    field: (...field) => ({
      set: (value) => processField(new UpdateField(field, value))
    })
  }
}

function schemaHelpers() {
  return {
    collection() {
      return {
        type: 'collection',
        sub(schema) {
          return { type: 'collection', schema }
        },
        name(name) {
          return {
            type: 'collection',
            name,
            sub(schema) {
              return { type: 'collection', schema }
            }
          }
        }
      }
    }
  }
}

function db(schema, nestedPath) {
  return Object.entries(schema).reduce(
    (enrichedSchema, [collectionName, plainCollection]) => {
      const name =
        typeof plainCollection.name === 'string'
          ? plainCollection.name
          : collectionName
      const collection = new Collection(
        name,
        nestedPath ? `${nestedPath}/${name}` : name
      )

      if ('schema' in plainCollection) {
        enrichedSchema[name] = new Proxy(() => {}, {
          get: (_target, prop) => {
            if (prop === 'schema') return plainCollection.schema
            else if (prop === 'sub') return subShortcut(plainCollection.schema)
            else return collection[prop]
          },
          has(_target, prop) {
            return prop in plainCollection
          },
          apply: (_target, _prop, [id]) =>
            db(plainCollection.schema, `${collection.path}/${id}`)
        })
      } else {
        enrichedSchema[collectionName] = collection
      }
      return enrichedSchema
    },
    {}
  )
}

function subShortcut(schema) {
  return Object.entries(schema).reduce(
    (shortcutsSchema, [path, schemaCollection]) => {
      shortcutsSchema[path] = {
        id(id) {
          if (id) return id
          else return Promise.resolve(doc(collection(getFirestore(), 'any')).id)
        }
      }

      if ('schema' in schemaCollection)
        shortcutsSchema[path].sub = subShortcut(schemaCollection.schema)

      return shortcutsSchema
    },
    {}
  )
}

export function _query(adapter, queries) {
  const firebaseQueries = []
  let cursors = []

  queries.forEach((query) => {
    switch (query.type) {
      case 'order': {
        const { field, method, cursors: queryCursors } = query
        firebaseQueries.push(
          orderBy(
            field[0] === '__id__' ? documentId() : field.join('.'),
            method
          )
        )

        if (queryCursors)
          cursors = cursors.concat(
            queryCursors.reduce((acc, cursor) => {
              if (!cursor) return acc
              const { type, position, value } = cursor
              return acc.concat({
                type,
                position,
                value:
                  typeof value === 'object' &&
                  value !== null &&
                  'type' in value &&
                  value.type == 'doc'
                    ? field[0] === '__id__'
                      ? value.ref.id
                      : field.reduce((acc, key) => acc[key], value.data)
                    : value
              })
            }, [])
          )
        break
      }

      case 'where': {
        const { field, filter, value } = query
        firebaseQueries.push(
          where(
            field[0] === '__id__' ? documentId() : field.join('.'),
            filter,
            unwrapData(adapter.db(), value)
          )
        )
        break
      }

      case 'limit': {
        firebaseQueries.push(limit(query.number))
        break
      }
    }

    return firebaseQueries
  }, [])

  let groupedCursors = []

  cursors.forEach((cursor) => {
    let methodValues = groupedCursors.find(
      ([position]) => position === cursor.position
    )
    if (!methodValues) {
      methodValues = [cursor.position, []]
      groupedCursors.push(methodValues)
    }
    methodValues[1].push(unwrapData(adapter.db(), cursor.value))
  })

  const firebaseCursors = []

  if (cursors.length && cursors.every((cursor) => cursor.value !== undefined))
    groupedCursors.forEach(([method, values]) => {
      firebaseCursors.push(
        (method === 'startAt'
          ? startAt
          : method === 'startAfter'
          ? startAfter
          : method === 'endAt'
          ? endAt
          : endBefore)(...values)
      )
    })

  const firebaseQuery = () =>
    query(adapter.collection(), ...firebaseQueries, ...firebaseCursors)

  return new SubscriptionPromise({
    request: request({
      kind: 'query',
      ...adapter.request(),
      queries: queries
    }),

    get: async () => {
      const firebaseSnap = await getDocs(firebaseQuery())
      return firebaseSnap.docs.map((firebaseSnap) =>
        adapter.doc(
          firebaseSnap
          // {
          //   firestoreData: true,
          //   environment: a.environment as Environment,
          //   serverTimestamps: options?.serverTimestamps,
          //   ...a.getDocMeta(firebaseSnap)
          // }
        )
      )
    },

    subscribe: (onResult, onError) => {
      let q
      try {
        q = firebaseQuery()
      } catch (error) {
        onError(error)
        return
      }

      return onSnapshot(
        q,
        (firebaseSnap) => {
          const docs = firebaseSnap.docs.map((firebaseSnap) =>
            adapter.doc(
              firebaseSnap
              // {
              //   firestoreData: true,
              //   environment: a.environment as Environment,
              //   serverTimestamps: options?.serverTimestamps,
              //   ...a.getDocMeta(firebaseSnap)
              // }
            )
          )
          const changes = () =>
            firebaseSnap.docChanges().map((change) => ({
              type: change.type,
              oldIndex: change.oldIndex,
              newIndex: change.newIndex,
              doc:
                docs[
                  change.type === 'removed' ? change.oldIndex : change.newIndex
                ] ||
                // If change.type indicates 'removed', sometimes (not all the time) `docs` does not
                // contain the removed document. In that case, we'll restore it from `change.doc`:
                adapter.doc(
                  change.doc
                  // {
                  //   firestoreData: true,
                  //   environment: a.environment,
                  //   serverTimestamps: options?.serverTimestamps,
                  //   ...a.getDocMeta(change.doc)
                  // }
                )
            }))
          const meta = {
            changes,
            size: firebaseSnap.size,
            empty: firebaseSnap.empty
          }
          onResult(docs, meta)
        },
        onError
      )
    }
  })
}

export function queryHelpers(mode = 'helpers', acc) {
  function processQuery(value) {
    if (mode === 'helpers') {
      return value
    } else {
      // Builder mode
      acc.push(value)
    }
  }

  function where(field, filter, value) {
    return processQuery({
      type: 'where',
      field,
      filter,
      value
    })
  }

  return {
    field: (...field) => ({
      less: where.bind(null, field, '<'),
      lessOrEqual: where.bind(null, field, '<='),
      equal: where.bind(null, field, '=='),
      not: where.bind(null, field, '!='),
      more: where.bind(null, field, '>'),
      moreOrEqual: where.bind(null, field, '>='),
      in: where.bind(null, field, 'in'),
      notIn: where.bind(null, field, 'not-in'),
      contains: where.bind(null, field, 'array-contains'),
      containsAny: where.bind(null, field, 'array-contains-any'),

      order: (maybeMethod, maybeCursors) =>
        processQuery({
          type: 'order',
          field,
          method: typeof maybeMethod === 'string' ? maybeMethod : 'asc',
          cursors: maybeCursors
            ? [].concat(maybeCursors)
            : maybeMethod && typeof maybeMethod !== 'string'
            ? [].concat(maybeMethod)
            : undefined
        })
    }),

    limit: (number) => processQuery({ type: 'limit', number }),

    startAt: (value) => ({ type: 'cursor', position: 'startAt', value }),

    startAfter: (value) => ({ type: 'cursor', position: 'startAfter', value }),

    endAt: (value) => ({ type: 'cursor', position: 'endAt', value }),

    endBefore: (value) => ({ type: 'cursor', position: 'endBefore', value }),

    docId: () => '__id__'
  }
}

/**
 * Creates Firestore document from a reference.
 *
 * @param ref - The reference to create Firestore document from
 * @returns Firestore document
 */
export function refToFirestoreDocument(db, ref) {
  return doc(db, ref.collection.path, ref.id)
}

export const pathRegExp = /^(?:(.+\/)?(.+))\/(.+)$/

/**
 * Creates a reference from a Firestore path.
 *
 * @param path - The Firestore path
 * @returns Reference to a document
 */
export function pathToRef(path) {
  const captures = path.match(pathRegExp)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, nestedPath, name, id] = captures
  return new Ref(new Collection(name, (nestedPath || '') + name), id)
}

export function pathToDoc(path, data) {
  const captures = path.match(pathRegExp)
  if (!captures) throw new Error(`Can't parse path ${path}`)
  const [, nestedPath, name, id] = captures
  return new Doc(new Collection(name, (nestedPath || '') + name), id, data)
}

/**
 * Converts Typesaurus data to Firestore format. It deeply traverse all the data and
 * converts values to compatible format.
 *
 * @param data - the data to convert
 * @returns the data in Firestore format
 */
export function unwrapData(db, data) {
  if (data && typeof data === 'object') {
    if (data.type === 'ref') {
      return refToFirestoreDocument(db, data)
    } else if (data.type === 'value') {
      const fieldValue = data
      switch (fieldValue.kind) {
        case 'remove':
          return deleteField()

        case 'increment':
          return increment(fieldValue.number)

        case 'arrayUnion':
          return arrayUnion(...unwrapData(db, fieldValue.values))

        case 'arrayRemove':
          return arrayRemove(...unwrapData(db, fieldValue.values))

        case 'serverDate':
          return serverTimestamp()
      }
    } else if (data instanceof Date) {
      return Timestamp.fromDate(data)
    }

    const isArray = Array.isArray(data)
    const unwrappedObject = Object.assign(isArray ? [] : {}, data)

    Object.keys(unwrappedObject).forEach((key) => {
      unwrappedObject[key] = unwrapData(db, unwrappedObject[key])
    })

    return unwrappedObject
  } else if (data === undefined) {
    return '%%undefined%%'
  } else {
    return data
  }
}

/**
 * Converts Firestore data to Typesaurus format. It deeply traverse all the
 * data and converts values to compatible format.
 *
 * @param data - the data to convert
 * @returns the data in Typesaurus format
 */
export function wrapData(data, ref = pathToRef) {
  if (data instanceof DocumentReference) {
    return ref(data.path)
  } else if (data instanceof Timestamp) {
    return data.toDate()
  } else if (data && typeof data === 'object') {
    const wrappedData = Object.assign(Array.isArray(data) ? [] : {}, data)
    Object.keys(wrappedData).forEach((key) => {
      wrappedData[key] = wrapData(wrappedData[key], ref)
    })
    return wrappedData
  } else if (typeof data === 'string' && data === '%%undefined%%') {
    return undefined
  } else {
    return data
  }
}

export function assertEnvironment(environment) {
  if (environment && environment !== 'client')
    throw new Error(`Expected ${environment} environment`)
}

function request(payload) {
  return { type: 'request', ...payload }
}