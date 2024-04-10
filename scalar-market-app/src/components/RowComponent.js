import React from 'react';
import '../styles/RowComponent.css'; // Make sure to create this CSS file

const RowComponent = ({ children }) => (
  <div className="rowContainer">
    {children}
  </div>
);

export default RowComponent;