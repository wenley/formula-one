import * as React from 'react';
import { useLink, Link } from 'formula-one';
import Button from './Button';

type Props = {
  link: Link<any>,
  onClick?: (formData: any) => void,
  children: string,
}

const F1SubmitButton = ({link, onClick, children}: Props) => {
  const {value} = useLink(link);

  const handleClick = () => {
    onClick && onClick(value);
  }

  return(
    <Button type="submit" onClick={handleClick}>
      {children}
    </Button>
  );
}

export default F1SubmitButton;
