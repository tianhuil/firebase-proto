import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore'
import { query, where } from '../src'
import { db } from './setup'

type Object = {
  s?: string
  b?: boolean
  n?: number
  o?: { s?: string; n?: number }
  ao?: { s?: string; n?: number }[]
  an?: number[]
}

const col = collection(db, 'proto-test-array') as CollectionReference<Object>

const data: Object[] = [
  { o: { s: 'x' } },
  { o: { s: 'x', n: 1 } },
  { an: [1, 2] },
  { an: [3, 4] },
]

beforeAll(async () => {
  await Promise.all(data.map((d) => addDoc(col, d)))
})

test('query single-field object', async () => {
  const qs = await getDocs(query(col, where('o', '==', { s: 'x' })))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([data[0]])
})

test('query single-field  object [no result]', async () => {
  const qs = await getDocs(query(col, where('o', '==', { s: 'y' })))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([])
})

test('query two-field object', async () => {
  const qs = await getDocs(query(col, where('o', '==', { s: 'x', n: 1 })))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([data[1]])
})

test('query two-field object [no result]', async () => {
  const qs = await getDocs(query(col, where('o', '==', { s: 'x', n: 2 })))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([])
})

test('query an array', async () => {
  const qs = await getDocs(query(col, where('an', '==', [1, 2])))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([data[2]])
})

test('query an array', async () => {
  const qs = await getDocs(query(col, where('an', '!=', [1, 2])))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([data[3]])
})

afterAll(async () => {
  const qs = await getDocs(query(col))
  await Promise.all(qs.docs.map((d) => deleteDoc(doc(col, d.id))))
})
