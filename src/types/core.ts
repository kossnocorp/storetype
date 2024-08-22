import type { TypesaurusUtils as Utils } from "./utils.js";
import type { TypesaurusQuery as Query } from "./query.js";
import type { TypesaurusUpdate as Update } from "./update.js";
import type { TypesaurusFirebase as Firebase } from "./firebase.js";
import type { TypesaurusTransaction as Transaction } from "./transaction.js";
import type { TypesaurusShared as Shared } from "./shared.js";

export namespace TypesaurusCore {
  export interface Function {
    <Schema extends PlainSchema, Opts extends Options>(
      getSchema: ($: SchemaHelpers) => Schema,
      options?: Opts,
    ): DB<Schema>;
  }

  /**
   * Define custom id passing the collection path string as the generic.
   */
  export type Id<Path extends string | symbol | Array<string | symbol>> =
    string & {
      [idBrand]: Path;
    };
  declare const idBrand: unique symbol;

  /**
   * The custom id constrain. Used to define collection id type.
   */
  export type CustomIdConstrain = Id<string> | string | false;

  export type ModelType = ModelObjectType | ModelVariableType;

  export type ModelVariableType =
    | [ModelObjectType]
    | [ModelObjectType, ModelObjectType]
    | [ModelObjectType, ModelObjectType, ModelObjectType]
    | [ModelObjectType, ModelObjectType, ModelObjectType, ModelObjectType]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ]
    | [
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
        ModelObjectType,
      ];

  export type ModelObjectType = object & { length?: never };

  /**
   * Resolves document model from the document definition.
   */
  export type DocModel<Def extends DocDef> =
    // If nothing left on a object, i.e. it's has no keys or get reduces
    // (by calculating shared shape of variable model), then we resolve never
    // to prevent accessing and assigning random stuff to the doc.
    Utils.NeverIfEmpty<DocModelShape<Def>>;

  /**
   * Resolves document model from the document definition. Unlike
   * {@link DocModel} this version resolves unknown if the model has no keys.
   */
  export type DocModelOrUnknown<Def extends DocDef> =
    // If nothing left on a object, i.e. it's has no keys or get reduces
    // (by calculating shared shape of variable model), then we resolve unknown
    // to prevent accessing and assigning random stuff to the doc.
    Utils.UnknownIfEmpty<DocModelShape<Def>>;

  /**
   * Resolves the reduced model or the shared model shape otherwise.
   */
  export type DocModelShape<Def extends DocDef> =
    Def["Flags"]["Reduced"] extends true
      ? // If variable model is reduced after narrowing then return
        // intersection of the model
        IntersectVariableModelType<Def["Model"]>
      : // Otherwise return the shared shape
        SharedVariableModelType<Def["WideModel"]>;

  export type IntersectVariableModelType<Model extends ModelType> =
    Model extends ModelObjectType
      ? Model
      : Model extends [
            infer A extends ModelObjectType,
            infer B extends ModelObjectType,
            infer C extends ModelObjectType,
            infer D extends ModelObjectType,
            infer E extends ModelObjectType,
            infer F extends ModelObjectType,
            infer G extends ModelObjectType,
            infer H extends ModelObjectType,
            infer I extends ModelObjectType,
            infer J extends ModelObjectType,
          ]
        ? Utils.IntersectShape<A, B, C, D, E, F, G, H, I, J>
        : Model extends [
              infer A extends ModelObjectType,
              infer B extends ModelObjectType,
              infer C extends ModelObjectType,
              infer D extends ModelObjectType,
              infer E extends ModelObjectType,
              infer F extends ModelObjectType,
              infer G extends ModelObjectType,
              infer H extends ModelObjectType,
              infer I extends ModelObjectType,
            ]
          ? Utils.IntersectShape<A, B, C, D, E, F, G, H, I>
          : Model extends [
                infer A extends ModelObjectType,
                infer B extends ModelObjectType,
                infer C extends ModelObjectType,
                infer D extends ModelObjectType,
                infer E extends ModelObjectType,
                infer F extends ModelObjectType,
                infer G extends ModelObjectType,
                infer H extends ModelObjectType,
              ]
            ? Utils.IntersectShape<A, B, C, D, E, F, G, H>
            : Model extends [
                  infer A extends ModelObjectType,
                  infer B extends ModelObjectType,
                  infer C extends ModelObjectType,
                  infer D extends ModelObjectType,
                  infer E extends ModelObjectType,
                  infer F extends ModelObjectType,
                  infer G extends ModelObjectType,
                ]
              ? Utils.IntersectShape<A, B, C, D, E, F, G>
              : Model extends [
                    infer A extends ModelObjectType,
                    infer B extends ModelObjectType,
                    infer C extends ModelObjectType,
                    infer D extends ModelObjectType,
                    infer E extends ModelObjectType,
                    infer F extends ModelObjectType,
                  ]
                ? Utils.IntersectShape<A, B, C, D, E, F>
                : Model extends [
                      infer A extends ModelObjectType,
                      infer B extends ModelObjectType,
                      infer C extends ModelObjectType,
                      infer D extends ModelObjectType,
                      infer E extends ModelObjectType,
                    ]
                  ? Utils.IntersectShape<A, B, C, D, E>
                  : Model extends [
                        infer A extends ModelObjectType,
                        infer B extends ModelObjectType,
                        infer C extends ModelObjectType,
                        infer D extends ModelObjectType,
                      ]
                    ? Utils.IntersectShape<A, B, C, D>
                    : Model extends [
                          infer A extends ModelObjectType,
                          infer B extends ModelObjectType,
                          infer C extends ModelObjectType,
                        ]
                      ? Utils.IntersectShape<A, B, C>
                      : Model extends [
                            infer A extends ModelObjectType,
                            infer B extends ModelObjectType,
                          ]
                        ? Utils.IntersectShape<A, B>
                        : Model extends [infer A extends ModelObjectType]
                          ? A
                          : never;

  export type SharedVariableModelType<Model extends ModelType> =
    Model extends ModelObjectType
      ? Model
      : Model extends [
            infer A extends ModelObjectType,
            infer B extends ModelObjectType,
            infer C extends ModelObjectType,
            infer D extends ModelObjectType,
            infer E extends ModelObjectType,
            infer F extends ModelObjectType,
            infer G extends ModelObjectType,
            infer H extends ModelObjectType,
            infer I extends ModelObjectType,
            infer J extends ModelObjectType,
          ]
        ? Utils.SharedShape10<A, B, C, D, E, F, G, H, I, J>
        : Model extends [
              infer A extends ModelObjectType,
              infer B extends ModelObjectType,
              infer C extends ModelObjectType,
              infer D extends ModelObjectType,
              infer E extends ModelObjectType,
              infer F extends ModelObjectType,
              infer G extends ModelObjectType,
              infer H extends ModelObjectType,
              infer I extends ModelObjectType,
            ]
          ? Utils.SharedShape9<A, B, C, D, E, F, G, H, I>
          : Model extends [
                infer A extends ModelObjectType,
                infer B extends ModelObjectType,
                infer C extends ModelObjectType,
                infer D extends ModelObjectType,
                infer E extends ModelObjectType,
                infer F extends ModelObjectType,
                infer G extends ModelObjectType,
                infer H extends ModelObjectType,
              ]
            ? Utils.SharedShape8<A, B, C, D, E, F, G, H>
            : Model extends [
                  infer A extends ModelObjectType,
                  infer B extends ModelObjectType,
                  infer C extends ModelObjectType,
                  infer D extends ModelObjectType,
                  infer E extends ModelObjectType,
                  infer F extends ModelObjectType,
                  infer G extends ModelObjectType,
                ]
              ? Utils.SharedShape7<A, B, C, D, E, F, G>
              : Model extends [
                    infer A extends ModelObjectType,
                    infer B extends ModelObjectType,
                    infer C extends ModelObjectType,
                    infer D extends ModelObjectType,
                    infer E extends ModelObjectType,
                    infer F extends ModelObjectType,
                  ]
                ? Utils.SharedShape6<A, B, C, D, E, F>
                : Model extends [
                      infer A extends ModelObjectType,
                      infer B extends ModelObjectType,
                      infer C extends ModelObjectType,
                      infer D extends ModelObjectType,
                      infer E extends ModelObjectType,
                    ]
                  ? Utils.SharedShape5<A, B, C, D, E>
                  : Model extends [
                        infer A extends ModelObjectType,
                        infer B extends ModelObjectType,
                        infer C extends ModelObjectType,
                        infer D extends ModelObjectType,
                      ]
                    ? Utils.SharedShape4<A, B, C, D>
                    : Model extends [
                          infer A extends ModelObjectType,
                          infer B extends ModelObjectType,
                          infer C extends ModelObjectType,
                        ]
                      ? Utils.SharedShape3<A, B, C>
                      : Model extends [
                            infer A extends ModelObjectType,
                            infer B extends ModelObjectType,
                          ]
                        ? Utils.SharedShape2<A, B>
                        : Model extends [infer A extends ModelObjectType]
                          ? A
                          : never;

  export type UnionVariableModelType<Model extends ModelType> = Model extends [
    infer A extends ModelObjectType,
    infer B extends ModelObjectType,
    infer C extends ModelObjectType,
    infer D extends ModelObjectType,
    infer E extends ModelObjectType,
    infer F extends ModelObjectType,
    infer G extends ModelObjectType,
    infer H extends ModelObjectType,
    infer I extends ModelObjectType,
    infer J extends ModelObjectType,
  ]
    ? A | B | C | D | E | F | G | H | I | J
    : Model extends [
          infer A extends ModelObjectType,
          infer B extends ModelObjectType,
          infer C extends ModelObjectType,
          infer D extends ModelObjectType,
          infer E extends ModelObjectType,
          infer F extends ModelObjectType,
          infer G extends ModelObjectType,
          infer H extends ModelObjectType,
          infer I extends ModelObjectType,
        ]
      ? A | B | C | D | E | F | G | H | I
      : Model extends [
            infer A extends ModelObjectType,
            infer B extends ModelObjectType,
            infer C extends ModelObjectType,
            infer D extends ModelObjectType,
            infer E extends ModelObjectType,
            infer F extends ModelObjectType,
            infer G extends ModelObjectType,
            infer H extends ModelObjectType,
          ]
        ? A | B | C | D | E | F | G | H
        : Model extends [
              infer A extends ModelObjectType,
              infer B extends ModelObjectType,
              infer C extends ModelObjectType,
              infer D extends ModelObjectType,
              infer E extends ModelObjectType,
              infer F extends ModelObjectType,
              infer G extends ModelObjectType,
            ]
          ? A | B | C | D | E | F | G
          : Model extends [
                infer A extends ModelObjectType,
                infer B extends ModelObjectType,
                infer C extends ModelObjectType,
                infer D extends ModelObjectType,
                infer E extends ModelObjectType,
                infer F extends ModelObjectType,
              ]
            ? Utils.SharedShape6<A, B, C, D, E, F>
            : Model extends [
                  infer A extends ModelObjectType,
                  infer B extends ModelObjectType,
                  infer C extends ModelObjectType,
                  infer D extends ModelObjectType,
                  infer E extends ModelObjectType,
                ]
              ? A | B | C | D | E
              : Model extends [
                    infer A extends ModelObjectType,
                    infer B extends ModelObjectType,
                    infer C extends ModelObjectType,
                    infer D extends ModelObjectType,
                  ]
                ? A | B | C | D
                : Model extends [
                      infer A extends ModelObjectType,
                      infer B extends ModelObjectType,
                      infer C extends ModelObjectType,
                    ]
                  ? A | B | C
                  : Model extends [
                        infer A extends ModelObjectType,
                        infer B extends ModelObjectType,
                      ]
                    ? A | B
                    : Model extends [infer A extends ModelObjectType]
                      ? A
                      : Model extends ModelObjectType
                        ? Model
                        : never;

  /**
   * Concats models into single variable model type. Useful to define and export
   * variable models ouside of the centraliazed schema definition.
   */
  export type ConcatModel<
    ModelToConcatTo extends ModelType,
    ModelToConcat extends ModelType,
  > = ModelToConcatTo extends ModelObjectType
    ? ModelToConcat extends ModelObjectType
      ? [ModelToConcatTo, ModelToConcat]
      : ModelToConcat extends ModelVariableType
        ? [ModelToConcatTo, ...ModelToConcat]
        : never
    : ModelToConcatTo extends ModelVariableType
      ? ModelToConcat extends ModelObjectType
        ? [...ModelToConcatTo, ModelToConcat]
        : ModelToConcat extends ModelVariableType
          ? [...ModelToConcatTo, ...ModelToConcat]
          : never
      : never;

  export interface DocDefFlags {
    /** Signifies if a variable model document got reduced to a single shape. */
    Reduced: boolean;
    /** Signifies if a document got narrowed to shared shape. */
    Shared: boolean;
  }

  export interface DocDef {
    Model: ModelType;
    /**
     * The collection name (path segment).
     */
    Name: string;
    Id: Id<string> | string;
    /**
     * If the collection has variable shape, it will contain models tuple,
     * otherwise it will be equal {@link Model}.
     */
    WideModel: ModelType;
    Flags: DocDefFlags;
  }

  export interface DocProps {
    readonly environment: RuntimeEnvironment;
    readonly source: DataSource;
    readonly dateStrategy: ServerDateStrategy;
    readonly pendingWrites: boolean;
  }

  /**
   * The type of a `DocumentChange` may be 'added', 'removed', or 'modified'.
   */
  export type DocChangeType = "added" | "removed" | "modified";

  /**
   * Doc change information. It contains the type of change, the doc after
   * the change, and the position change.
   */
  export interface DocChange<Def extends DocDef, Props extends DocProps> {
    /** The type of change. */
    readonly type: DocChangeType;

    /** The document affected by this change. */
    readonly doc: Doc<Def, Props>;

    /**
     * The index of the changed document in the result set immediately prior to
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange` objects
     * have been applied). Is -1 for 'added' events.
     */
    readonly oldIndex: number;

    /**
     * The index of the changed document in the result set immediately after
     * this `DocumentChange` (i.e. supposing that all prior `DocumentChange`
     * objects and the current `DocumentChange` object have been applied).
     * Is -1 for 'removed' events.
     */
    readonly newIndex: number;
  }

  /**
   * An options object that configures the snapshot contents of `all` and
   * `query`.
   */
  export interface SubscriptionListMeta<
    Def extends DocDef,
    Props extends DocProps,
  > {
    /**
     * Returns an array of the documents changes since the last snapshot. If
     * this is the first snapshot, all documents will be in the list as added
     * changes.
     */
    changes: () => DocChange<Def, Props>[];

    /** The number of documents in the QuerySnapshot. */
    readonly size: number;

    /** True if there are no documents in the QuerySnapshot. */
    readonly empty: boolean;
  }

  export interface DocOptions<Props extends DocProps> {
    serverTimestamps?: Props["dateStrategy"];
  }

  export interface ReadOptions<
    Environment extends RuntimeEnvironment,
    Props extends DocProps & { environment: Environment },
  > extends DocOptions<Props>,
      OperationOptions<Environment> {}

  export type NarrowDef<
    Def extends DocDef,
    ReduceToModel,
    Flags = Def["Flags"],
  > = {
    Model: ReduceToModel;
    Id: Def["Id"];
    WideModel: Def["WideModel"];
    Flags: Flags;
  };

  /**
   * The document type. It contains the reference in the DB and the model data.
   */
  export interface Doc<Def extends DocDef, Props extends DocProps>
    extends DocAPI<Def> {
    type: "doc";

    /** The doc's ref. */
    ref: Ref<Def>;

    data: DocData<Def, Props>;

    readonly props: Props;

    test<Props extends Partial<DocProps>>(
      props: Props,
    ): this is Doc<Def, DocProps & Props>;

    assert<Props extends Partial<DocProps>>(
      props: Props,
    ): asserts this is Doc<Def, DocProps & Props>;

    /**
     * The function narrows the type to shared doc type. Unlike regular doc,
     * shared doc lacks methods which type-safety depends on knowing the full
     * type of the model: `set`, `upset`, and `as`. The `ref` is also limited.
     *
     * When models don't match, it resolves `unknown`.
     */
    as: Shared.DocAs<Def, Props>;
  }

  export type ServerData<Model extends ModelObjectType> = Data<
    Model,
    "present"
  >;

  export type AnyData<Model extends ModelObjectType> = Data<
    Model,
    ServerDateMissing
  >;

  /**
   * Doc data type. Defines the shape of the document data returned from the
   * database. It resolves server dates.
   */
  export type Data<
    Model extends ModelObjectType,
    DateMissing extends ServerDateMissing,
  > = {
    [Key in keyof Model]: DataField<Model[Key], DateMissing>;
  };

  /**
   * Doc data field. Processes data field types and resolves server dates.
   */
  export type DataField<Type, DateMissing extends ServerDateMissing> =
    // First we resolve the server dates
    Type extends ServerDate // Process server dates
      ? // Consider that in web environment server dates might be missing
        DateMissing extends "missing"
        ? Date | null
        : Date
      : // Preserve as-is types
        Type extends
            | Date
            | Ref<any>
            | string
            | number
            | boolean
            | null
            | undefined
        ? Type
        : // Now process arrays
          Type extends Array<infer ItemType>
          ? Array<DataField<ItemType, DateMissing>>
          : // Now process objects
            Type extends object
            ? Data<Type, DateMissing>
            : never; // Nothing shoule be left

  /**
   * The document reference type.
   */
  export interface Ref<Def extends DocDef> extends DocAPI<Def> {
    type: "ref";
    collection: Collection<Def>;
    id: Def["Id"];

    /**
     * The function narrows the type to shared ref type. Unlike regular ref,
     * shared ref lacks methods which type-safety depends on knowing the full
     * type of the model: `set`, `upset`, and `as`. The `collection` is also
     * limited.
     *
     * When models don't match, it resolves `unknown`.
     */
    as: Shared.RefAs<Def>;
  }

  export type ServerDateMissing = "missing" | "present";

  export type ServerDateStrategy = "estimate" | "previous" | "none";

  export type RuntimeEnvironment = "server" | "client";

  export type DataSource = "cache" | "database";

  export interface ServerDate extends Date {
    [serverDateBrand]: true;
  }
  declare const serverDateBrand: unique symbol;

  export type DocData<
    Def extends DocDef,
    Props extends DocProps,
  > = Props["environment"] extends "server"
    ? ServerData<IntersectVariableModelType<Def["Model"]>>
    : Props["source"] extends "database"
      ? Data<IntersectVariableModelType<Def["Model"]>, "present">
      : Props["dateStrategy"] extends "estimate" | "previous"
        ? Data<IntersectVariableModelType<Def["Model"]>, "present">
        : Data<IntersectVariableModelType<Def["Model"]>, "missing">;

  /**
   * Write data helpers, whichs allow to set special values, such as server date,
   * increment, etc.
   */
  export interface WriteHelpers<_Model> {
    /**
     * Returns server date value that sets the field to the server date.
     */
    serverDate(): ValueServerDate;

    /**
     * Returns remove value that removes the field.
     */
    remove(): ValueRemove;

    /**
     * Returns increment value that increments the field by the given value.
     *
     * @param value - The number to increment by.
     */
    increment<NumberType extends number>(
      value: NumberType,
    ): ValueIncrement<NumberType>;

    /**
     * Returns array union value that unions the given values with the array.
     *
     * @param values - The values to union to the array.
     */
    arrayUnion<Type>(values: Type | Type[]): ValueArrayUnion<Type>;

    /**
     * Returns array remove value that removes the given values from the array.
     *
     * @param values - The values to remove from the array.
     */
    arrayRemove<Type>(values: Type | Type[]): ValueArrayRemove<Type>;
  }

  /**
   * Assign argument. It resolves to assign data or getter function that returns
   * the assign data. It's used in add, set and upset functions.
   */
  export type AssignArg<
    Model extends ModelObjectType,
    Props extends DocProps,
  > = WriteData<Model, Props> | AssignGetter<Model, Props>;

  /**
   * Assign data getter, accepts helper functions and returns the assign data.
   */
  export type AssignGetter<
    Model extends ModelObjectType,
    Props extends DocProps,
  > = ($: WriteHelpers<Model>) => WriteData<Model, Props>;

  /**
   * Type of the data passed to assign functions (add, set and upset).
   * It extends the model allowing to set special values, such as server date,
   * increment, etc.
   */
  export type WriteData<
    Model extends ModelObjectType,
    Props extends DocProps,
  > = {
    [Key in keyof Model]: WriteField<Model, Key, Model[Key], Props>;
  };

  /**
   * Write data field. Processes write data field types and adds corresponding
   * write helpers such as server data, increment, etc. Used in assign
   * functions (add, set and upset) and update functions.
   */
  export type WriteField<
    Parent,
    Key extends keyof Parent,
    Type,
    Props extends DocProps,
  > =
    // First we process the number type
    Type extends number
      ? WriteFieldNumber<Parent, Key, Type>
      : // Now we process server dates
        Type extends ServerDate
        ? WriteFieldServerDate<Parent, Key, Props>
        : // Now we process undefined
          Type extends undefined
          ? WriteFieldUndefined<Parent, Key>
          : // Now we process as-is types
            Type extends Date | Ref<any> | string | boolean | null
            ? WriteFieldAsIs<Parent, Key>
            : // Now process arrays
              Type extends Array<infer ItemType>
              ? WriteFieldArray<Parent, Key, ItemType>
              : // Now process objects
                Type extends object
                ? WriteFieldObject<Parent, Key, Type, Props>
                : never; // Nothing shoule be left

  /**
   * Write field object. Resolves object union with special value types.
   */
  export type WriteFieldObject<
    Parent,
    Key extends keyof Parent,
    Type extends ModelObjectType,
    Props extends DocProps,
  > = WriteData<Type, Props> | MaybeValueRemove<Parent, Key>;

  /**
   * Number write field. Resolves number union with special value types.
   */
  export type WriteFieldNumber<
    Parent,
    Key extends keyof Parent,
    Type extends number,
  > = Parent[Key] | ValueIncrement<Type> | MaybeValueRemove<Parent, Key>;

  /**
   * Server data write field. Resolves server date union with special value
   * types. When used in the server environment, it resolves to date as well.
   */
  export type WriteFieldServerDate<
    Parent,
    Key extends keyof Parent,
    Props extends DocProps,
  > =
    // Date can be used only in the server environment
    Props["environment"] extends "server"
      ? Date | ValueServerDate | MaybeValueRemove<Parent, Key>
      : ValueServerDate | MaybeValueRemove<Parent, Key>;

  /**
   * Undefined write field. Resolves undefined union with special value types.
   */
  export type WriteFieldUndefined<Parent, Key extends keyof Parent> =
    | (Utils.ActuallyUndefined<Parent, Key> extends true
        ? undefined | null
        : never)
    | MaybeValueRemove<Parent, Key>;

  /**
   * As-is write field. Resolves as-is types union with special value types.
   */
  export type WriteFieldAsIs<Parent, Key extends keyof Parent> =
    | Exclude<Parent[Key], undefined>
    | MaybeValueRemove<Parent, Key>;

  /**
   * Array write field. Resolves array union with special value types.
   */
  export type WriteFieldArray<Parent, Key extends keyof Parent, ItemType> =
    | Array<WriteArrayItem<ItemType>>
    | ValueArrayUnion<WriteArrayItem<ItemType>>
    | ValueArrayRemove<WriteArrayItem<ItemType>>
    | MaybeValueRemove<Parent, Key>;

  /**
   * Array write item type. Unlike {@link WriteField} it disallows arrays,
   * server dates and other special value types.
   */
  export type WriteArrayItem<Type> =
    // First we resolve never for server dates and arrays as they aren't allowed in arrays
    Type extends ServerDate | Array<any>
      ? never
      : // Now process as-is types
        Type extends
            | Date
            | Ref<any>
            | string
            | number
            | boolean
            | null
            | undefined
        ? Type
        : // Now process objects
          Type extends object
          ? WriteArrayItemObject<Type>
          : never; // Nothing shoule be left

  /**
   * Array write item object type. It's an array-nested object and behaves
   * differently than {@link WriteData}.
   */
  export type WriteArrayItemObject<Data extends ModelObjectType> = {
    [Key in keyof Data]: WriteArrayObjectField<Data[Key]>;
  };

  /**
   * It differs from {@link WriteArrayItem} as it allows arrays.
   */
  export type WriteArrayObjectField<Type> =
    // First we resolve arrays as they aren't allowed in arrays but allowed in objects nested to arrays
    Type extends Array<infer Item>
      ? Array<WriteArrayItem<Item>>
      : // Now we can delegate to WriteArrayItem
        WriteArrayItem<Type>;

  /**
   * Resolves the remove type value unless the key is required.
   */
  export type MaybeValueRemove<Parent, Key extends keyof Parent> =
    Utils.RequiredKey<Parent, Key> extends true ? never : ValueRemove;

  /**
   * Available value kinds.
   */
  export type ValueKind =
    | "remove"
    | "increment"
    | "arrayUnion"
    | "arrayRemove"
    | "serverDate";

  /**
   * The remove value type.
   */
  export interface ValueRemove {
    type: "value";
    kind: "remove";
  }

  /**
   * The increment value type. It holds the increment value.
   */
  export interface ValueIncrement<NumberType extends number> {
    type: "value";
    kind: "increment";
    number: NumberType;
  }

  /**
   * The array union value type. It holds the payload to union.
   */
  export interface ValueArrayUnion<Type> {
    type: "value";
    kind: "arrayUnion";
    values: Type[];
  }

  /**
   * The array remove value type. It holds the data to remove from the target array.
   */
  export interface ValueArrayRemove<Type> {
    type: "value";
    kind: "arrayRemove";
    values: Type[];
  }

  /**
   * The server date value type.
   */
  export interface ValueServerDate {
    type: "value";
    kind: "serverDate";
  }

  export interface SchemaHelpers {
    collection<
      Model extends ModelType,
      CustomId extends CustomIdConstrain = false,
    >(): PlainCollection<Model, CustomId>;
  }

  export interface OperationOptions<Environment extends RuntimeEnvironment> {
    as?: Environment;
  }

  export type SubscriptionErrorCallback = (error: unknown) => any;

  export type OffSubscription = () => void;

  export interface OffSubscriptionWithCatch {
    (): void;
    catch(callback: SubscriptionErrorCallback): OffSubscription;
  }

  export interface SubscriptionPromise<
    Request,
    Result,
    SubscriptionMeta = undefined,
  > extends Promise<Result> {
    request: Request;

    on: SubscriptionPromiseOn<Request, Result, SubscriptionMeta>;
  }

  export interface SubscriptionPromiseOn<
    Request,
    Result,
    SubscriptionMeta = undefined,
  > {
    (
      callback: SubscriptionPromiseCallback<Result, SubscriptionMeta>,
    ): OffSubscriptionWithCatch;

    request: Request;
  }

  export type SubscriptionPromiseCallback<
    Result,
    SubscriptionMeta = undefined,
  > = SubscriptionMeta extends undefined
    ? (result: Result) => void
    : (result: Result, meta: SubscriptionMeta) => void;

  export interface Request<Kind> {
    type: "request";
    kind: Kind;
    path: string;
    group?: boolean;
  }

  export interface GetRequest extends Request<"get"> {
    id: string;
  }

  export interface AllRequest extends Request<"all"> {}

  export interface ManyRequest extends Request<"many"> {
    ids: string;
  }

  export interface QueryRequest extends Request<"many"> {
    queries: Query.Query<any>[];
  }

  export interface DocAPI<Def extends DocDef> {
    get<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      options?: ReadOptions<Environment, Props>,
    ): SubscriptionPromise<GetRequest, Doc<Def, Props> | null>;

    set<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      data: AssignArg<UnionVariableModelType<Def["WideModel"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    upset<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      data: AssignArg<UnionVariableModelType<Def["WideModel"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    update: Update.DocFunction<Def>;

    remove(): Promise<Ref<Def>>;

    narrow<NarrowToModel extends ModelType>(
      fn: DocNarrowFunction<
        IntersectVariableModelType<Def["WideModel"]>,
        NarrowToModel
      >,
    ):
      | Doc<
          {
            Model: NarrowToModel;
            Name: Def["Name"];
            Id: Def["Id"];
            WideModel: Def["WideModel"];
            Flags: Def["Flags"] & { Reduced: true };
          },
          DocProps
        >
      | undefined;
  }

  export type DocNarrowFunction<
    InputModel extends ModelType,
    ExpectedModel extends ModelType,
  > = (data: InputModel) => false | Nullify<ExpectedModel>;

  export interface CollectionAPI<Def extends DocDef> {
    all<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      options?: ReadOptions<Environment, Props>,
    ): SubscriptionPromise<
      AllRequest,
      Doc<Def, Props>[],
      SubscriptionListMeta<Def, Props>
    >;

    query: Query.Function<Def>;

    count(): Promise<number>;

    sum(field: Utils.KeysOfType<DocModel<Def>, number>): Promise<number>;

    average(field: Utils.KeysOfType<DocModel<Def>, number>): Promise<number>;
  }

  /**
   *
   */
  export interface Collection<Def extends DocDef> extends CollectionAPI<Def> {
    /** The collection type */
    type: "collection";

    /** The collection path */
    path: string;

    /** The collection name */
    name: string;

    get<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      options?: ReadOptions<Environment, Props>,
    ): SubscriptionPromise<GetRequest, Doc<Def, Props> | null>;

    many<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      ids: Def["Id"][],
      options?: ReadOptions<Environment, Props>,
    ): SubscriptionPromise<ManyRequest, Array<Doc<Def, Props> | null>>;

    add<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      data: AssignArg<UnionVariableModelType<Def["Model"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    set<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      data: AssignArg<UnionVariableModelType<Def["WideModel"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    upset<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      data: AssignArg<UnionVariableModelType<Def["WideModel"]>, Props>,
      options?: OperationOptions<Environment>,
    ): Promise<Ref<Def>>;

    update: Update.CollectionFunction<Def>;

    remove(id: Def["Id"]): Promise<Ref<Def>>;

    ref(id: Def["Id"]): Ref<Def>;

    doc<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      snapshot: Firebase.Snapshot,
    ): Doc<Def, Props> | null;

    doc<
      Environment extends RuntimeEnvironment,
      Props extends DocProps & { environment: Environment },
    >(
      id: Def["Id"],
      data: DocData<Def, Props>,
      options?: OperationOptions<Environment>,
    ): Doc<Def, Props>;

    /**
     * Cast a string to typed document id.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @param id - the string to cast to the typed document id
     * @returns typed document id
     *
     * @example
     * const commentId = db.comments.id('t2nNOgoQY8a5vcvWl1yAz26Ue7k2')
     */
    id(id: string): Def["Id"];

    /**
     * Generate random document id using Firebase.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @returns promise to random typed document id
     *
     * @example
     * const newCommentId = await db.comments.id()
     */
    id(): Promise<Def["Id"]>;

    /**
     * The function narrows the type to shared collection type. Unlike regular
     * collection, shared collection lacks methods which type-safety depends on
     * knowing the full type of the model: `set`, `upset`, and `as`. The `ref`
     * is also limited.
     *
     * When models don't match, it resolves `unknown`.
     */
    as: Shared.CollectionAs<Def>;
  }

  export interface CollectionConfig {
    path?: string;
  }

  export interface NestedCollection<Def extends DocDef, Schema extends AnyDB>
    extends Collection<Def> {
    (id: Def["Id"]): Schema;

    schema: Schema;

    sub: NestedCollectionShortcuts<Schema>;
  }

  export type NestedCollectionShortcuts<Schema extends AnyDB> = {
    [Path in keyof Schema]: Path extends string
      ? Schema[Path] extends NestedCollection<infer Def, infer Schema>
        ? NestedCollectionShortcut<Def, Schema>
        : Schema[Path] extends Collection<infer Def>
          ? CollectionShortcut<Def>
          : Schema[Path]
      : never;
  };

  export interface CollectionShortcut<Def extends DocDef> {
    /**
     * Cast a string to typed document id.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @param id - the string to cast to the typed document id
     * @returns typed document id
     *
     * @example
     * const commentId = db.posts.sub.comments.id('t2nNOgoQY8a5vcvWl1yAz26Ue7k2')
     */
    id(id: string): Def["Id"];

    /**
     * Generate random document id using Firebase.
     *
     * [Learn more on the docs website](https://typesaurus.com/docs/api/id).
     *
     * @returns promise to random typed document id
     *
     * @example
     * const newCommentId = await db.posts.sub.comments.id()
     */
    id(): Promise<Def["Id"]>;
  }

  export interface NestedCollectionShortcut<
    Def extends DocDef,
    Schema extends AnyDB,
  > extends CollectionShortcut<Def> {
    sub: NestedCollectionShortcuts<Schema>;
  }

  export type AnyCollection<Def extends DocDef> =
    | Collection<Def>
    | NestedCollection<Def, AnyDB>;

  export interface PlainCollection<
    Model extends ModelType,
    CustomId extends CustomIdConstrain = false,
    CustomName extends string | false = false,
  > {
    /** The collection type */
    type: "collection";

    sub<Schema extends PlainSchema>(
      schema: Schema,
    ): NestedPlainCollection<Model, Schema, CustomId, CustomName>;

    name<Name extends string>(
      name: Name,
    ): PlainCollection<Model, CustomId, Name>;
  }

  export interface NestedPlainCollection<
    _Model extends ModelType,
    Schema extends PlainSchema,
    _CustomId extends CustomIdConstrain = false,
    _CustomName extends string | false = false,
  > {
    /** The collection type */
    type: "collection";

    schema: Schema;
  }

  export type AnyPlainCollection =
    | PlainCollection<any>
    | NestedPlainCollection<any, PlainSchema>;

  export interface PlainSchema {
    [Path: string | symbol]:
      | PlainCollection<any>
      | NestedPlainCollection<any, PlainSchema>;
  }

  export interface AnyDB {
    [CollectionPath: string]: AnyCollection<any>;
  }

  export type DB<Schema, BasePath extends string | false = false> = {
    [Name in keyof Schema]: Name extends string
      ? Schema[Name] extends NestedPlainCollection<
          infer Model,
          infer Schema,
          infer CustomId,
          infer CustomName
        >
        ? NestedCollection<
            CollectionDef<Name, Model, CustomId, CustomName, BasePath>,
            DB<Schema, Utils.ComposePath<BasePath, Name>>
          >
        : Schema[Name] extends PlainCollection<
              infer Model,
              infer CustomId,
              infer CustomName
            >
          ? Collection<
              CollectionDef<Name, Model, CustomId, CustomName, BasePath>
            >
          : never
      : never;
  };

  /**
   * Resolves collection def.
   */
  export type CollectionDef<
    Name extends string,
    Model extends ModelType,
    CustomId,
    CustomName,
    BasePath extends string | false,
  > = {
    Model: NullifyModel<Model>;
    Name: CustomName extends string ? CustomName : Name;
    Id: CustomId extends Id<any> | string
      ? CustomId
      : Id<Utils.ComposePath<BasePath, Name>>;
    WideModel: NullifyModel<Model>;
    Flags: DocDefFlags;
  };

  /**
   * Infers schema types. Useful to define function arguments that accept
   * collection doc, ref, id or data.
   */
  export type InferSchema<DB extends TypesaurusCore.DB<any, any>> = {
    /**
     * Collection types, use `["Id"]`, `["Ref"]` and `["Doc"]` to access common
     * document types.
     *
     * If the collection contains subcollections use its path to access
     * the subcollection types, i.e. `["comments"]["Id"]`.
     */
    [Path in keyof DB]: DB[Path] extends
      | Collection<infer Def>
      | NestedCollection<infer Def, any>
      ? {
          /**
           * The type allows to access subcollections.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#subcollections)
           */
          sub: DB[Path] extends NestedCollection<
            any,
            infer Schema extends TypesaurusCore.DB<any, any>
          >
            ? InferSchema<Schema>
            : never;

          /**
           * The type represents the document id.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#id)
           */
          Id: Def["Id"];

          /**
           * The type represents the collection Collection instance.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#collection)
           */
          Collection: DB[Path];

          /**
           * The type represents the document Ref instance.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#ref)
           */
          Ref: TypesaurusCore.Ref<Def>;

          /**
           * The type represents the document Doc instance.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#doc)
           */
          Doc: TypesaurusCore.Doc<Def, DocProps>;

          /**
           * The type represents the document data. It’s what you get reading or
           * creating a document via collection’s doc.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#data)
           */
          Data: Data<
            IntersectVariableModelType<Def["Model"]>,
            ServerDateMissing
          >;

          /**
           * The type represents the result of a reading operation, like the get
           * method. It can be the Doc instance, null if the document is not
           * found, or undefined if the operation is still in progress.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#result)
           */
          Result: Doc<Def, DocProps> | null | undefined;

          /**
           * The type represents the argument of an assign function. It can be
           * used for all writing operations and expects the complete document
           * data.
           *
           * It unions AssignData and AssignGetter types.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#assignarg)
           */
          AssignArg: AssignArg<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * The type represents the data of an assign function. It can be used
           * for all writing operations and expects the complete document data.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#assigndata)
           */
          AssignData: WriteData<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * The type represents the getter of an assign function. It can be
           * used for all writing operations and expects the complete document
           * data.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#assigngetter)
           */
          AssignGetter: AssignGetter<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * The type represents the write helpers of an assign function. It can
           * be used for all writing operations.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#writehelpers)
           */
          WriteHelpers: WriteHelpers<Def["Model"]>;

          /**
           * The type represents the update builder object.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#updatebuilder)
           */
          UpdateBuilder: Update.Builder<Def, DocProps>;

          /**
           * The type represents the argument of an update function.
           *
           * It unions UpdateData and UpdateGetter types.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#updatearg)
           */
          UpdateArg: Update.Arg<Def, DocProps>;

          /**
           * The type represents the data of an update function.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#updatedata)
           */
          UpdateData: Update.Data<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * The type represents the getter of an update function.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#updategetter)
           */
          UpdateGetter: Update.ArgGetter<Def, DocProps>;

          /**
           * The type represents the update helpers of an update function.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#updatehelpers)
           */
          UpdateHelpers: Update.Helpers<Def, DocProps>;

          /**
           * The type represents the query builder object.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#querybuilder)
           */
          QueryBuilder: Query.Builder<Def, DocProps>;

          /**
           * The type represents what the query method expects you to return
           * from the query function.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#querydata).
           */
          QueryData: Query.Data<Def>;

          /**
           * The type represents the query function.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#querygetter)
           */
          QueryGetter: Query.Getter<Def>;

          /**
           * The type represents the query helpers of a query function.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#queryhelpers)
           */
          QueryHelpers: Query.Helpers<Def>;

          /**
           * The type is a server version of the Doc type where server dates are
           * always present, unlike the client version where they might be null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverdoc)
           */
          ServerDoc: TypesaurusCore.Doc<
            Def,
            DocProps & { environment: "server" }
          >;

          /**
           * The type is a server version of the Data type where server dates
           * are always present, unlike the client version where they might be
           * null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverdata)
           */
          ServerData: ServerData<IntersectVariableModelType<Def["Model"]>>;

          /**
           * The type is a server version of the Result type where server dates
           * are always present, unlike the client version where they might be
           * null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverresult)
           */
          ServerResult: Doc<Def, DocProps> | null | undefined;

          /**
           * The type is a server version of the AssignArg type where server
           * dates are always present, unlike the client version where they
           * might be null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverassignarg)
           */
          ServerAssignArg: AssignArg<
            IntersectVariableModelType<Def["Model"]>,
            DocProps
          >;

          /**
           * The type is a server version of the AssignData type where server
           * dates are always present, unlike the client version where they
           * might be null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverassigndata)
           */
          ServerAssignData: WriteData<
            IntersectVariableModelType<Def["Model"]>,
            DocProps & { environment: "server" }
          >;

          /**
           * The type is a server version of the AssignGetter type where server
           * dates are always present, unlike the client version where they
           * might be null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverassigngetter)
           */
          ServerAssignGetter: AssignGetter<
            IntersectVariableModelType<Def["Model"]>,
            DocProps & { environment: "server" }
          >;

          /**
           * The type is a server version of the UpdateBuilder type where server
           * dates are always present, unlike the client version where they
           * might be null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverupdatebuilder)
           */
          ServerUpdateBuilder: Update.Builder<
            Def,
            DocProps & { environment: "server" }
          >;

          /**
           * The type is a server version of the UpdateArg type where server
           * dates are always present, unlike the client version where they
           * might be null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverupdatearg)
           */
          ServerUpdateArg: Update.Arg<
            Def,
            DocProps & { environment: "server" }
          >;

          /**
           * The type is a server version of the UpdateData type where server
           * dates are always present, unlike the client version where they
           * might be null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverupdatedata)
           */
          ServerUpdateData: Update.Data<
            Def,
            DocProps & { environment: "server" }
          >;

          /**
           * The type is a server version of the UpdateGetter type where server
           * dates are always present, unlike the client version where they
           * might be null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverupdategetter)
           */
          ServerUpdateGetter: Update.ArgGetter<
            Def,
            DocProps & { environment: "server" }
          >;

          /**
           * The type is a server version of the UpdateHelpers type where server
           * dates are always present, unlike the client version where they
           * might be null.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#serverupdatehelpers)
           */
          ServerUpdateHelpers: Update.Helpers<
            Def,
            DocProps & { environment: "server" }
          >;

          /**
           * The type represents transaction read document. What you return from
           * the transaction read function.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#transactionreaddoc)
           */
          TransactionReadDoc: Transaction.ReadDoc<Def, DocProps>;

          /**
           * The type represents transaction write document. What you get in
           * the transaction write function.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#transactionwritedoc)
           */
          TransactionWriteDoc: Transaction.WriteDoc<Def, DocProps>;

          /**
           * The type represents the document definition. It’s in many methods
           * as a generic parameter.
           *
           * [Learn more on the docs website](https://typesaurus.com/types/schema/#def)
           */
          Def: Def;
        }
      : never;
  };

  /**
   * Narrow doc type. If your doc has multiple shapes, the type will help you
   * narrow down data type to a specific type.
   */
  export type NarrowDoc<
    OriginalDoc extends Doc<any, any>,
    NarrowToModel extends ModelObjectType,
  > =
    OriginalDoc extends Doc<
      infer Def extends DocDef,
      infer Props extends DocProps
    >
      ? NarrowToModel extends IntersectVariableModelType<Def["WideModel"]>
        ? Doc<
            {
              Model: NarrowToModel;
              Name: Def["Name"];
              Id: Def["Id"];
              WideModel: Def["WideModel"];
              Flags: Def["Flags"] & { Reduced: true };
            },
            Props
          >
        : never
      : never;

  /**
   * Deeply normalizes server dates in a given type. It replaces ServerDate with
   * regular Date. It's useful when reusing interfaces in a non-Typesaurus
   * environment or when you need to store it in an array (where server dates
   * are not allowed).
   */
  export type NormalizeServerDates<Type> = Type extends ServerDate
    ? Date
    : Type extends Date | Ref<any> | string | number | boolean
      ? Type
      : Type extends Array<infer Item>
        ? Array<NormalizeServerDates<Item>>
        : Type extends object
          ? { [Key in keyof Type]: NormalizeServerDates<Type[Key]> }
          : never;

  /**
   * The options. It allows to configure the Firebase settings.
   */
  export interface Options {
    /** The app name. */
    app?: string;
    /** The database ID, if different from (default) **/
    databaseId?: string;
    /** The server options. */
    server?: OptionsServer;
    /** The client options. */
    client?: OptionsClient;
  }

  /**
   * The server options.
   */
  export interface OptionsServer {
    /** The server app name. It takes priority over the root's app name. */
    app?: string;
    /** The database ID, if different from (default) **/
    databaseId?: string;
    /** The option forces Firestore the use of REST transport until an operation
     * requires gRPC. It helps to speed up the cold start of the Functions. */
    preferRest?: boolean;
  }

  /**
   * The client options.
   */
  export interface OptionsClient {
    /** The client app name. It takes priority over the root's app name. */
    app?: string;
    /** The database ID, if different from (default) **/
    databaseId?: string;
  }

  /**
   * Deeply adds null to all undefined values.
   */
  export type Nullify<Type> =
    // First we extract null and undefined
    Type extends null | undefined
      ? Type | null
      : // Now we extract as-is types
        Type extends ServerDate | Date | Ref<any> | string | number | boolean
        ? Type
        : // Now extract array types
          Type extends Array<infer Item>
          ? Array<Nullify<Item>>
          : // Now extract object types
            Type extends object
            ? {
                [Key in keyof Type]: Utils.ActuallyUndefined<
                  // If field is optionally undefined, exclude undefined before nullifing the rest
                  Type,
                  Key
                > extends true
                  ? Nullify<Type[Key]>
                  : Nullify<Exclude<Type[Key], undefined>>;
              }
            : never;

  /**
   * Deeply adds null to shapes of a variable model.
   */
  export type NullifyModel<Model extends ModelType> =
    Model extends ModelObjectType
      ? Nullify<Model>
      : Model extends [
            infer A extends ModelObjectType,
            infer B extends ModelObjectType,
            infer C extends ModelObjectType,
            infer D extends ModelObjectType,
            infer E extends ModelObjectType,
            infer F extends ModelObjectType,
            infer G extends ModelObjectType,
            infer H extends ModelObjectType,
            infer I extends ModelObjectType,
            infer J extends ModelObjectType,
          ]
        ? [
            Nullify<A>,
            Nullify<B>,
            Nullify<C>,
            Nullify<D>,
            Nullify<E>,
            Nullify<F>,
            Nullify<G>,
            Nullify<H>,
            Nullify<I>,
            Nullify<J>,
          ]
        : Model extends [
              infer A extends ModelObjectType,
              infer B extends ModelObjectType,
              infer C extends ModelObjectType,
              infer D extends ModelObjectType,
              infer E extends ModelObjectType,
              infer F extends ModelObjectType,
              infer G extends ModelObjectType,
              infer H extends ModelObjectType,
              infer I extends ModelObjectType,
            ]
          ? [
              Nullify<A>,
              Nullify<B>,
              Nullify<C>,
              Nullify<D>,
              Nullify<E>,
              Nullify<F>,
              Nullify<G>,
              Nullify<H>,
              Nullify<I>,
            ]
          : Model extends [
                infer A extends ModelObjectType,
                infer B extends ModelObjectType,
                infer C extends ModelObjectType,
                infer D extends ModelObjectType,
                infer E extends ModelObjectType,
                infer F extends ModelObjectType,
                infer G extends ModelObjectType,
                infer H extends ModelObjectType,
              ]
            ? [
                Nullify<A>,
                Nullify<B>,
                Nullify<C>,
                Nullify<D>,
                Nullify<E>,
                Nullify<F>,
                Nullify<G>,
                Nullify<H>,
              ]
            : Model extends [
                  infer A extends ModelObjectType,
                  infer B extends ModelObjectType,
                  infer C extends ModelObjectType,
                  infer D extends ModelObjectType,
                  infer E extends ModelObjectType,
                  infer F extends ModelObjectType,
                  infer G extends ModelObjectType,
                ]
              ? [
                  Nullify<A>,
                  Nullify<B>,
                  Nullify<C>,
                  Nullify<D>,
                  Nullify<E>,
                  Nullify<F>,
                  Nullify<G>,
                ]
              : Model extends [
                    infer A extends ModelObjectType,
                    infer B extends ModelObjectType,
                    infer C extends ModelObjectType,
                    infer D extends ModelObjectType,
                    infer E extends ModelObjectType,
                    infer F extends ModelObjectType,
                  ]
                ? [
                    Nullify<A>,
                    Nullify<B>,
                    Nullify<C>,
                    Nullify<D>,
                    Nullify<E>,
                    Nullify<F>,
                  ]
                : Model extends [
                      infer A extends ModelObjectType,
                      infer B extends ModelObjectType,
                      infer C extends ModelObjectType,
                      infer D extends ModelObjectType,
                      infer E extends ModelObjectType,
                    ]
                  ? [Nullify<A>, Nullify<B>, Nullify<C>, Nullify<D>, Nullify<E>]
                  : Model extends [
                        infer A extends ModelObjectType,
                        infer B extends ModelObjectType,
                        infer C extends ModelObjectType,
                        infer D extends ModelObjectType,
                      ]
                    ? [Nullify<A>, Nullify<B>, Nullify<C>, Nullify<D>]
                    : Model extends [
                          infer A extends ModelObjectType,
                          infer B extends ModelObjectType,
                          infer C extends ModelObjectType,
                        ]
                      ? [Nullify<A>, Nullify<B>, Nullify<C>]
                      : Model extends [
                            infer A extends ModelObjectType,
                            infer B extends ModelObjectType,
                          ]
                        ? [Nullify<A>, Nullify<B>]
                        : Model extends [infer A extends ModelObjectType]
                          ? [Nullify<A>]
                          : never;
}
