import { initializeApp } from 'firebase/app'
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from 'firebase/firestore'
import { orderBy, query, where, WhereData } from '../src'
import { firebaseConfig } from './config.secret'

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

type Schema = {
  name: string
  emails: string[]
  address: {
    parts?: {
      number: number
      street: string
    }
    address: string
    postal: number
  }
}

const col = collection(db, 'proto-test') as CollectionReference<Schema>

const aliceData: Schema = {
  name: 'Alice',
  emails: [],
  address: {
    address: '123 Road',
    postal: 2,
  },
}

const bobData: Schema = {
  name: 'Bob',
  emails: [],
  address: {
    address: '456 Road',
    postal: 1,
  },
}

type X = WhereData<Schema>

beforeEach(async () => {
  await Promise.all([addDoc(col, aliceData), addDoc(col, bobData)])
})

afterEach(async () => {
  const qs = await getDocs(query(col))
  await Promise.all(qs.docs.map((d) => deleteDoc(doc(col, d.id))))
})

test('should query a direct field', async () => {
  const qs = await getDocs(query(col, where('name', '==', 'Alice')))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([aliceData])
})

test('should query an embedded field', async () => {
  const qs = await getDocs(query(col, where('address.postal', '==', 1)))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([bobData])
})

test('should update a field', async () => {
  const qs = await getDocs(query(col, where('name', '==', 'Alice')))
  expect(qs.size).toStrictEqual(1)
  await updateDoc(qs.docs[0].ref, { name: 'Alice2' })

  expect(
    (await getDocs(query(col, where('name', '==', 'Alice')))).docs.map((d) =>
      d.data()
    )
  ).toStrictEqual([])
  expect(
    (await getDocs(query(col, where('name', '==', 'Alice2')))).docs.map((d) =>
      d.data()
    )
  ).toStrictEqual([{ ...aliceData, name: 'Alice2' }])
})

test('should update a dot field', async () => {
  const qs = await getDocs(query(col, where('name', '==', 'Alice')))
  expect(qs.size).toStrictEqual(1)
  await updateDoc(qs.docs[0].ref, { 'address.postal': 3 })

  expect(
    await (
      await getDocs(query(col, where('name', '==', 'Alice')))
    ).docs.map((d) => d.data())
  ).toStrictEqual([
    { ...aliceData, address: { ...aliceData.address, postal: 3 } },
  ])
})

test('should orderBy a field', async () => {
  const qs = await getDocs(query(col, orderBy('name')))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([aliceData, bobData])
})

test('should orderBy a dot field', async () => {
  const qs = await getDocs(query(col, orderBy('address.postal')))
  expect(qs.docs.map((d) => d.data())).toStrictEqual([bobData, aliceData])
})
