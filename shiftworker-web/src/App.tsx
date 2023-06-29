import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const onFileSelected = (files: FileList) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      const result = await postToBackend(text as string);
      setResponse(result);
      setIsLoading(false);
    };
    reader.readAsArrayBuffer(files[0]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Upload iCal file to get started.</p>
        <div style={{ display: "flex" }}>
          <FileInput onChange={onFileSelected} />
          {isLoading && (
            <img
              src={logo}
              className="App-logo"
              style={{ height: 60, width: 60, alignSelf: "center" }}
              alt="logo"
            />
          )}
        </div>
        {response && <p>{response}</p>}
      </header>
    </div>
  );
}

const FileInput = (props: { onChange: (files: FileList) => void }) => (
  <input
    type="file"
    id="avatar"
    name="avatar"
    style={{ alignSelf: "center" }}
    onChange={(e: React.FormEvent<HTMLInputElement>) => {
      const input = e.target as HTMLInputElement;
      if (!input.files) {
        return;
      }
      props.onChange(input.files);
    }}
  />
);

const postToBackend = async (payload: string): Promise<string> => {
  const response = await fetch(
    "https://us-central1-shiftworker-387320.cloudfunctions.net/shiftworkerHttp",
    {
      method: "post",
      body: payload,
      headers: { "Content-Type": "application/octet-stream" },
    }
  );
  return await response.text();
};

export default App;
