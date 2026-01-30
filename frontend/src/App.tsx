import { useState } from "react";
import axios, { isAxiosError } from "axios";
import "./App.scss";

function App() {
  const [urlInput, setUrlInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const [showLastSuccess, setShowLastSuccess] = useState(false);
  const [lastSuccess, setLastSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

              try {
                const response = await axios.post("http://localhost:8001/api/download", postBody);
                console.log(response.data);

                setShowLastSuccess(true);
                setLastSuccess(response.data.success);

                setIsDownloading(false);
              } catch (error) {
                if (isAxiosError(error) && error.response != null)
                  setErrorMessage(error.response.data.message);

                setShowLastSuccess(true);
                setLastSuccess(false);

                setIsDownloading(false);
                return
              }
            }
            }} />
      </div>

      <div>
        { isDownloading
          ? "Downloading..."
          : null }
      </div>

      {
        showLastSuccess
        ? (lastSuccess ? <div>Success!</div> : <div>Unsuccessful: { errorMessage }</div>)
        : null
      }
    </>
  )
}

export default App
