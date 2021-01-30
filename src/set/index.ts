import { Server } from 'http'
import adaptor from '../adaptor'
import { RuntimeEnvironment } from '../adaptor/types'
import { Collection } from '../collection'
import { unwrapData } from '../data'
import { Ref } from '../ref'
import { ServerDate, SetValue } from '../value'

/**
 * Type of the data passed to the set function. It extends the model
 * allowing to set server date field value.
 */
export type SetModel<
  Model,
  Environment extends RuntimeEnvironment | undefined
> = {
  [Key in keyof Model]:
    | (Exclude<Model[Key], undefined> extends ServerDate // First, ensure ServerDate is properly set
        ? Environment extends 'node' // Date can be used only in the node environment
          ? Date | ServerDate
          : ServerDate
        : Model[Key] extends object // If it's an object, recursively pass through SetModel
        ? SetModel<Model[Key], Environment>
        : Model[Key])
    | SetValue<Model[Key]>
}

export type SetOptions<Environment extends RuntimeEnvironment | undefined> = {
  assertEnvironment?: Environment
}

/**
 * @param ref - the reference to the document to set
 * @param data - the document data
 */
async function set<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  ref: Ref<Model>,
  data: SetModel<Model, Environment>,
  options?: SetOptions<Environment>
): Promise<void>

/**
 * @param collection - the collection to set document in
 * @param id - the id of the document to set
 * @param data - the document data
 */
async function set<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  collection: Collection<Model>,
  id: string,
  data: SetModel<Model, Environment>,
  options?: SetOptions<Environment>
): Promise<void>

/**
 * Sets a document to the given data.
 *
 * ```ts
 * import { set, get, collection } from 'typesaurus'
 *
 * type User = { name: string }
 * const users = collection<User>('users')
 *
 * const userId = '00sHm46UWKObv2W7XK9e'
 * await set(users, userId, { name: 'Sasha Koss' })
 * console.log(await get(users, userId))
 * //=> { name: 'Sasha Koss' }
 * ```
 */
async function set<
  Model,
  Environment extends RuntimeEnvironment | undefined = undefined
>(
  collectionOrRef: Collection<Model> | Ref<Model>,
  idOrData: string | SetModel<Model, Environment>,
  maybeDataOrOptions?: SetModel<Model, Environment> | SetOptions<Environment>,
  maybeOptions?: SetOptions<Environment>
): Promise<void> {
  const a = await adaptor()
  let collection: Collection<Model>
  let id: string
  let data: SetModel<Model, Environment>
  let options: SetOptions<Environment> | undefined

  if (collectionOrRef.__type__ === 'collection') {
    collection = collectionOrRef as Collection<Model>
    id = idOrData as string
    data = maybeDataOrOptions as SetModel<Model, Environment>
    options = maybeOptions
  } else {
    const ref = collectionOrRef as Ref<Model>
    collection = ref.collection
    id = ref.id
    data = idOrData as SetModel<Model, Environment>
    options = maybeDataOrOptions as SetOptions<Environment> | undefined
  }

  if (
    options?.assertEnvironment &&
    a.environment !== options?.assertEnvironment
  )
    throw new Error(`Expected ${options?.assertEnvironment} environment`)

  const firestoreDoc = a.firestore.collection(collection.path).doc(id)
  await firestoreDoc.set(unwrapData(a, data))
}

export default set
