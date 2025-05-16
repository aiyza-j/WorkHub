import React from 'react';

const HeavyComponent = () => {
 //throw new Error("Simulated crash!");
  return <div style={{ padding: '2rem' }}> I am loaded successfully!</div>;
};

export default HeavyComponent;
