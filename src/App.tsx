import * as React from 'react';
import { useF1, arrayUtils, peekValue } from 'formula-one';
import Button from './Button';
import F1TextInput from './F1TextInput';
import F1ErrorBox from './F1ErrorBox';
import F1SubmitButton from './F1SubmitButton';

const initialForm = {
  name: 'totally not bob',
  age: '1337',
  profile: {
    nick: 'dirak',
  },
  friends: ['jack', 'jill'],
};

const notBob = (name: string): string[] | null => {
  if (name.trim().toLowerCase() === 'bob') {
    return ['Bob is not allowed to submit this form'];
  }

  return null;
}

const onSubmit = (formData: typeof initialForm) => {
  console.log(JSON.stringify(formData));
};

const App = () => {
  const formData = useF1(initialForm);
  const [addFriend, removeFriend] = arrayUtils(formData.friends, '');

  console.log(formData);

  return (
    <form className='App'>
      <F1ErrorBox link={formData} />
      <F1TextInput link={formData.name} label='name' validator={notBob} />
      <F1TextInput link={formData.age} label='age' />
      <F1TextInput link={formData.profile.nick} label='nick' />

      <section className='row'>
        {formData.friends.map((friend, i) => (
          <div key={i}>
            <F1TextInput link={friend} label={`friend ${i + 1}`}/>
            <Button onClick={() => {removeFriend(i)}}>Remove Friend</Button>
          </div>
        ))}
      </section>

      <Button onClick={addFriend}>Add Friend</Button>

      <F1SubmitButton link={formData} onClick={onSubmit}>Submit</F1SubmitButton>

      {JSON.stringify(peekValue(formData))}
    </form>
  );
};

export default App;
