import * as firestore from 'firebase/firestore'

/** Describes the different query constraints available in this SDK. */
export type QueryConstraintType =
  | 'where'
  | 'orderBy'
  | 'limit'
  | 'limitToLast'
  | 'startAt'
  | 'startAfter'
  | 'endAt'
  | 'endBefore'

/**
 * A `QueryConstraint` is used to narrow the set of documents returned by a
 * Firestore query. `QueryConstraint`s are created by invoking {@link where},
 * {@link orderBy}, {@link (startAt:1)}, {@link (startAfter:1)}, {@link
 * endBefore:1}, {@link (endAt:1)}, {@link limit} or {@link limitToLast} and
 * can then be passed to {@link query} to create a new query instance that
 * also contains this `QueryConstraint`.
 */
export interface IQueryConstraint<T> {
  /** The type of this query constraints */
  readonly type: QueryConstraintType
}

type QueryOf<T extends firestore.Query<unknown>> = T extends firestore.Query<
  infer R
>
  ? R
  : never

/**
 * Creates a new immutable instance of {@link Query} that is extended to also include
 * additional query constraints.
 *
 * @param query - The {@link Query} instance to use as a base for the new constraints.
 * @param queryConstraints - The list of {@link QueryConstraint}s to apply.
 * @throws if any of the provided query constraints cannot be combined with the
 * existing or new constraints.
 */
export const query = <T>(
  query_: firestore.Query<T>,
  ...queryConstraints: IQueryConstraint<T>[]
): firestore.Query<T> => firestore.query(query_, ...queryConstraints)

/**
 * Filter conditions in a {@link where} clause are specified using the
 * strings '&lt;', '&lt;=', '==', '!=', '&gt;=', '&gt;', 'array-contains', 'in',
 * 'array-contains-any', and 'not-in'.
 */
export type WhereFilterOp<T> = T extends boolean | undefined | null
  ? '==' | '!='
  : T extends string | number
  ? '<' | '<=' | '==' | '!=' | '>=' | '>'
  : T extends Array<unknown>
  ? 'array-contains' | 'array-contains-any'
  : never

export declare type WhereData<T> = T extends firestore.Primitive
  ? T
  : T extends {}
  ? {
      [K in keyof T]?: WhereData<T[K]>
    } & NestedUpdateFields<T>
  : Partial<T>
export declare type NestedUpdateFields<T extends Record<string, unknown>> =
  firestore.UnionToIntersection<
    {
      [K in keyof T & string]: ChildUpdateFields<K, T[K]>
    }[keyof T & string]
  >
export declare type ChildUpdateFields<K extends string, V> = V extends Record<
  string,
  unknown
>
  ? firestore.AddPrefixToKeys<K, WhereData<V>>
  : never

type SingleWhereData<T> = {
  [K in keyof WhereData<T>]: WhereData<T>[K] extends Array<unknown>
    ? never
    : WhereData<T>[K]
}

type ArrayWhereData<T> = {
  [K in keyof WhereData<T>]: WhereData<T>[K] extends Array<unknown>
    ? WhereData<T>[K]
    : never
}

/**
 * Creates a {@link QueryConstraint} that enforces that documents must contain the
 * specified field and that the value should satisfy the relation constraint
 * provided.
 *
 * @param fieldPath - The path to compare
 * @param opStr - The operation string (e.g "&lt;", "&lt;=", "==", "&lt;",
 *   "&lt;=", "!=").
 * @param value - The value for comparison
 * @returns The created {@link Query}.
 */
export function where<T, K extends keyof SingleWhereData<T>>(
  fieldPath: K,
  opStr: WhereFilterOp<SingleWhereData<T>[K]>,
  value: SingleWhereData<T>[K]
): IQueryConstraint<T>
export function where<T, K extends keyof WhereData<T>>(
  fieldPath: K,
  opStr: 'in' | 'not-in',
  value: Array<WhereData<T>[K]>
): IQueryConstraint<T>
export function where<T, K extends keyof ArrayWhereData<T>>(
  fieldPath: K,
  opStr: 'array-contains',
  value: ArrayWhereData<T>[K][number]
): IQueryConstraint<T>
export function where<T, K extends keyof ArrayWhereData<T>>(
  fieldPath: K,
  opStr: 'array-contains-any',
  value: ArrayWhereData<T>[K]
): IQueryConstraint<T>
export function where<T>(
  fieldPath: unknown,
  opStr: unknown,
  value: unknown
): IQueryConstraint<T> {
  return firestore.where(
    fieldPath as string,
    opStr as firestore.WhereFilterOp,
    value as unknown
  )
}

/**
 * The direction of a {@link orderBy} clause is specified as 'desc' or 'asc'
 * (descending or ascending).
 */
export type OrderByDirection = 'desc' | 'asc'

/**
 * Creates a {@link QueryConstraint} that sorts the query result by the
 * specified field, optionally in descending order instead of ascending.
 *
 * @param fieldPath - The field to sort by.
 * @param directionStr - Optional direction to sort by ('asc' or 'desc'). If
 * not specified, order will be ascending.
 * @returns The created {@link Query}.
 */
