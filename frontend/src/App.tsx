import { useState } from "react";
import "./App.scss";

function App() {
  const [urlInput, setUrlInput] = useState("");
  const [thumbnails, setThumbnails] = useState([]);

  // function keydownHandler(e: KeyboardEventHandler<HTMLInputElement>) {
    
  // }

  return (
    <>
      <div>
        <input
          type="text"
          value={urlInput}
          
          onChange={e => { setUrlInput(e.target.value) }}
          onKeyDown={e => {
            if (e.key == "Enter")
              console.log(urlInput);
            }} />
      </div>

      <div>
        { urlInput }
      </div>
    </>
  )
}

export default App
