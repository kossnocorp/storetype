import adaptor from '../adaptor'
import type { Collection } from '../collection'
import { wrapData } from '../data'
import { AnyDoc, doc, Doc } from '../doc'
import { ref, Ref } from '../ref'
import type {
  DocOptions,
  OperationOptions,
  RuntimeEnvironment,
  ServerTimestampsStrategy
} from '../types'
import { assertEnvironment } from '../_lib/assertEnvironment'

type Options<
  Environment extends RuntimeEnvironment,
  ServerTimestamps extends ServerTimestampsStrategy
> = DocOptions<ServerTimestamps> & OperationOptions<Environment>

/**
 * @param ref - The reference to the document
 */
async function get<
  Model,
  Environment extends RuntimeEnvironment,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  ref: Ref<Model>,
  options?: Options<Environment, ServerTimestamps>
): Promise<Doc<Model> | null>

/**
 * @param collection - The collection to get document from
 * @param id - The document id
 */
async function get<
  Model,
  Environment extends RuntimeEnvironment,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collection: Collection<Model>,
  id: string,
  options?: Options<Environment, ServerTimestamps>
): Promise<Doc<Model> | null>

/**
 * Retrieves a document from a collection.
 *
 * ```ts
 * import { get, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * get(users, '00sHm46UWKObv2W7XK9e').then(user => {
 *   console.log(user)
 *   //=> { __type__: 'doc', data: { name: 'Sasha' }, ... }
 * })
 * // Or using ref:
 * get(currentUser.ref)
 * ```
 *
 * @returns Promise to the document or null if not found
 */
async function get<
  Model,
  Environment extends RuntimeEnvironment,
  ServerTimestamps extends ServerTimestampsStrategy
>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  maybeIdOrOptions?: string | Options<Environment, ServerTimestamps>,
  maybeOptions?: Options<Environment, ServerTimestamps>
): Promise<AnyDoc<
  Model,
  RuntimeEnvironment,
  boolean,
  ServerTimestamps
> | null> {
  const a = await adaptor()
  let collection: Collection<Model>
  let id: string
  let options: Options<Environment, ServerTimestamps> | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = maybeIdOrOptions as string
    options = maybeOptions
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    options = maybeIdOrOptions as
      | Options<Environment, ServerTimestamps>
      | undefined
  }

  assertEnvironment(a, options?.assertEnvironment)

  const firestoreDoc = a.firestore.collection(collection.path).doc(id)
  const firestoreSnap = await firestoreDoc.get()
  const firestoreData = a.getDocData(firestoreSnap, options)
  const data = firestoreData && (wrapData(a, firestoreData) as Model)
  return data
    ? doc(ref(collection, id), data, {
        environment: a.environment,
        serverTimestamps: options?.serverTimestamps,
        ...a.getDocMeta(firestoreSnap)
      })
    : null
}

export default get
