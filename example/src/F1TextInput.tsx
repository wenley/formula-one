import * as React from 'react';
import { useLink, Link } from 'formula-one';
import TextInput from './TextInput';

type Props = {
  label: string,
  link: Link<string>,
  validator?: (value: string) => string[] | string | null,
};

const F1TextInput = ({link, validator, label}: Props) => {
  const {value, onChange, errors} = useLink(link, validator);

  return (
    <div className='text-input'>
      <h3>{label}</h3>
      <TextInput value={value} onChange={onChange} />
      <p style={{color: 'red'}}>{errors.join(' ')}</p>
    </div>
  );
};

export default F1TextInput;