export const orderBy = <T extends Record<string, unknown>>(
  fieldPath: keyof WhereData<T>,
  directionStr: OrderByDirection = 'asc'
): IQueryConstraint<T> => firestore.orderBy(fieldPath as string, directionStr)

/**
 * Creates a {@link QueryConstraint} that only returns the first matching documents.
 *
 * @param limit - The maximum number of items to return.
 * @returns The created {@link Query}.
 */
export const limit = (limit: number): IQueryConstraint<unknown> =>
  firestore.limit(limit)

/**
 * Creates a {@link QueryConstraint} that only returns the last matching documents.
 *
 * You must specify at least one `orderBy` clause for `limitToLast` queries,
 * otherwise an exception will be thrown during execution.
 *
 * @param limit - The maximum number of items to return.
 * @returns The created {@link Query}.
 */
export const limitToLast = (limit: number): IQueryConstraint<unknown> =>
  firestore.limitToLast(limit)

/**
 * Creates a {@link QueryConstraint} that modifies the result set to start at the
 * provided document (inclusive). The starting position is relative to the order
 * of the query. The document must contain all of the fields provided in the
 * `orderBy` of this query.
 *
 * @param snapshot - The snapshot of the document to start at.
 * @returns A {@link QueryConstraint} to pass to `query()`.
 */
export function startAt(
  snapshot: firestore.DocumentSnapshot<unknown>
): IQueryConstraint<unknown>

/**
 * Creates a {@link QueryConstraint} that modifies the result set to start at the
 * provided fields relative to the order of the query. The order of the field
 * values must match the order of the order by clauses of the query.
 *
 * @param fieldValues - The field values to start this query at, in order
 * of the query's order by.
 * @returns A {@link QueryConstraint} to pass to `query()`.
 */
export function startAt(...fieldValues: unknown[]): IQueryConstraint<unknown>
export function startAt(
  ...docOrFields: Array<unknown | firestore.DocumentSnapshot<unknown>>
): IQueryConstraint<unknown> {
  return firestore.startAt(...docOrFields)
}

/**
 * Creates a {@link QueryConstraint} that modifies the result set to start after the
 * provided document (exclusive). The starting position is relative to the order
 * of the query. The document must contain all of the fields provided in the
 * orderBy of the query.
 *
 * @param snapshot - The snapshot of the document to start after.
 * @returns A {@link QueryConstraint} to pass to `query()`
 */
export function startAfter(
  snapshot: firestore.DocumentSnapshot<unknown>
): IQueryConstraint<unknown>
/**
 * Creates a {@link QueryConstraint} that modifies the result set to start after the
 * provided fields relative to the order of the query. The order of the field
 * values must match the order of the order by clauses of the query.
 *
 * @param fieldValues - The field values to start this query after, in order
 * of the query's order by.
 * @returns A {@link QueryConstraint} to pass to `query()`
 */
export function startAfter(...fieldValues: unknown[]): IQueryConstraint<unknown>
export function startAfter(
  ...docOrFields: Array<unknown | firestore.DocumentSnapshot<unknown>>
): IQueryConstraint<unknown> {
  return firestore.startAfter(...docOrFields)
}

/**
 * Creates a {@link QueryConstraint} that modifies the result set to end before the
 * provided document (exclusive). The end position is relative to the order of
 * the query. The document must contain all of the fields provided in the
 * orderBy of the query.
 *
 * @param snapshot - The snapshot of the document to end before.
 * @returns A {@link QueryConstraint} to pass to `query()`
 */
export function endBefore(
  snapshot: firestore.DocumentSnapshot<unknown>
): IQueryConstraint<unknown>
/**
 * Creates a {@link QueryConstraint} that modifies the result set to end before the
 * provided fields relative to the order of the query. The order of the field
 * values must match the order of the order by clauses of the query.
 *
 * @param fieldValues - The field values to end this query before, in order
 * of the query's order by.
 * @returns A {@link QueryConstraint} to pass to `query()`
 */
export function endBefore(...fieldValues: unknown[]): IQueryConstraint<unknown>
export function endBefore(
  ...docOrFields: Array<unknown | firestore.DocumentSnapshot<unknown>>
): IQueryConstraint<unknown> {
  return firestore.endBefore(...docOrFields)
}

/**
 * Creates a {@link QueryConstraint} that modifies the result set to end at the
 * provided document (inclusive). The end position is relative to the order of
 * the query. The document must contain all of the fields provided in the
 * orderBy of the query.
 *
 * @param snapshot - The snapshot of the document to end at.
 * @returns A {@link QueryConstraint} to pass to `query()`
 */
export function endAt(
  snapshot: firestore.DocumentSnapshot<unknown>
): IQueryConstraint<unknown>
/**
 * Creates a {@link QueryConstraint} that modifies the result set to end at the
 * provided fields relative to the order of the query. The order of the field
 * values must match the order of the order by clauses of the query.
 *
 * @param fieldValues - The field values to end this query at, in order
 * of the query's order by.
 * @returns A {@link QueryConstraint} to pass to `query()`
 */
export function endAt(...fieldValues: unknown[]): IQueryConstraint<unknown>
export function endAt(
  ...docOrFields: Array<unknown | firestore.DocumentSnapshot<unknown>>
): IQueryConstraint<unknown> {
  return firestore.endAt(...docOrFields)
}
