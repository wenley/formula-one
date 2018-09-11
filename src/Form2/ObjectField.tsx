import * as React from "react";

import Field from "./Field";

export type FieldsObject<DraftType extends object> = {
  [P in keyof DraftType]: {new (): Field<P, DraftType[P]>}
};

interface ObjectFieldProps<ObjectType extends object> {
  value: ObjectType;
  onChange: (newValue: ObjectType) => void;
  children: (params: {Fields: FieldsObject<ObjectType>}) => React.ReactNode;
}

class ObjectField<ObjectType extends object> extends React.Component<
  ObjectFieldProps<ObjectType>,
  {}
> {}
