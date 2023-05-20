import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Upload iCal file to get started.
        </p>
        <input type="file"
               id="avatar" name="avatar"
               onChange={(e) => {
                 if (!e.target.files) {
                   return
                 }
                 const reader = new FileReader()
                 reader.onload = async (e) => {
                   const text = (e.target?.result)
                   console.log(text)
                   alert(text)
                 };
                 reader.readAsText(e.target.files[0])
               }}
               >
        </input>
      </header>
    </div>
  );
}

export default App;
