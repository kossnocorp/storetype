import assert from 'assert'
import { nanoid } from 'nanoid'
import { AnyModelData, Doc, doc } from '.'
import { assertType, TypeEqual } from '../../test/utils'
import { collection } from '../collection'
import { ref } from '../ref'
import type { ServerDate } from '../types'

describe('Doc', () => {
  const users = collection<User>('users')
  const groups = collection<Group>('groups')
  const libraries = collection<Library>('library')

  describe('doc', () => {
    it('creates doc object', () => {
      const userRef = ref(users, nanoid())
      const createdAt = new Date() as ServerDate
      const birthday = new Date(1987, 1, 11)

      assert.deepEqual(
        doc(
          userRef,
          { name: 'Sasha', createdAt, birthday },
          { environment: 'node' }
        ),
        {
          __type__: 'doc',
          ref: userRef,
          data: { name: 'Sasha', createdAt, birthday },
          environment: 'node'
        }
      )
    })

    it('converts all undefined to null', () => {
      const libraryRef = ref(libraries, nanoid())

      assert.deepStrictEqual(
        doc(
          libraryRef,
          {
            books: {
              '1984': {
                title: '1984',
                attributes: {
                  hopeless: true,
                  resolution: undefined
                }
              },
              'this-bright-future': undefined
            },
            returned: [
              undefined,
              {
                title: 'Brave New World',
                attributes: {
                  hopeless: true,
                  resolution: undefined
                }
              }
            ]
          },
          { environment: 'node' }
        ),
        {
          __type__: 'doc',
          ref: libraryRef,
          data: {
            books: {
              '1984': {
                title: '1984',
                attributes: {
                  hopeless: true,
                  resolution: null
                }
              },
              'this-bright-future': null
            },
            returned: [
              null,
              {
                title: 'Brave New World',
                attributes: {
                  hopeless: true,
                  resolution: null
                }
              }
            ]
          },
          environment: 'node'
        }
      )
    })

    it('pass data as is if it is Firestore data', () => {
      const libraryRef = ref(libraries, nanoid())

      assert.deepStrictEqual(
        doc(
          libraryRef,
          {
            books: {
              '1984': {
                title: '1984',
                attributes: {
                  hopeless: true,
                  resolution: undefined
                }
              },
              'this-bright-future': undefined
            },
            returned: [
              undefined,
              {
                title: 'Brave New World',
                attributes: {
                  hopeless: true,
                  resolution: undefined
                }
              }
            ]
          },
          {
            environment: 'node',
            firestoreData: true
          }
        ),
        {
          __type__: 'doc',
          ref: libraryRef,
          data: {
            books: {
              '1984': {
                title: '1984',
                attributes: {
                  hopeless: true,
                  resolution: undefined
                }
              },
              'this-bright-future': undefined
            },
            returned: [
              undefined,
              {
                title: 'Brave New World',
                attributes: {
                  hopeless: true,
                  resolution: undefined
                }
              }
            ]
          },
          environment: 'node',
          firestoreData: true
        }
      )
    })

    it('considers that data from cache might have nulls instead of dates', () => {
      const user: User = {
        name: 'Sasha',
        createdAt: new Date() as ServerDate,
        birthday: new Date(1987, 1, 11)
      }

      // Test dates in the node environment

      const nodeDoc = doc(ref(users, nanoid()), user, { environment: 'node' })
      assertType<TypeEqual<Date, typeof nodeDoc.data.createdAt>>(true)
      assertType<TypeEqual<Date | undefined, typeof nodeDoc.data.updatedAt>>(
        true
      )
      assertType<TypeEqual<Date, typeof nodeDoc.data.birthday>>(true)
      assertType<TypeEqual<Date | undefined, typeof nodeDoc.data.deathday>>(
        true
      )

      type TypeEqual<T, U> = Exclude<T, U> extends never
        ? Exclude<U, T> extends never
          ? true
          : false
        : false

      const expectType = <T>(_: T): void => undefined

      // Test dates within cached doc

      const webDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true
      })
      expectType<TypeEqual<Date | null, typeof webDoc.data.createdAt>>(true)
      assertType<
        TypeEqual<Date | null | undefined, typeof webDoc.data.updatedAt>
      >(true)
      assertType<TypeEqual<Date, typeof webDoc.data.birthday>>(true)
      assertType<TypeEqual<Date | undefined, typeof webDoc.data.deathday>>(true)

      // Test dates within not-cached doc

      const notCachedDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: false,
        hasPendingWrites: false
      })
      assertType<TypeEqual<Date, typeof notCachedDoc.data.createdAt>>(true)
      assertType<
        TypeEqual<Date | undefined, typeof notCachedDoc.data.updatedAt>
      >(true)
      assertType<TypeEqual<Date, typeof notCachedDoc.data.birthday>>(true)
      assertType<
        TypeEqual<Date | undefined, typeof notCachedDoc.data.deathday>
      >(true)

      // Test doc of an unknown type

      const unknownDoc = {} as Doc<User>

      assertType<TypeEqual<Date | null, typeof unknownDoc.data.createdAt>>(true)
      assertType<
        TypeEqual<Date | null | undefined, typeof unknownDoc.data.updatedAt>
      >(true)
      assertType<TypeEqual<Date, typeof unknownDoc.data.birthday>>(true)
      assertType<TypeEqual<Date | undefined, typeof unknownDoc.data.deathday>>(
        true
      )

      if (unknownDoc.environment === 'node') {
        assertType<TypeEqual<Date, typeof unknownDoc.data.createdAt>>(true)
        assertType<
          TypeEqual<Date | undefined, typeof unknownDoc.data.updatedAt>
        >(true)
        assertType<TypeEqual<Date, typeof unknownDoc.data.birthday>>(true)
        assertType<
          TypeEqual<Date | undefined, typeof unknownDoc.data.deathday>
        >(true)
      }

      if (!unknownDoc.fromCache) {
        assertType<TypeEqual<Date, typeof unknownDoc.data.createdAt>>(true)
        assertType<
          TypeEqual<Date | undefined, typeof unknownDoc.data.updatedAt>
        >(true)
        assertType<TypeEqual<Date, typeof unknownDoc.data.birthday>>(true)
        assertType<
          TypeEqual<Date | undefined, typeof unknownDoc.data.deathday>
        >(true)
      }
    })

    it('considers serverTimestamps property', () => {
      const user: User = {
        name: 'Sasha',
        createdAt: new Date() as ServerDate,
        birthday: new Date(1987, 1, 11)
      }

      const unknownDoc = {} as Doc<User>

      // Test estimate strategy

      const estimateDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true,
        serverTimestamps: 'estimate'
      })
      assertType<TypeEqual<Date, typeof estimateDoc.data.createdAt>>(true)
      if (unknownDoc.serverTimestamps === 'estimate') {
        assertType<TypeEqual<Date, typeof unknownDoc.data.createdAt>>(true)
      }

      // Test previous strategy

      const previousDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true,
        serverTimestamps: 'previous'
      })
      assertType<TypeEqual<Date | null, typeof previousDoc.data.createdAt>>(
        true
      )
      if (unknownDoc.serverTimestamps === 'previous') {
        assertType<TypeEqual<Date | null, typeof unknownDoc.data.createdAt>>(
          true
        )
      }

      // Test none strategy

      const noneDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true,
        serverTimestamps: 'none'
      })
      assertType<TypeEqual<Date | null, typeof noneDoc.data.createdAt>>(true)
      if (unknownDoc.serverTimestamps === 'none') {
        assertType<TypeEqual<Date | null, typeof unknownDoc.data.createdAt>>(
          true
        )
      }

      const noneButNotCachedDoc = doc(ref(users, nanoid()), user, {
        environment: 'web',
        fromCache: false,
        hasPendingWrites: true,
        serverTimestamps: 'none'
      })
      assertType<TypeEqual<Date, typeof noneButNotCachedDoc.data.createdAt>>(
        true
      )
      if (unknownDoc.serverTimestamps === 'none' && !unknownDoc.fromCache) {
        assertType<TypeEqual<Date, typeof unknownDoc.data.createdAt>>(true)
      }
    })

    it('considers dates nested in arrays in objects', () => {
      const president: User = {
        name: 'Sasha',
        createdAt: new Date() as ServerDate,
        birthday: new Date(1987, 1, 11)
      }

      const tati: User = {
        name: 'Tati',
        createdAt: new Date() as ServerDate,
        birthday: new Date(1989, 6, 10)
      }

      const group: Group = {
        head: { president },
        members: [president, tati]
      }

      // Test in the node environment

      const nodeDoc = doc(ref(groups, nanoid()), group, { environment: 'node' })
      assertType<TypeEqual<Date, typeof nodeDoc.data.head.president.birthday>>(
        true
      )
      assertType<
        TypeEqual<Date, ItemType<typeof nodeDoc.data.members>['birthday']>
      >(true)
      assertType<
        TypeEqual<Date | undefined, typeof nodeDoc.data.head.president.deathday>
      >(true)
      assertType<
        TypeEqual<
          Date | undefined,
          ItemType<typeof nodeDoc.data.members>['deathday']
        >
      >(true)

      // Test in the web environment

      const webDoc = doc(ref(groups, nanoid()), group, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true
      })
      assertType<TypeEqual<Date, typeof webDoc.data.head.president.birthday>>(
        true
      )
      assertType<
        TypeEqual<Date | null, typeof webDoc.data.head.president.createdAt>
      >(true)

      assertType<
        TypeEqual<Date, ItemType<typeof webDoc.data.members>['birthday']>
      >(true)
      assertType<
        TypeEqual<
          Date | null,
          ItemType<typeof webDoc.data.members>['createdAt']
        >
      >(true)

      // Test with the estimate strategy

      const estimateDoc = doc(ref(groups, nanoid()), group, {
        environment: 'web',
        fromCache: true,
        hasPendingWrites: true,
        serverTimestamps: 'estimate'
      })
      assertType<
        TypeEqual<Date, typeof estimateDoc.data.head.president.createdAt>
      >(true)
      assertType<
        TypeEqual<Date, ItemType<typeof estimateDoc.data.members>['createdAt']>
      >(true)

      // Test doc of an unknown type

      const unknownDoc = {} as Doc<Group>
      assertType<
        TypeEqual<Date | null, typeof unknownDoc.data.head.president.createdAt>
      >(true)
      assertType<
        TypeEqual<
          Date | null,
          ItemType<typeof unknownDoc.data.members>['createdAt']
        >
      >(true)

      if (unknownDoc.environment === 'node') {
        assertType<
          TypeEqual<Date, typeof unknownDoc.data.head.president.createdAt>
        >(true)
        assertType<
          TypeEqual<Date, ItemType<typeof unknownDoc.data.members>['createdAt']>
        >(true)
      }

      if (!unknownDoc.fromCache) {
        assertType<
          TypeEqual<Date, typeof unknownDoc.data.head.president.createdAt>
        >(true)
        assertType<
          TypeEqual<Date, ItemType<typeof unknownDoc.data.members>['createdAt']>
        >(true)
      }

      if (unknownDoc.serverTimestamps === 'estimate') {
        assertType<
          TypeEqual<Date, typeof unknownDoc.data.head.president.createdAt>
        >(true)
        assertType<
          TypeEqual<Date, ItemType<typeof unknownDoc.data.members>['createdAt']>
        >(true)
      }
    })
  })

  it('does not mangle types', () => {
    const data = {} as AnyModelData<{ field?: undefined }, boolean>
    assertType<TypeEqual<undefined, typeof data.field>>(true)
  })
})

interface User {
  name: string
  createdAt: ServerDate
  updatedAt?: ServerDate
  birthday: Date
  deathday?: Date
  state?: 'qwe' | 'asd' | undefined
}

interface Group {
  head: { president: User }
  members: User[]
}

interface Library {
  books: Record<string, Book | undefined>
  returned: Array<Book | undefined>
}

interface Book {
  title: string
  attributes: Record<string, string | boolean | undefined>
}

type ItemType<ArrayType> = ArrayType extends Array<infer Type> ? Type : never
