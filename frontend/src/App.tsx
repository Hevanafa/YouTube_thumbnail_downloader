import { useEffect, useState } from "react";
import axios, { isAxiosError } from "axios";
import "./App.scss";

function getRestUrl(path: string) {
  return "http://localhost:8001/" + path
}

type TThumbnail = {
  thumbnailId: number,
  title: string,
  filename: string
};

// Verbose enum syntax but doesn't have TypeScript warnings
const TViews = {
  Compact: 1,
  CompactV2: 2,
  List: 3
};

type TViews = typeof TViews[keyof typeof TViews];

function joinClassList(...cssClasses: Array<string>) {
  return cssClasses.filter(s => !!s).join(" ")
}

function App() {
  const [urlInput, setUrlInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [actualViewMode, setViewMode] = useState(TViews.List);

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

      <div className="toolbox">
        <div>
          <button onClick={async () => {
            const response = await axios.post(getRestUrl("api/open-thumbs"), {});

            if (response.data.success) return;
          }}>Open downloads folder</button>
        </div>

        <div className="theme-selector">
          <button
            className={actualViewMode == TViews.Compact ? "active" : ""}
            onClick={() => setViewMode(TViews.Compact)}>
            Compact
          </button>

          <button
            className={actualViewMode == TViews.CompactV2 ? "active" : ""}
            onClick={() => setViewMode(TViews.CompactV2)}>
            Compact v2
          </button>

          <button
            className={actualViewMode == TViews.List ? "active" : ""}
            onClick={() => setViewMode(TViews.List)}>
            List
          </button>
        </div>
      </div>

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

                const { thumbnailId, title, filename, duplicate } = response.data;

                if (!duplicate)
                  setThumbnails([...thumbnails, {
                    thumbnailId,
                    title,
                    filename
                  }]);

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

        { urlInput.length > 0
          ? <button className="clear-url" onClick={() => setUrlInput("")}>X</button>
          : null
        }
      </div>

      <div className="status-message">
        { isDownloading ? "Downloading..." : null }

        {
          showLastSuccess
          ? (lastSuccess ? <div className="success">{ successMessage }</div> : <div className="failure">Unsuccessful: { errorMessage }</div>)
          : null
        }
      </div>

      <div className={joinClassList(
        "thumbnail-gallery",
        actualViewMode == TViews.CompactV2 ? "compact-v2" : "",
        actualViewMode == TViews.List ? "list" : ""
      )}>
        {
          actualViewMode == TViews.CompactV2
          ? thumbnails.map((item: TThumbnail) => {
            const trimmed = item.filename.replace(/\.(jpg|png)$/, "");
            const youtubeUrl = "https://www.youtube.com/watch?v=" + trimmed;

            return <div key={"gi" + trimmed} className="gallery-item">
              <a className="hover-trigger" target="_blank" href={youtubeUrl}>
                <img src={getRestUrl("thumbs/" + item.filename)} />

                <div className="metadata">
                  <div>
                  { item.title }
                  </div>
                </div>
              </a>
            </div>;
          }) : null
        }

        {
          actualViewMode == TViews.Compact
          ? thumbnails.map((item: TThumbnail) => {
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
          }) : null
        }

        {
          actualViewMode == TViews.List
          ? thumbnails.map((item: TThumbnail) => {
            const trimmed = item.filename.replace(/\.(jpg|png)$/, "");
            const youtubeUrl = "https://www.youtube.com/watch?v=" + trimmed;

            return <div key={"gi" + trimmed} className="gallery-item">
              <a className="thumbnail" target="_blank" href={youtubeUrl}>
                <img src={getRestUrl("thumbs/" + item.filename)} />
              </a>

              <a className="metadata" target="_blank" href={youtubeUrl}>
                { item.title }
              </a>
            </div>;
          }) : null
        }
      </div>
    </div>
  )
}

export default App
