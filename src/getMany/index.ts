import adaptor from '../adaptor'
import { ServerTimestampsStrategy } from '../adaptor/types'
import { Collection } from '../collection'
import { wrapData } from '../data'
import { AnyDoc, doc, Doc, DocOptions } from '../doc'
import { ref } from '../ref'

export type OnMissing<Model> = ((id: string) => Model) | 'ignore'

export const defaultOnMissing: OnMissing<any> = (id) => {
  throw new Error(`Missing document with id ${id}`)
}

export type OnMissingOptions<Model> = {
  onMissing?: OnMissing<Model>
}

/**
 * Retrieves multiple documents from a collection.
 *
 * You can specify a strategy to handle missing documents by passing the `onMissing` argument.
 * By default, missing documents will throw an error. Other strategies:
 *
 *  * By providing `(id) => new MyModel(id, ...)`, you can provide a default value when a doc is missing
 *  * By providing `'ignore'`, missing documents are ignore and will be removed from the result
 *  * By providing `(id) => throw new CustomError(id)`, you can throw a a custom error
 *
 * ```ts
 * import { getMany, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * getMany(users, ['00sHm46UWKObv2W7XK9e', '00sHm46UWKObv2W7XK0d']).then(user => {
 *   console.log(user)
 *   //=> [ { __type__: 'doc', data: { name: 'Sasha' }, ... }, { __type__: 'doc', data: { name: 'Thomas' }, ... }]
 * })
 * ```
 *
 * @returns Promise to a list of found documents
 */
export default async function getMany<
  Model,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  ids: readonly string[],
  {
    onMissing = defaultOnMissing,
    ...options
  }: DocOptions<ServerTimestamps> & OnMissingOptions<Model> = {}
): Promise<AnyDoc<Model, boolean, ServerTimestamps>[]> {
  const a = await adaptor()

  if (ids.length === 0) {
    // Firestore#getAll doesn't like empty lists
    return Promise.resolve([])
  }

  const firestoreSnaps = await a.firestore.getAll(
    ...ids.map((id) => a.firestore.collection(collection.path).doc(id))
  )

  return firestoreSnaps
    .map((firestoreSnap) => {
      if (!firestoreSnap.exists) {
        if (onMissing === 'ignore') {
          return null
        } else {
          return doc(
            ref(collection, firestoreSnap.id),
            onMissing(firestoreSnap.id),
            {
              environment: a.environment,
              serverTimestamps: options?.serverTimestamps,
              ...a.getDocMeta(firestoreSnap)
            }
          )
        }
      }

      const firestoreData = a.getDocData(firestoreSnap, options)
      const data = firestoreData && (wrapData(a, firestoreData) as Model)
      return doc(ref(collection, firestoreSnap.id), data, {
        environment: a.environment,
        serverTimestamps: options?.serverTimestamps,
        ...a.getDocMeta(firestoreSnap)
      })
    })
    .filter((doc) => doc != null) as AnyDoc<Model, boolean, ServerTimestamps>[]
}