import { useState } from "react";
import axios from "axios";
import "./App.scss";

function App() {
  const [urlInput, setUrlInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const [thumbnails, setThumbnails] = useState([]);

  // function keydownHandler(e: KeyboardEventHandler<HTMLInputElement>) {
    
  // }

  return (
    <>
      <div>
        <input
          type="text"
          disabled={isDownloading}
          value={urlInput}

          onChange={e => { setUrlInput(e.target.value) }}
          onKeyDown={async e => {
            if (e.key == "Enter") {
              if (isDownloading) return;

              setIsDownloading(true);

              const postBody = {
                url: urlInput
              };

              const response = await axios.post("http://localhost:8001/api/download", postBody);
              console.log(response.data);

              setIsDownloading(false);
            }
            }} />
      </div>

      <div>
        { isDownloading
          ? "Downloading..."
          : null }
      </div>
    </>
  )
}

export default App
