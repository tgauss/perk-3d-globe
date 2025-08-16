import { useEffect } from 'react';

const TestReplay = () => {
  useEffect(() => {
    console.log('TEST REPLAY COMPONENT LOADED');
  }, []);

  return (
    <div className="relative w-full h-screen bg-red-900 flex items-center justify-center">
      <div className="bg-white p-8 rounded">
        <h1 className="text-2xl font-bold text-black">TEST REPLAY PAGE</h1>
        <p className="text-black">If you see this, the routing is working!</p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          ▶️ TEST BUTTON
        </button>
      </div>
    </div>
  );
};

export default TestReplay;