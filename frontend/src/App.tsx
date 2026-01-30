import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import "./App.scss";

function getRestUrl(path: string) {
  return "http://localhost:8001/" + path
}

type TThumbnail = {
  id: number,
  title: string,
  filename: string
};

function App() {
  const [urlInput, setUrlInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const [showLastSuccess, setShowLastSuccess] = useState(false);
  /**
   * Show successMessage if lastSuccess == true, otherwise errorMessage
   */
  const [lastSuccess, setLastSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [thumbnails, setThumbnails] = useState<Array<TThumbnail>>([]);

  useEffect(() => {
    (async function() {
      try {
        const response = await axios.get(getRestUrl("api/thumbnails"));
        // const files = response.data.files;
        // setThumbnails(files);

        // console.log(response.data);
        setThumbnails(response.data.thumbnails)
      } catch (error) {
        if (isAxiosError(error)) {
          setShowLastSuccess(true);
          setLastSuccess(false);
          setErrorMessage(error.message)
        }
      }
    })();
  }, []);

  return (
    <div className="wrapper">
      <h1>YouTube Thumbnail Downloader</h1>

      <div className="subtitle">By Hevanafa (Jan 2026)</div>

      <div className="input-area">
        <input
          type="text"
          disabled={isDownloading}
          value={urlInput}

          onChange={e => { setUrlInput(e.target.value) }}
          onKeyDown={async e => {
            if (e.key == "Enter") {
              if (isDownloading) return;

              setShowLastSuccess(false);
              setIsDownloading(true);

              const postBody = {
                url: urlInput
              };

              try {
                const response = await axios.post(getRestUrl("api/download"), postBody);
                console.log(response.data);

                setThumbnails([...thumbnails, response.data.outFilename])

                setShowLastSuccess(true);
                setLastSuccess(response.data.success);
                setSuccessMessage(response.data.message);

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

      <div className="status-message">
        { isDownloading ? "Downloading..." : null }

        {
          showLastSuccess
          ? (lastSuccess ? <div>{ successMessage }</div> : <div>Unsuccessful: { errorMessage }</div>)
          : null
        }
      </div>

      <div className="thumbnail-gallery">
        { thumbnails.map((item: TThumbnail) => {
          const trimmed = item.filename.replace(/\.(jpg|png)$/, "");
          const youtubeUrl = "https://www.youtube.com/watch?v=" + trimmed;

          return <div key={"gi" + trimmed} className="gallery-item">
            <img src={getRestUrl("thumbs/" + item.filename)} />

            <a className="metadata" target="_blank" href={youtubeUrl}>
              <div>
              { item.title }
              </div>
            </a>
          </div>
        })}
      </div>
    </div>
  )
}

export default App
