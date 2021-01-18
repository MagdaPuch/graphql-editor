import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import { GraphQLEditor } from '../src/index';
import { PassedSchema } from '../src/Models';
import * as schemas from './schema';

export const App = () => {
  const [mySchema, setMySchema] = useState<PassedSchema>({
    code: '',
    libraries: '',
  });
  useEffect(() => {
    setTimeout(() => {
      setMySchema({
        code: schemas.pizza,
        libraries: schemas.pizzaLibrary,
      });
    }, 2000);
  }, []);
  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        alignSelf: 'stretch',
        display: 'flex',
        position: 'relative',
      }}
    >
      <GraphQLEditor
        setSchema={(props) => {
          setMySchema(props);
        }}
        schema={mySchema}
      />
    </div>
  );
};

render(<App />, document.getElementById('root'));
