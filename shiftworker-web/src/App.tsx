import React from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Upload iCal file to get started.</p>
        <input
          type="file"
          id="avatar"
          name="avatar"
          onChange={(e) => {
            if (!e.target.files) {
              return;
            }
            const reader = new FileReader();
            reader.onload = async (e) => {
              const text = e.target?.result;
              console.log(text);
              postToBackend(text as string);
            };
            reader.readAsArrayBuffer(e.target.files[0]);
          }}
        ></input>
      </header>
    </div>
  );
}

const postToBackend = async (payload: string) => {
  await fetch(
    "https://us-central1-shiftworker-387320.cloudfunctions.net/shiftworkerHttp",
    {
      method: "post",
      body: payload,
      headers: { "Content-Type": "application/octet-stream" },
    }
  );
};

export default App;
