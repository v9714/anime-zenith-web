import { useState } from "react";

// Minimal test component to isolate React hooks issue
export default function TestHome() {
  console.log('TestHome: Starting component render');
  
  try {
    const [test, setTest] = useState('working');
    console.log('TestHome: useState working, value:', test);
    
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Test Home Component</h1>
        <p>useState is working: {test}</p>
        <button onClick={() => setTest('clicked')} style={{ padding: '10px', margin: '10px' }}>
          Test State Update
        </button>
      </div>
    );
  } catch (error) {
    console.error('TestHome: Error in component:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error in Test Component</h1>
        <p>useState failed to initialize</p>
      </div>
    );
  }
}