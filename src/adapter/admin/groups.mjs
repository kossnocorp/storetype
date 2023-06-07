import { getFirestore } from 'firebase-admin/firestore'
import { all, pathToDoc, query, queryHelpers, wrapData } from './core.mjs'

export const groups = (rootDB) => {
  const groups = {}

  function extract(db) {
    Object.entries(db).forEach(([path, collection]) => {
      if (path in groups) return
      groups[path] = new Group(path)
      if ('schema' in collection) extract(collection.schema)
    })
  }

  extract(rootDB)
  return groups
}

class Group {
  constructor(name) {
    this.name = name

    this.query = (queries) =>
      query(this.adapter(), [].concat(queries(queryHelpers())))

    this.query.build = () => {
      const queries = []
      return {
        ...queryHelpers('builder', queries),
        run: () => query(this.adapter(), queries)
      }
    }
  }

  all() {
    return all(this.adapter())
  }

  async count() {
    const snap = await this.adapter().collection().count().get()
    return snap.data().count
  }

  adapter() {
    return {
      collection: () => this.firebaseCollection(),
      doc: (snapshot) =>
        pathToDoc(snapshot.ref.path, wrapData(snapshot.data())),
      request: () => ({ path: this.name, group: true })
    }
  }

  firebaseCollection() {
    return getFirestore().collectionGroup(this.name)
  }
}
