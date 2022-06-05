import { Typesaurus } from '.'
import { schema } from './adaptor/admin'
import { transaction } from './transaction'

describe('Typesaurus core', () => {
  describe('DB', () => {
    describe('constructor', () => {
      it('creates a db instance', async () => {
        //

        // Flat schema
        const db = schema(($) => ({
          users: $.collection<User>(),
          posts: $.collection<Post>()
        }))

        // With subcollectios
        const nestedDB = schema(($) => ({
          users: $.collection<User>(),

          posts: $.sub($.collection<Post>(), {
            comments: $.sub($.collection<Comment>(), {
              likes: $.collection<Like>()
            }),

            likes: $.collection<PostLike>()
          }),

          // updates: $.collection<Update>()
          updates: $.sub($.collection<Update>(), {
            // comments: $.collection<Comment>(),

            comments: $.sub($.collection<Comment>(), {
              likes: $.collection<Like>()
            })
          })
        }))

        // TODO: Problem with groups ^^^
        await nestedDB.groups.comments

        // Get all users
        await db.users.all()

        // Get a single document
        await db.users.get('sasha')

        await db.users.add(($) => ({
          name: 'Sfg',
          contacts: {
            email: 'asd'
          },
          createdAt: $.serverDate()
        }))

        // Subcollections example
        await nestedDB.posts('123').comments.get('comment-id')

        // Get few documents by ids
        await db.users.getMany(['sasha', 'lesha', 'tati'])

        // Quering
        const users = await db.users.query(($) => [
          $.where('name', '==', 'Sasha'),
          $.where(['contacts', 'emal'], '==', 'koss@nocorp.me'),
          $.order('name'),
          $.limit(1)
        ])

        // NOTE: no await, it's a promise (?)
        const sashaPromise = db.users.get('sasha')

        // 1. Get the document
        const sasha = await sashaPromise

        // 2. Subscribe to document
        sashaPromise
          .on((user, info) => {
            // Fresh user data
            user
          })
          .catch((error) => {
            // Do something with error
          })

        // Subscribe to a single document (real-time)
        const sashaUnsubscribe = db.users
          .get('sasha')
          .on((user, info) => {
            // Fresh user data
            user
          })
          .catch((error) => {
            // Do something with error
          })

        sashaUnsubscribe()

        db.users
          .getMany(['sasha', 'lesha', 'tati'], { onMissing: 'ignore' })
          .on((users) => {})

        await db.users.getMany(['sasha', 'lesha', 'tati'], {
          onMissing: 'ignore'
        })

        const offQuery = db.users
          .query(($) => [
            $.where('name', '==', 'Sasha'),
            $.where(['contacts', 'email'], '==', 'koss@nocorp.me'),
            $.order('name'),
            $.limit(1)
          ])
          .on((users) => {})
          .catch((error) => {})

        interface User {
          name: string
          contacts: {
            email: string
          }
          // Allow setting only server date on client,
          // but allow on server
          createdAt: Typesaurus.ServerDate
        }

        await db.users.add(($) => ({
          name: 'Sasha',
          contacts: { email: 'koss@nocorp.me' },
          createdAt: new Date()
        }))

        await db.users.add(($) => ({
          name: 'Sasha',
          contacts: { email: 'koss@nocorp.me' },
          // Force server date, a Date triggers type error
          createdAt: $.serverDate()
        }))

        await db.users.add(
          {
            name: 'Sasha',
            contacts: { email: 'koss@nocorp.me' },
            // Allow setting date as we're on server.
            // See `as: 'server'` below
            createdAt: new Date()
          },
          { as: 'server' }
        )

        // Add a document
        db.posts.add({ title: 'Hello, world!', text: 'Hello!' })

        // Subcollections example
        await nestedDB.posts('123').comments('qwe').likes.add({ userId: '123' })

        // Set the document
        db.posts.set('doc-id', { title: 'Hello, world!', text: 'Hello!' })

        // Update
        await db.users.update('sasha', {
          name: 'Alexander'
        })

        // Merge, unlike update it will NOT trigger error
        // if the 'sasha` document don't exists.
        await db.users.upset('sasha', {
          name: 'Sasha'
        })

        // Remove
        await db.users.remove('sasha')

        const addedUser = await db.users.add(($) => ({
          name: 'Sasha',
          contacts: { email: 'koss@nocorp.me' },
          createdAt: $.serverDate()
        }))

        await addedUser.remove()

        await db.users.set('sasha', ($) => ({
          name: 'Sasha',
          contacts: { email: 'koss@nocorp.me' },
          createdAt: $.serverDate()
        }))

        await db.users.set(
          'sasha',
          {
            name: 'Sasha',
            contacts: { email: 'koss@nocorp.me' },
            createdAt: new Date()
          },
          { as: 'server' }
        )

        await db.users.update('sasha', ($) => ({ name: 'Sasha' }), {
          as: 'server'
        })

        // const sasha = db.users.ref('sasha')

        await sasha.remove()

        await sasha.update({ name: 'Sasha' })

        await nestedDB.groups.likes

        // Transactions

        transaction(($) => {
          return $.execute(db.users).get('asd')
        }).then(($) => {
          $.execute(db.users).update('asd', {
            ame: 'Alexander'
          })

          $.execute(db.posts).remove('123')
        })
      })
    })
  })
})

interface Post {
  title: string
  text: string
}

interface Update {
  title: string
  text: string
}

interface Comment {
  text: string
}

interface PostLike extends Like {
  comment: string
}

interface Like {
  userId: string
}
