import React, { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Invoice Pro App - Testing');

  return (
    <div className="App">
      <header>
        <h1>🧾 Invoice Pro</h1>
        <p>{message}</p>
        <button onClick={() => setMessage('App is working!')}>
          Test Button
        </button>
      </header>
      
      <main>
        <div style={{padding: '20px', textAlign: 'center'}}>
          <h2>Minimal Test Version</h2>
          <p>If you can see this, the app is loading correctly.</p>
          
          <button 
            onClick={() => {
              alert('Button works!');
              console.log('Button clicked successfully');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Click Me to Test
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
