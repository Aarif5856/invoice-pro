import React, { useState } from 'react';

function App() {
  const [test, setTest] = useState('App is loading!');

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🧪 Test App</h1>
      <p>{test}</p>
      <button onClick={() => setTest('Button works!')}>
        Test Button
      </button>
    </div>
  );
}

export default App;
