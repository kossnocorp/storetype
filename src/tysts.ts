import { schema, Typesaurus } from '.'
import type { TypesaurusCore as Core } from './types/core'
import type { TypesaurusUtils as Utils } from './types/utils'

interface Post {
  title: string
  text: string
  likeIds?: string[]
  likes?: number
  tags?: Array<string | undefined>
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

interface Account {
  name: string
  createdAt: Typesaurus.ServerDate

  contacts: {
    email: string
    phone?: string
  }

  emergencyContacts?: {
    name: string
    phone: string
    email?: string
  }

  nested1Required: {
    nested12Required: {
      hello: string
      world?: string
    }
  }

  nested1Optional?: {
    required12: string
    nested12Optional?: {
      hello: string
      world?: string
    }
  }

  counters?: {
    [postId: string]: { likes?: number }
  }
}

interface User {
  name: string
  contacts: {
    email: string
    phone?: string
  }
  birthdate?: Date
  // Allow setting only server date on client,
  // but allow on server
  createdAt: Typesaurus.ServerDate
}

interface Organization {
  counters?: {
    drafts: number
    scheduled: number
    published: number
  }
}

interface TextContent {
  type: 'text'
  text: string
  public?: boolean
}

interface ImageContent {
  type: 'image'
  src: string
  public?: boolean
}

interface AppStats {
  users: number
}

interface CustomCollection {
  hello: 'world'
}

const customCollection = 'customCollectionName'

// Flat schema
const db = schema(($) => ({
  users: $.collection<User>(),
  posts: $.collection<Post>(),
  accounts: $.collection<Account>(),
  organizations: $.collection<Organization>(),
  content: $.collection<[TextContent, ImageContent]>(),
  appStats: $.collection<AppStats, 'appStats'>(),
  [customCollection]: $.collection<CustomCollection>()
}))

async function custom() {
  // Creating custom collection

  // Via constant named property

  const doc = await db[customCollection].get(await db[customCollection].id())
  db[customCollection].get
  db.customCollectionName.get
  doc?.data.hello

  // Via name variable

  async function createDb(collection: string) {
    const customDB = schema(($) => ({
      users: $.collection<User>(),
      customCollection: $.collection<CustomCollection>().name(collection)
    }))

    const doc = await customDB.customCollection.get(
      await customDB.customCollection.id()
    )

    doc?.data.hello
  }
}

async function doc() {
  const user = db.users.doc(db.users.id('sasha'), {
    name: 'Sasha',
    contacts: {
      email: 'koss@nocorp.me'
    },
    createdAt: new Date() as Typesaurus.ServerDate
  })

  // Runtime environment

  if (user.test({ environment: 'server' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.test({ source: 'database' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.test({ dateStrategy: 'estimate' })) {
    user.data.createdAt.getDay()
  } else if (user.test({ dateStrategy: 'previous' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  assertType<TypeEqual<typeof user.data.birthdate, Date | undefined>>(true)

  // Variable shape

  const contentId = await db.content.id()

  const contentDoc = db.content.doc(contentId, {
    type: 'image',
    src: 'https://example.com/image.png'
  })

  db.content.doc(contentId, {
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error
    hello: 'world'
  })

  // @ts-expect-error
  db.content.doc(contentId, {
    type: 'image',
    src: 'https://example.com/image.png',
    text: 'Nope'
  })

  if (contentDoc.data.type === 'image') {
    contentDoc.data.src

    if (typeof contentDoc.data.text === 'string')
      // @ts-expect-error - text is never
      contentDoc.data.text.length
  } else {
    contentDoc.data.text

    if (typeof contentDoc.data.src === 'string')
      // @ts-expect-error - src is never
      contentDoc.data.src.length
  }

  // Doc as server

  const serverUser = db.users.doc(
    db.users.id('sasha'),
    {
      name: 'Sasha',
      contacts: {
        email: 'koss@nocorp.me'
      },
      createdAt: new Date()
    },
    { as: 'server' }
  )

  serverUser.data.createdAt.getDay()

  // Fixed string ids

  db.appStats.doc('appStats', { users: 123 })
}

async function get() {
  const user = await db.users.get(db.users.id('sasha'))
  if (!user) return

  // Runtime environment

  if (user.test({ environment: 'server' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.test({ source: 'database' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.test({ dateStrategy: 'estimate' })) {
    user.data.createdAt.getDay()
  } else if (user.test({ dateStrategy: 'previous' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Reading as server

  db.users.get(db.users.id('sasha')).then((user) => {
    if (!user) return
    assertType<TypeEqual<Date | null, typeof user.data.createdAt>>(true)
  })

  db.users.get(db.users.id('sasha'), { as: 'server' }).then((user) => {
    if (!user) return
    assertType<TypeEqual<Date, typeof user.data.createdAt>>(true)
  })

  // ...via doc

  user.get().then((user) => {
    if (!user) return
    assertType<TypeEqual<Date | null, typeof user.data.createdAt>>(true)
  })

  user.get({ as: 'server' }).then((user) => {
    if (!user) return
    assertType<TypeEqual<Date, typeof user.data.createdAt>>(true)
  })

  // Variable shape

  const content = await db.content.get(db.content.id('42'))
  if (!content) return

  // Can't update variable model shape without narrowing

  content?.update({
    public: true
  })

  content?.update({
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  // Narrowing

  const textContent = content?.narrow<TextContent>(
    (data) => data.type === 'text' && data
  )

  if (textContent) {
    // @ts-expect-error - can't update - we narrowed down to text type
    await textContent.update({ src: 'Nope' })

    await textContent.update({ text: 'Yup' })
  }
}

async function many() {
  const [user] = await db.users.many([db.users.id('sasha')])
  if (!user) return

  // Runtime environment

  if (user.test({ environment: 'server' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.test({ source: 'database' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.test({ dateStrategy: 'estimate' })) {
    user.data.createdAt.getDay()
  } else if (user.test({ dateStrategy: 'previous' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Reading as server

  db.users.many([db.users.id('sasha')]).then((users) => {
    const user = users[0]
    if (!user) return
    assertType<TypeEqual<Date | null, typeof user.data.createdAt>>(true)
  })

  db.users.many([db.users.id('sasha')], { as: 'server' }).then((users) => {
    const user = users[0]
    if (!user) return
    assertType<TypeEqual<Date, typeof user.data.createdAt>>(true)
  })

  // Variable shape

  const [content] = await db.content.many([db.content.id('42')])
  if (!content) return

  // Can't update variable model shape without narrowing

  content?.update({
    public: true
  })

  content?.update({
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  // Narrowing

  const textContent = content?.narrow<TextContent>(
    (data) => data.type === 'text' && data
  )

  if (textContent) {
    // @ts-expect-error - can't update - we narrowed down to text type
    await textContent.update({ src: 'Nope' })

    await textContent.update({ text: 'Yup' })
  }
}

async function all() {
  const [user] = await db.users.all()
  if (!user) return

  // Runtime environment

  if (user.test({ environment: 'server' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.test({ source: 'database' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.test({ dateStrategy: 'estimate' })) {
    user.data.createdAt.getDay()
  } else if (user.test({ dateStrategy: 'previous' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Reading as server

  db.users.all().then((users) => {
    const user = users[0]
    if (!user) return
    assertType<TypeEqual<Date | null, typeof user.data.createdAt>>(true)
  })

  db.users.all({ as: 'server' }).then((users) => {
    const user = users[0]
    if (!user) return
    assertType<TypeEqual<Date, typeof user.data.createdAt>>(true)
  })

  // Simple query

  await db.users.all()

  // Variable shape

  const [content] = await db.content.all()
  if (!content) return

  // Can't update variable model shape without narrowing

  content?.update({
    public: true
  })

  content?.update({
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  // Narrowing

  const textContent = content?.narrow<TextContent>(
    (data) => data.type === 'text' && data
  )

  if (textContent) {
    // @ts-expect-error - can't update - we narrowed down to text type
    await textContent.update({ src: 'Nope' })

    await textContent.update({ text: 'Yup' })
  }
}

async function query() {
  const [user] = await db.users.query(($) => $.field('name').equal('Sasha'))
  if (!user) return

  // Runtime environment

  if (user.test({ environment: 'server' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Source

  if (user.test({ source: 'database' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Server date strategy

  if (user.test({ dateStrategy: 'estimate' })) {
    user.data.createdAt.getDay()
  } else if (user.test({ dateStrategy: 'previous' })) {
    user.data.createdAt.getDay()
  } else {
    // @ts-expect-error
    user.data.createdAt.getDay()
  }

  // Querying as server

  db.users
    .query(($) => $.field('name').equal('Sasha'))
    .then((users) => {
      const user = users[0]
      if (!user) return
      assertType<TypeEqual<Date | null, typeof user.data.createdAt>>(true)
    })

  db.users
    .query(($) => $.field('name').equal('Sasha'), { as: 'server' })
    .then((users) => {
      const user = users[0]
      if (!user) return
      assertType<TypeEqual<Date, typeof user.data.createdAt>>(true)
    })

  // Basic query

  await db.users.query(($) => [
    $.field('name').equal('Sasha'),
    // @ts-expect-error
    $.field('contacts', 'emal').equal('koss@nocorp.me'),
    $.field('name').order(),
    $.limit(1)
  ])

  // Server date

  await db.accounts.query(($) => $.field('createdAt').equal(new Date()))

  await db.accounts.query(($) =>
    $.field('createdAt').order('asc', $.startAt(new Date()))
  )

  // Cursors

  await db.users.query(($) => $.field('name').order($.startAt('Sasha')))

  await db.users.query(($) => $.field('name').order($.endAt('Sasha')))

  await db.users.query(($) =>
    $.field('name').order([$.startAt('Sasha'), $.endAt('Tati')])
  )

  await db.users.query(($) =>
    // @ts-expect-error - can't use start cursor after end cursor
    $.field('name').order([$.endAt('Tati'), $.startAt('Sasha')])
  )

  const nameCursor: string | undefined = 'hello'
  const useCursor = false

  await db.users.query(($) =>
    $.field('name').order(nameCursor && $.startAt(nameCursor))
  )

  await db.users.query(($) =>
    $.field('name').order(useCursor && $.startAt('Sasha'))
  )

  await db.users.query(($) =>
    $.field('name').order(useCursor ? $.startAt('Sasha') : undefined)
  )

  await db.users.query(($) =>
    $.field('name').order(nameCursor ? [$.startAfter(nameCursor)] : [])
  )

  // Falsy cursors

  await db.users.query(($) =>
    $.field('name').order(nameCursor && $.startAfter(nameCursor))
  )

  await db.users.query(($) => [
    $.field('name').order(undefined),
    $.field('name').order(null),
    $.field('name').order(false),
    $.field('name').order(''),
    $.field('name').order(0)
  ])

  await db.users.query(($) => [
    $.field('name').order([undefined]),
    $.field('name').order([null]),
    $.field('name').order([false]),
    $.field('name').order(['']),
    $.field('name').order([0])
  ])

  await db.users.query(($) => [
    $.field('name').order([undefined, $.endAt('Sasha')]),
    $.field('name').order([null, $.endAt('Sasha')]),
    $.field('name').order([false, $.endAt('Sasha')]),
    $.field('name').order(['', $.endAt('Sasha')]),
    $.field('name').order([0, $.endAt('Sasha')])
  ])

  await db.users.query(($) => [
    $.field('name').order([$.startAt('Sasha'), undefined]),
    $.field('name').order([$.startAt('Sasha'), null]),
    $.field('name').order([$.startAt('Sasha'), false]),
    $.field('name').order([$.startAt('Sasha'), '']),
    $.field('name').order([$.startAt('Sasha'), 0])
  ])

  await db.users.query(($) => [
    $.field('name').order([undefined, undefined]),
    $.field('name').order([null, null]),
    $.field('name').order([false, false]),
    $.field('name').order(['', '']),
    $.field('name').order([0, 0])
  ])

  // Subscription

  const offQuery = db.users
    .query(($) => [
      $.field('name').equal('Sasha'),
      $.field('contacts', 'email').equal('koss@nocorp.me'),
      $.field('name').order(),
      $.limit(1)
    ])
    .on((users) => {})
    .catch((error) => {})

  offQuery()

  // Nested fields

  await db.users.query(($) => [
    $.field('contacts', 'email').equal('koss@nocorp.me')
  ])

  // Optional path
  await db.accounts.query(($) => [
    $.field('nested1Optional', 'nested12Optional', 'hello').equal('World!')
  ])

  // where

  // in

  await db.accounts.query(($) => [
    $.field($.docId()).in([db.accounts.id('id1'), db.accounts.id('id2')])
  ])

  await db.accounts.query(($) => [
    // @ts-expect-error - the value should be an array
    $.where($.docId(), 'in', 'id1')
  ])

  // array-contains

  await db.posts.query(($) => $.field('likeIds').contains('id1'))

  // @ts-expect-error - the value should be a string
  await db.posts.query(($) => $.field('likeIds').contains(1))

  // order

  await db.accounts.query(($) => $.field($.docId()).order())

  await db.accounts.query(($) => $.field('contacts').order())

  await db.accounts.query(($) => $.field('contacts', 'email').order())

  await db.accounts.query(($) => $.field('contacts', 'phone').order())

  // @ts-expect-error - nope is not a valid field
  await db.accounts.query(($) => $.field('contacts', 'nope').order())

  // Variable shape

  const [content] = await db.content.query(($) => [])
  if (!content) return

  // Can't update variable model shape without narrowing

  content?.update({
    public: true
  })

  content?.update({
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  // Narrowing

  const textContent = content?.narrow<TextContent>(
    (data) => data.type === 'text' && data
  )

  if (textContent) {
    // @ts-expect-error - can't update - we narrowed down to text type
    await textContent.update({ src: 'Nope' })

    await textContent.update({ text: 'Yup' })
  }

  // Empty query

  const emptyQuery = db.accounts.query(($) => undefined)
  assertType<TypeEqual<typeof emptyQuery, undefined>>(true)

  // Empty query fields

  db.users.query(($) => [
    $.field('name').equal('Sasha'),
    undefined,
    null,
    false,
    '',
    0
  ])
}

async function add() {
  // Simple add

  await db.posts.add({
    title: 'Hello, world!',
    text: 'Hello!'
  })

  // Upset with helpers

  await db.users.add(($) => ({
    name: 'Sasha',
    contacts: { email: 'koss@nocorp.me' },
    createdAt: $.serverDate()
  }))

  await db.users.add(
    {
      name: 'Sasha',
      contacts: { email: 'koss@nocorp.me' },
      createdAt: new Date()
    },
    { as: 'server' }
  )

  // Adding to variable collection

  await db.content.add({
    type: 'text',
    text: 'Hello, world!'
  })

  await db.content.add({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await db.content.add({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })
}

async function set() {
  // Simple set

  db.posts.set(db.posts.id('doc-id'), {
    title: 'Hello, world!',
    text: 'Hello!'
  })

  // Set with helpers

  await db.users.set(db.users.id('sasha'), ($) => ({
    name: 'Sasha',
    contacts: { email: 'koss@nocorp.me' },
    createdAt: $.serverDate()
  }))

  await db.users.set(
    db.users.id('sasha'),
    {
      name: 'Sasha',
      contacts: { email: 'koss@nocorp.me' },
      createdAt: new Date()
    },
    { as: 'server' }
  )

  // Setting to variable collection

  const contentId = db.content.id('content-id')

  await db.content.set(contentId, {
    type: 'text',
    text: 'Hello, world!'
  })

  await db.content.set(contentId, {
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await db.content.set(contentId, {
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })

  // ...via ref

  const contentRef = db.content.ref(contentId)

  await contentRef.set({
    type: 'text',
    text: 'Hello, world!'
  })

  await contentRef.set({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await contentRef.set({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })

  // ...via doc

  const contentDoc = await db.content.get(contentId)

  await contentDoc?.set({
    type: 'text',
    text: 'Hello, world!'
  })

  await contentDoc?.set({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await contentDoc?.set({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })
}

async function upset() {
  // Simple set

  db.posts.upset(db.posts.id('doc-id'), {
    title: 'Hello, world!',
    text: 'Hello!'
  })

  // Upset with helpers

  await db.users.upset(db.users.id('sasha'), ($) => ({
    name: 'Sasha',
    contacts: { email: 'koss@nocorp.me' },
    createdAt: $.serverDate()
  }))

  await db.users.upset(
    db.users.id('sasha'),
    {
      name: 'Sasha',
      contacts: { email: 'koss@nocorp.me' },
      createdAt: new Date()
    },
    { as: 'server' }
  )

  // Upsetting to variable collection

  const contentId = db.content.id('content-id')

  await db.content.upset(contentId, {
    type: 'text',
    text: 'Hello, world!'
  })

  await db.content.upset(contentId, {
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await db.content.upset(contentId, {
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })

  // ...via ref

  const contentRef = db.content.ref(contentId)

  await contentRef.upset({
    type: 'text',
    text: 'Hello, world!'
  })

  await contentRef.upset({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await contentRef.upset({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })

  // ...via doc

  const contentDoc = await db.content.get(contentId)

  await contentDoc?.upset({
    type: 'text',
    text: 'Hello, world!'
  })

  await contentDoc?.upset({
    type: 'image',
    src: 'https://example.com/image.png'
  })

  await contentDoc?.upset({
    type: 'image',
    src: 'https://example.com/image.png',
    // @ts-expect-error - text is not valid for image
    text: 'Nope'
  })
}

async function update() {
  // Simple update

  await db.users.update(db.users.id('sasha'), {
    name: 'Alexander'
  })

  // Update with helpers

  await db.users.update(db.users.id('sasha'), ($) => ({
    name: 'Sasha',
    birthdate: $.remove(),
    createdAt: $.serverDate()
  }))

  await db.posts.update(db.posts.id('post-id'), ($) => ({
    likes: $.increment(5),
    likeIds: $.arrayUnion('like-id')
  }))

  await db.posts.update(db.posts.id('post-id'), ($) => ({
    likeIds: $.arrayRemove('like-id')
  }))

  // Update as server

  await db.users.update(
    db.users.id('sasha'),
    { createdAt: new Date() },
    { as: 'server' }
  )

  await db.users.update(
    db.users.id('sasha'),
    () => ({ createdAt: new Date() }),
    { as: 'server' }
  )

  await db.users.update(
    db.users.id('sasha'),
    ($) => $.field('createdAt').set(new Date()),
    { as: 'server' }
  )

  const updateAsBuild = db.users.update.build(db.users.id('sasha'), {
    as: 'server'
  })

  updateAsBuild.field('createdAt').set(new Date())

  // Enforce required fields

  // @ts-expect-error - name is required
  await db.users.update(db.users.id('sasha'), ($) => ({
    name: $.remove()
  }))

  // @ts-expect-error - name is required
  await db.users.update(db.users.id('sasha'), ($) => ({
    name: undefined
  }))

  // Works with nested fields

  await db.users.update(db.users.id('sasha'), ($) => ({
    contacts: {
      email: 'koss@nocorp.me',
      phone: $.remove()
    }
  }))

  // @ts-expect-error - email is required
  await db.users.update(db.users.id('sasha'), ($) => ({
    contacts: {
      email: $.remove()
    }
  }))

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Optional').set($.remove())
  )

  // Single field update

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('name').set('Alexander')
  )

  // Multiple fields update

  await db.accounts.update(db.accounts.id('sasha'), ($) => [
    $.field('name').set('Alexander'),
    $.field('createdAt').set($.serverDate())
  ])

  // Nested fields

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('contacts', 'phone').set('+65xxxxxxxx')
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - wrong type
    $.field('contacts', 'phone').set(6500000000)
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update because emergencyContacts can be undefined
    $.field('emergencyContacts', 'phone').set('+65xxxxxxxx')
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - emergencyContacts must have name and phone
    $.field('emergencyContacts').set({ name: 'Sasha' })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('emergencyContacts').set({
      name: 'Sasha',
      phone: '+65xxxxxxxx'
    })
  )

  // Deeply nested field corner cases

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required').set({
      hello: 'Hello!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('nested1Required', 'nested12Required').set({
      hello: 'Hello!',
      world: 'World!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - can't update without hello
    $.field('nested1Required', 'nested12Required').set({
      world: 'World!'
    })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - should not update because requried12 on nested1Optional is required
    $.field('nested1Optional', 'nested12Optional').set({ hello: 'Hello!' })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    // @ts-expect-error - nested1Optional has required12, so can't update
    $.field('nested1Optional', 'nested12Optional').set({
      world: 'World!'
    })
  )

  // Nested fields with records

  const postId = 'post-id'

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters').set({ [postId]: { likes: 5 } })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId).set({ likes: 5 })
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId, 'likes').set($.increment(1))
  )

  await db.accounts.update(db.accounts.id('sasha'), ($) =>
    $.field('counters', postId, 'likes').set($.remove())
  )

  // Increment on nested optional values

  db.organizations.update(db.organizations.id('org-id'), ($) => ({
    counters: {
      drafts: $.increment(0),
      scheduled: $.increment(1),
      published: $.increment(0)
    }
  }))

  db.organizations.update(db.organizations.id('org-id'), ($) =>
    $.field('counters').set({
      drafts: $.increment(0),
      scheduled: $.increment(1),
      published: $.increment(0)
    })
  )

  // Updating variable collection

  const contentId = db.content.id('hello-world!')

  // Can't update variable model shape without narrowing

  db.content.update(contentId, {
    public: true
  })

  db.content.update(contentId, ($) => $.field('public').set(true))

  db.content.update(contentId, {
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  db.content.update(contentId, ($) =>
    // @ts-expect-error - can't update non-shared variable model fields
    $.field('type').set('text')
  )

  // Build Mode

  const collectionUpdate = db.content.update.build(contentId)

  collectionUpdate.field('public').set(true)

  // @ts-expect-error - can't update non-shared variable model fields
  collectionUpdate.field('type').set('text')

  // ...via doc

  const content = await db.content.get(contentId)

  content?.update({
    public: true
  })

  content?.update(($) => $.field('public').set(true))

  content?.update({
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  content?.update(($) =>
    // @ts-expect-error - can't update non-shared variable model fields
    $.field('type').set('text')
  )

  // Narrowing

  const textContent = content?.narrow<TextContent>(
    (data) => data.type === 'text' && data
  )

  if (textContent) {
    // @ts-expect-error - can't update - we narrowed down to text type
    await textContent.update({ src: 'Nope' })

    await textContent.update(($) =>
      // @ts-expect-error - can't update - we narrowed down to text type
      $.field('src').set('Nope')
    )

    await textContent.update({ text: 'Yup' })

    await textContent.update(($) => $.field('text').set('Yup'))

    const textContentUpdate = textContent.update.build()

    // @ts-expect-error - can't update - we narrowed down to text type
    textContentUpdate.field('src').set('Nope')

    textContentUpdate.field('text').set('Ok')

    // ...via ref:

    // @ts-expect-error - can't update - we narrowed down to text type
    await textContent.ref.update({ src: 'Nope' })

    await textContent.ref.update(($) =>
      // @ts-expect-error - can't update - we narrowed down to text type
      $.field('src').set('Nope')
    )

    await textContent.ref.update({ text: 'Yup' })

    await textContent.ref.update(($) => $.field('text').set('Yup'))

    const textContentRefUpdate = textContent.ref.update.build()

    // @ts-expect-error - can't update - we narrowed down to text type
    textContentRefUpdate.field('src').set('Nope')

    textContentRefUpdate.field('text').set('Ok')
  }

  const docUpdate = content?.update.build()

  docUpdate?.field('public').set(true)

  // @ts-expect-error - can't update non-shared variable model fields
  docUpdate?.field('type').set('text')

  // ...via ref

  const contentRef = await db.content.ref(contentId)

  contentRef?.update({
    public: true
  })

  content?.update(($) => $.field('public').set(true))

  contentRef?.update({
    // @ts-expect-error - can't update non-shared variable model fields
    type: 'text'
  })

  content?.update(($) =>
    // @ts-expect-error - can't update non-shared variable model fields
    $.field('type').set('text')
  )

  const refUpdate = content?.update.build()

  refUpdate?.field('public').set(true)

  // @ts-expect-error - can't update non-shared variable model fields
  refUpdate?.field('type').set('text')

  // Empty update

  const userId = db.users.id('user-id')

  db.users.update(userId, () => undefined)
  db.users.update(userId, () => '')
  db.users.update(userId, () => null)
  const emptyUpdate1 = db.users.update(userId, () => undefined)

  assertType<TypeEqual<typeof emptyUpdate1, undefined>>(true)

  db.users.get(userId).then((user) => {
    if (!user) return

    user.update(() => undefined)
    user.update(() => '')
    user.update(() => null)
    const emptyUpdate2 = user.update(() => undefined)

    assertType<TypeEqual<typeof emptyUpdate2, undefined>>(true)
  })

  // Empty update fields

  db.users.update(userId, ($) => [
    $.field('name').set('Sasha'),
    undefined,
    '',
    null
  ])
}

async function sharedIds() {
  interface Settings {
    email: string
  }

  const db = schema(($) => ({
    users: $.collection<User>(),
    settings: $.collection<Settings, Typesaurus.Id<'users'>>()
  }))

  const userId = await db.users.id()

  db.settings.update(userId, { email: 'hello@example.com' })
}

async function inferSchema() {
  type Schema1 = Core.InferSchema<typeof db>

  assertType<TypeEqual<Schema1['users']['Id'], Typesaurus.Id<'users'>>>(true)
  assertType<TypeEqual<Schema1['users']['Ref'], Typesaurus.Ref<User, 'users'>>>(
    true
  )
  assertType<TypeEqual<Schema1['users']['Doc'], Typesaurus.Doc<User, 'users'>>>(
    true
  )

  interface Settings {
    email: string
  }

  const nestedDB = schema(($) => ({
    users: $.collection<User>().sub({
      settings: $.collection<Settings>()
    })
  }))

  type Schema2 = Core.InferSchema<typeof nestedDB>

  assertType<
    TypeEqual<
      Schema2['users']['sub']['settings']['Id'],
      Typesaurus.Id<'users/settings'>
    >
  >(true)

  assertType<
    TypeEqual<
      Schema2['users']['sub']['settings']['Ref'],
      Typesaurus.Ref<Settings, 'users/settings'>
    >
  >(true)

  assertType<
    TypeEqual<
      Schema2['users']['sub']['settings']['Doc'],
      Typesaurus.Doc<Settings, 'users/settings'>
    >
  >(true)
}

async function narrowDoc() {
  interface TwitterAccount {
    type: 'twitter'
    screenName: number
  }

  interface LinkedInAccount {
    type: 'linkedin'
    email: string
  }

  const db = schema(($) => ({
    accounts: $.collection<[TwitterAccount, LinkedInAccount]>()
  }))

  type Schema = Core.InferSchema<typeof db>

  type Result1 = Core.NarrowDoc<Schema['accounts']['Doc'], TwitterAccount>

  assertType<
    TypeEqual<
      Result1,
      Core.Doc<
        {
          Model: TwitterAccount
          Name: 'accounts'
          Id: Core.Id<'accounts'>
          WideModel: [TwitterAccount, LinkedInAccount]
          Flags: { Reduced: true }
        },
        Core.DocProps
      >
    >
  >(true)
}

namespace Data {
  // It does not mingle typed id

  type ResultOA8M = Core.Data<
    {
      helloId: Typesaurus.Id<'hello'>
    },
    'present'
  >

  assertType<TypeEqual<ResultOA8M, { helloId: Typesaurus.Id<'hello'> }>>(true)
}

namespace ModelToConcat {
  // Both objects

  type ResultKA01 = Core.ConcatModel<{ hello: 'hello' }, { world: 'world' }>

  assertType<TypeEqual<ResultKA01, [{ hello: 'hello' }, { world: 'world' }]>>(
    true
  )

  // First is tuple

  type ResultU3HA = Core.ConcatModel<[{ hello: 'hello' }], { world: 'world' }>

  assertType<TypeEqual<ResultU3HA, [{ hello: 'hello' }, { world: 'world' }]>>(
    true
  )

  type ResultKJE7 = Core.ConcatModel<
    [{ hello: 'hello' }, { cruel: 'cruel' }],
    { world: 'world' }
  >

  assertType<
    TypeEqual<
      ResultKJE7,
      [{ hello: 'hello' }, { cruel: 'cruel' }, { world: 'world' }]
    >
  >(true)

  // Second is tuple

  type ResultOOAN = Core.ConcatModel<{ hello: 'hello' }, [{ world: 'world' }]>

  assertType<TypeEqual<ResultOOAN, [{ hello: 'hello' }, { world: 'world' }]>>(
    true
  )

  type ResultPAN7 = Core.ConcatModel<
    { hello: 'hello' },
    [{ cruel: 'cruel' }, { world: 'world' }]
  >

  assertType<
    TypeEqual<
      ResultPAN7,
      [{ hello: 'hello' }, { cruel: 'cruel' }, { world: 'world' }]
    >
  >(true)

  // Both are tuples

  type ResultWE8M = Core.ConcatModel<[{ hello: 'hello' }], [{ world: 'world' }]>

  assertType<TypeEqual<ResultWE8M, [{ hello: 'hello' }, { world: 'world' }]>>(
    true
  )

  type ResultFJU9 = Core.ConcatModel<
    [{ hello: 'hello' }, { cruel: 'cruel' }],
    [{ world: 'world' }, { bang: '!' }]
  >

  assertType<
    TypeEqual<
      ResultFJU9,
      [
        { hello: 'hello' },
        { cruel: 'cruel' },
        { world: 'world' },
        { bang: '!' }
      ]
    >
  >(true)
}

namespace ComposePath {
  type Result1 = Assert<'users', Utils.ComposePath<undefined, 'users'>>

  type Result2 = Assert<'users/posts', Utils.ComposePath<'users', 'posts'>>
}

namespace UnionKeys {
  type Example = { books: true } | { comics: true }

  type Result = Assert<'books' | 'comics', Utils.UnionKeys<Example>>
}

namespace WithoutIndexed {
  type Example1 = {
    [key: string]: string
    required: string
    optional?: string
  }

  const test1 = {} as Utils.WithoutIndexed<Example1>
  // @ts-expect-error
  test1['qwe']

  type Example2 = {
    [key: number]: string
    required: string
    optional?: string
  }

  const test2 = {} as Utils.WithoutIndexed<Example2>
  // @ts-expect-error
  test2[123]

  type Example3 = {
    [key: symbol]: string
    required: string
    optional?: string
  }

  const test3 = {} as Utils.WithoutIndexed<Example3>
  // @ts-expect-error
  test3[Symbol('hello')]
}

namespace StaticKey {
  type Example1 = {
    [key: string]: string
    required: string
    optional?: string
  }

  type Result11 = Assert<false, Utils.StaticKey<Example1, 'qwe'>>

  type Result12 = Assert<true, Utils.StaticKey<Example1, 'required'>>

  type Result13 = Assert<true, Utils.StaticKey<Example1, 'optional'>>

  type Example2 = {
    [key: number]: string
    required: string
    optional?: string
  }

  type Result21 = Assert<false, Utils.StaticKey<Example2, 123>>

  type Result22 = Assert<true, Utils.StaticKey<Example2, 'required'>>

  type Result23 = Assert<true, Utils.StaticKey<Example2, 'optional'>>

  type Example3 = {
    [key: symbol]: string
    required: string
    optional?: string
  }

  type Result31 = Assert<false, Utils.StaticKey<Example3, symbol>>

  type Result32 = Assert<true, Utils.StaticKey<Example3, 'required'>>

  type Result33 = Assert<true, Utils.StaticKey<Example3, 'optional'>>
}

namespace UtilsTest {
  type Result1 = Assert<
    {
      required: string
      optional: string
    },
    Utils.AllRequired<{
      required: string
      optional?: string
    }>
  >

  type Result2 = Assert<
    {
      required: string
      optional: string
    },
    Utils.AllRequired<{
      required: string
      optional?: string | undefined
    }>
  >
}

namespace RequiredKey {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result11 = Assert<true, Utils.RequiredKey<Example1, 'required'>>

  type Result12 = Assert<false, Utils.RequiredKey<Example1, 'optional'>>

  type Example2 = {
    [key: string]: string
    required: string
    optional?: string
  }

  type Result21 = Assert<false, Utils.RequiredKey<Example2, 'qwe'>>

  type Result22 = Assert<true, Utils.RequiredKey<Example2, 'required'>>

  type Result23 = Assert<false, Utils.RequiredKey<Example2, 'optional'>>

  type Example3 = {
    [key: number]: string
    required: string
    optional?: string
  }

  type Result31 = Assert<false, Utils.RequiredKey<Example3, 123>>

  type Result32 = Assert<true, Utils.RequiredKey<Example3, 'required'>>

  type Result33 = Assert<false, Utils.RequiredKey<Example3, 'optional'>>

  type Example4 = {
    [key: symbol]: string
    required: string
    optional?: string
  }

  type Result41 = Assert<false, Utils.RequiredKey<Example4, symbol>>

  type Result42 = Assert<true, Utils.RequiredKey<Example4, 'required'>>

  type Result43 = Assert<false, Utils.RequiredKey<Example4, 'optional'>>
}

namespace AllOptionalBut {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, Utils.AllOptionalBut<Example1, 'required'>>

  type Result2 = Assert<false, Utils.AllOptionalBut<Example1, 'optional'>>

  interface Example2 {
    required1: string
    required2: string
    optional?: string
  }

  type Result3 = Assert<false, Utils.AllOptionalBut<Example2, 'required1'>>

  type Result4 = Assert<false, Utils.AllOptionalBut<Example2, 'required2'>>

  type Result5 = Assert<false, Utils.AllOptionalBut<Example2, 'optional'>>

  interface Example3 {
    [postId: string]: {
      likes?: string
      views?: string
    }
  }

  type Result6 = Assert<true, Utils.AllOptionalBut<Example3, 'post-id'>>

  interface Example4 {
    required: string
    [optional: string]: string
  }

  type Result7 = Assert<true, Utils.AllOptionalBut<Example4, 'required'>>
}

namespace RequiredPath {
  interface Example2 {
    required: {
      required: string
      optional?: string
    }
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result4 = Assert<true, Utils.RequiredPath1<Example2, 'required'>>

  type Result7 = Assert<false, Utils.RequiredPath1<Example2, 'optional'>>

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<false, Utils.RequiredPath1<Example3, 'optional'>>

  interface Example4 {
    required: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
    optional?: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result10 = Assert<
    true,
    Utils.RequiredPath2<Example4, 'required', 'required'>
  >

  type Result12 = Assert<
    false,
    Utils.RequiredPath2<Example4, 'required', 'optional'>
  >

  type Result14 = Assert<
    false,
    Utils.RequiredPath2<Example4, 'optional', 'required'>
  >

  type Result16 = Assert<
    false,
    Utils.RequiredPath2<Example4, 'optional', 'optional'>
  >

  interface Example5 {
    1: {
      2: {
        3: {
          4: true
        }
        optional?: {
          4: true
        }
      }
    }
  }

  type Result18 = Assert<true, Utils.RequiredPath3<Example5, 1, 2, 3>>

  type Result19 = Assert<false, Utils.RequiredPath3<Example5, 1, 2, 'optional'>>

  interface Example6 {
    1: {
      2: {
        3: {
          4: {
            5: true
          }
          optional?: {
            5: true
          }
        }
      }
    }
  }

  type Result20 = Assert<true, Utils.RequiredPath4<Example6, 1, 2, 3, 4>>

  type Result21 = Assert<
    false,
    Utils.RequiredPath4<Example6, 1, 2, 3, 'optional'>
  >
}

namespace SafeOptionalPath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, Utils.SafeOptionalPath1<Example1, 'required'>>

  type Result2 = Assert<false, Utils.SafeOptionalPath1<Example1, 'optional'>>

  type Result3 = Assert<
    false,
    Utils.SafeOptionalPath1<
      {
        required1: string
        required2: string
        optional?: string
      },
      'required1'
    >
  >

  interface Example2 {
    required: {
      required: string
      optional?: string
    }
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result4 = Assert<
    true,
    Utils.SafeOptionalPath2<Example2, 'required', 'required'>
  >

  type Result5 = Assert<
    false,
    Utils.SafeOptionalPath2<Example2, 'required', 'optional'>
  >

  type Result6 = Assert<
    false,
    Utils.SafeOptionalPath2<Example2, 'optional', 'required'>
  >

  type Result7 = Assert<
    false,
    Utils.SafeOptionalPath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<
    true,
    Utils.SafeOptionalPath2<Example3, 'optional', 'required'>
  >

  type Result9 = Assert<
    false,
    Utils.SafeOptionalPath2<Example3, 'optional', 'optional'>
  >

  interface Example4 {
    required: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
    optional?: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result10 = Assert<
    true,
    Utils.SafeOptionalPath3<Example4, 'required', 'required', 'required'>
  >

  type Result11 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'required', 'required', 'optional'>
  >

  type Result12 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'required', 'optional', 'required'>
  >

  type Result13 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'required', 'optional', 'optional'>
  >

  type Result14 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'optional', 'required', 'required'>
  >

  type Result15 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'optional', 'required', 'optional'>
  >

  type Result16 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'optional', 'optional', 'required'>
  >

  type Result17 = Assert<
    false,
    Utils.SafeOptionalPath3<Example4, 'optional', 'optional', 'optional'>
  >

  interface Example5 {
    optional?: {
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result18 = Assert<
    true,
    Utils.SafeOptionalPath3<Example5, 'optional', 'optional', 'required'>
  >

  type Result19 = Assert<
    false,
    Utils.SafeOptionalPath3<Example5, 'optional', 'optional', 'optional'>
  >
}

namespace SafePath {
  interface Example1 {
    required: string
    optional?: string
  }

  type Result1 = Assert<true, Utils.SafePath1<Example1, 'required'>>

  type Result2 = Assert<true, Utils.SafePath1<Example1, 'optional'>>

  type Result3 = Assert<
    true,
    Utils.SafePath1<
      {
        required1: string
        required2: string
        optional?: string
      },
      'required1'
    >
  >

  interface Example2 {
    required: {
      required: string
      optional?: string
    }
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result4 = Assert<true, Utils.SafePath2<Example2, 'required', 'required'>>

  type Result5 = Assert<true, Utils.SafePath2<Example2, 'required', 'optional'>>

  type Result6 = Assert<true, Utils.SafePath2<Example2, 'optional', 'required'>>

  type Result7 = Assert<
    false,
    Utils.SafePath2<Example2, 'optional', 'optional'>
  >

  interface Example3 {
    optional?: {
      required: string
      optional?: string
    }
  }

  type Result8 = Assert<true, Utils.SafePath2<Example3, 'optional', 'required'>>

  type Result9 = Assert<
    false,
    Utils.SafePath2<Example3, 'optional', 'optional'>
  >

  interface Example4 {
    [postId: string]:
      | undefined
      | {
          likes?: number
          views?: number
        }
  }

  type Result10 = Assert<true, Utils.SafePath2<Example4, 'post-id', 'likes'>>

  interface Example5 {
    required: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
    optional?: {
      required: {
        required: string
        optional?: string
      }
      optional?: {
        required: string
        optional?: string
      }
    }
  }

  type Result11 = Assert<
    true,
    Utils.SafePath3<Example5, 'required', 'required', 'required'>
  >

  type Result12 = Assert<
    true,
    Utils.SafePath3<Example5, 'required', 'required', 'optional'>
  >

  type Result13 = Assert<
    false,
    Utils.SafePath3<Example5, 'required', 'optional', 'required'>
  >

  type Result14 = Assert<
    false,
    Utils.SafePath3<Example5, 'required', 'optional', 'optional'>
  >

  type Result15 = Assert<
    true,
    Utils.SafePath3<Example5, 'optional', 'required', 'required'>
  >

  type Result16 = Assert<
    false,
    Utils.SafePath3<Example5, 'optional', 'required', 'optional'>
  >

  type Result17 = Assert<
    false,
    Utils.SafePath3<Example5, 'optional', 'optional', 'required'>
  >

  type Result18 = Assert<
    false,
    Utils.SafePath3<Example5, 'optional', 'optional', 'optional'>
  >

  interface Example6 {
    stats?: {
      [postId: string]:
        | undefined
        | {
            likes?: number
            views?: number
          }
    }
  }

  type Result19 = Assert<
    true,
    Utils.SafePath3<Example6, 'stats', 'post-id', 'likes'>
  >

  interface ExampleAY40 {
    required: {
      optional1?: {
        optional1?: string
        optional2?: string
      }
      optional2?: {
        optional?: string
        required: string
      }
    }
  }

  type ResultQP8V = Assert<
    true,
    Utils.SafePath3<ExampleAY40, 'required', 'optional1', 'optional1'>
  >

  type ResultAK3B = Assert<
    true,
    Utils.SafePath3<ExampleAY40, 'required', 'optional1', 'optional2'>
  >

  type ResultAXJR = Assert<
    false,
    Utils.SafePath3<ExampleAY40, 'required', 'optional2', 'optional'>
  >

  type Result92GA = Assert<
    true,
    Utils.SafePath3<ExampleAY40, 'required', 'optional2', 'required'>
  >

  interface ExampleLD18 {
    optional?: {
      optional1?: {
        optional1?: string
        optional2?: string
      }
      optional2?: {
        optional?: string
        required: string
      }
    }
  }

  type ResultA45H = Assert<
    true,
    Utils.SafePath3<ExampleLD18, 'optional', 'optional1', 'optional1'>
  >

  type Result49SU = Assert<
    true,
    Utils.SafePath3<ExampleLD18, 'optional', 'optional1', 'optional2'>
  >

  type ResultDM3H = Assert<
    false,
    Utils.SafePath3<ExampleLD18, 'optional', 'optional2', 'optional'>
  >

  type ResultTJ32 = Assert<
    true,
    Utils.SafePath3<ExampleLD18, 'optional', 'optional2', 'required'>
  >

  interface Example7 {
    1: {
      2: {
        3: {
          required: string
          optional?: string
        }
      }
    }

    one?: {
      2: {
        3: {
          required: string
          optional?: string
        }
      }
    }

    uno?: {
      dos: string
      2: {
        3: {
          required: string
          optional?: string
        }
      }
    }
  }

  type Result20 = Assert<true, Utils.SafePath4<Example7, 1, 2, 3, 'required'>>

  type Result21 = Assert<true, Utils.SafePath4<Example7, 1, 2, 3, 'optional'>>

  type Result22 = Assert<
    true,
    Utils.SafePath4<Example7, 'one', 2, 3, 'required'>
  >

  type Result23 = Assert<
    false,
    Utils.SafePath4<Example7, 'one', 2, 3, 'optional'>
  >

  type Result24 = Assert<
    false,
    Utils.SafePath4<Example7, 'uno', 2, 3, 'required'>
  >

  type Result25 = Assert<
    false,
    Utils.SafePath4<Example7, 'uno', 2, 3, 'optional'>
  >

  interface Example8 {
    stats?: {
      [postId: string]:
        | undefined
        | {
            [commentId: string]:
              | undefined
              | {
                  likes?: number
                  views?: number
                }
          }
    }
  }

  type Result26 = Assert<
    true,
    Utils.SafePath4<Example8, 'stats', 'post-id', 'comment-id', 'likes'>
  >
}

namespace SharedShape {
  type ResultOD83 = Utils.SharedShape<
    { a: string | number; b: string; c: boolean },
    {
      a: string
      b: string
    }
  >

  type Result43J3 = Assert<{ a: string; b: string }, ResultOD83>
}

async function record() {
  const account = await db.accounts.get(db.accounts.id('ok'))
  if (!account) return

  account.data.counters &&
    Object.entries(account.data.counters).forEach(([_postId, counters]) => {
      counters.likes
    })
}

type Assert<Type1, _Type2 extends Type1> = true

export function assertType<Type>(value: Type) {}

export type TypeEqual<T, U> = Exclude<T, U> extends never
  ? Exclude<U, T> extends never
    ? true
    : false
  : false
