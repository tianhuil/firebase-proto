import * as ta from 'type-assertions'
import { WhereData, WhereFilterOp, WhereValue } from '../src'

type Object = {
  s?: string
  b?: boolean
  n?: number
  o?: { s?: string; n?: number }
  ao?: { s?: string; n?: number }[]
  an?: number[]
}

// assertions for WhereData
ta.assert<ta.Extends<{}, WhereData<Object>>>()
ta.assert<ta.Extends<{ s: string }, WhereData<Object>>>()
ta.assert<ta.Not<ta.Extends<{ s: boolean }, WhereData<Object>>>>()
ta.assert<ta.Extends<{ b: boolean }, WhereData<Object>>>()
ta.assert<ta.Extends<{ o: {} }, WhereData<Object>>>()
ta.assert<ta.Extends<{ an: [] }, WhereData<Object>>>()
ta.assert<ta.Extends<{ an: [2] }, WhereData<Object>>>()

// assertions WhereFilterOp for boolean
ta.assert<ta.Extends<'==', WhereFilterOp<boolean>>>()
ta.assert<ta.Extends<'in', WhereFilterOp<boolean>>>()
ta.assert<ta.Not<ta.Extends<'>=', WhereFilterOp<boolean>>>>()
ta.assert<ta.Not<ta.Extends<'array-contains', WhereFilterOp<boolean>>>>()
ta.assert<ta.Not<ta.Extends<'array-contains-any', WhereFilterOp<boolean>>>>()

// assertions WhereFilterOp for string
ta.assert<ta.Extends<'==', WhereFilterOp<string>>>()
ta.assert<ta.Extends<'in', WhereFilterOp<string>>>()
ta.assert<ta.Extends<'>=', WhereFilterOp<string>>>()
ta.assert<ta.Not<ta.Extends<'array-contains', WhereFilterOp<string>>>>()
ta.assert<ta.Not<ta.Extends<'array-contains-any', WhereFilterOp<string>>>>()

// assertions WhereFilterOp for Array<number>
ta.assert<ta.Extends<'==', WhereFilterOp<Array<number>>>>()
ta.assert<ta.Extends<'in', WhereFilterOp<Array<number>>>>()
ta.assert<ta.Not<ta.Extends<'>=', WhereFilterOp<Array<number>>>>>()
ta.assert<ta.Extends<'array-contains', WhereFilterOp<Array<number>>>>()
ta.assert<ta.Extends<'array-contains-any', WhereFilterOp<Array<number>>>>()

// assertions WhereValue ==
ta.assert<ta.Extends<boolean, WhereValue<boolean, '=='>>>()
ta.assert<ta.Extends<boolean[], WhereValue<boolean[], '=='>>>()
ta.assert<ta.Not<ta.Extends<boolean, WhereValue<boolean[], '=='>>>>()
ta.assert<ta.Not<ta.Extends<string, WhereValue<boolean, '=='>>>>()

// assertions WhereValue <
ta.assert<ta.Extends<string, WhereValue<string, '<'>>>()
ta.assert<ta.Not<ta.Extends<boolean, WhereValue<string, '<'>>>>()

// assertions WhereValue in
ta.assert<ta.Extends<string[], WhereValue<string, 'in'>>>()
ta.assert<ta.Not<ta.Extends<string, WhereValue<string, 'in'>>>>()
ta.assert<ta.Not<ta.Extends<number[], WhereValue<string, 'in'>>>>()

// assertions WhereValue array-contains
ta.assert<ta.Extends<string, WhereValue<string[], 'array-contains'>>>()
ta.assert<
  ta.Not<ta.Extends<string[], WhereValue<string[], 'array-contains'>>>
>()
ta.assert<ta.Not<ta.Extends<number, WhereValue<string[], 'array-contains'>>>>()

// assertions WhereValue array-contains-any
ta.assert<ta.Extends<string[], WhereValue<string[], 'array-contains-any'>>>()
ta.assert<
  ta.Not<ta.Extends<string, WhereValue<string[], 'array-contains-any'>>>
>()
ta.assert<
  ta.Not<ta.Extends<number[], WhereValue<string[], 'array-contains-any'>>>
>()
