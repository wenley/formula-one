import {useState} from 'react';
import Form from '../datastructures/Form';
import peekValue from './peekValue';
import { subscribeUpdateCallback, Link } from '../datastructures/Link';

/** This hook lets you turn in a form schema into a
 * formula-one form object
 * @param initialForm The inital state of your form
 * @return A formula-one form object representing your form */
const useF1 = <T>(initialForm: T): Link<T> => {
  const formTree = new Form(initialForm);
  const [form, updateForm] = useState(formTree);

  // updateCallback is called whenever any onChange is called
  const updateCallback = (): void => {
    updateForm(new Form(peekValue(form.formNode)));
  }

  form.subscribeUpdateCallback(updateCallback);

  return form.formNode;
}

export default useF1;
