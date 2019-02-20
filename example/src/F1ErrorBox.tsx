import * as React from 'react';
import { useLink } from 'formula-one';

type Props = {
  link: any,
}

/** Displays form errors */
const F1ErrorBox = ({link}: Props) => {
  const {childErrors} = useLink(link);
  const errors = childErrors();

  return (
    <div className='error-box'>
      Form Errors:
      <ul>
        {errors.length ?
          errors.map(error => (
            <li key={error} style={{color: 'red'}}>{error}</li>
          ))
          : <li>no errors!</li>
        }
      </ul>
    </div>
  );
};

export default F1ErrorBox;
