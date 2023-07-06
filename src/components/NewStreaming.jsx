import React, { useEffect } from "react";
import {
  listDevices,
  initLiveStream,
  attachCamera,
  detachCamera,
  getStream,
} from "@cloudinary/js-streaming";

const REACT_APP_CLOUNDINARY_CLOUND_NAME =
  process.env.REACT_APP_CLOUNDINARY_CLOUND_NAME;
const REACT_APP_CLOUNDINARY_UPLOAD_PRESET =
  process.env.REACT_APP_CLOUNDINARY_UPLOAD_PRESET;

const CloudinaryLiveStreamingExample = () => {
  const CLOUD_NAME = REACT_APP_CLOUNDINARY_CLOUND_NAME;
  const UPLOAD_PRESET = REACT_APP_CLOUNDINARY_UPLOAD_PRESET;

  let liveStream, publicId, url;

  useEffect(() => {
    fillCameraDropdown();
  }, []);

  function setText(id, text) {
    document.getElementById(id).innerHTML = text;
  }

  function setStatus(status) {
    setText("status", status);
  }

  function toggleButton(id, enabled) {
    document.getElementById(id).disabled = !enabled;
  }

  function toggleBtns(init = false, start = false, stop = false) {
    toggleButton("initbtn", init);
    toggleButton("startbtn", start);
    toggleButton("stopbtn", stop);
  }

  function setUrl(url) {
    const fileUrl = url + ".mp4";
    const streamUrl = url + ".m3u8";

    const file_link = document.getElementById("file_url");
    const stream_link = document.getElementById("stream_url");

    file_link.href = fileUrl;
    file_link.innerText = fileUrl;
    stream_link.href = streamUrl;
    stream_link.innerText = streamUrl;
  }

  function view() {
    const videoElement = document.getElementById("video");
    const device = { deviceId: getSelectedCamera() };

    attachCamera(videoElement, device).then((c) => {
      console.log(c);
    });
  }

  function hide() {
    detachCamera(document.getElementById("video")).then((c) => {
      console.log(c);
    });
  }

  const start = () => {
    setStatus("starting...");
    toggleBtns();
    liveStream.start(publicId);
  };

  function stop() {
    setStatus("stopping...");
    toggleBtns();
    liveStream.stop();
  }

  async function initialize() {
    setStatus("initializing...");
    toggleBtns();
    const cameraStream = await getSelectedCameraStream();

    initLiveStream({
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      stream: cameraStream,
      debug: "all",
      hlsTarget: true,
      fileTarget: true,
      events: {
        start: function (args) {
          setStatus("started");
          document.getElementById("video").className = "video recording";
          toggleBtns(false, false, true);
        },
        stop: function (args) {
          setStatus("stopped");
          document.getElementById("video").className = "video";
          toggleBtns(true, false, false);
        },
        error: function (error) {
          setStatus("error: " + error);
          toggleBtns(true, false, false);
        },
        local_stream: function (stream) {
          setStatus("local stream");
          liveStream.attach(document.getElementById("video"), stream);
        },
      },
    })
      .then((result) => {
        liveStream = result;
        publicId = result.response.public_id.toString();
        url = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${publicId}`;

        setStatus("initialized");
        setText("publicid", publicId);
        setUrl(url);

        toggleBtns(false, true, false);
      })
      .catch((e) => {
        setStatus("" + e);
      });
  }

  function getSelectedCamera() {
    return document.getElementById("devices").value;
  }

  function getSelectedCameraStream() {
    const deviceId = getSelectedCamera();
    if (deviceId) {
      return getStream({ audio: true, video: { deviceId } });
    }

    return getStream();
  }

  function getUserMediaPermission() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  }

  function addCameraOption(device) {
    if (device.kind.includes("video")) {
      const devicesDropDown = document.getElementById("devices");
      const opt = document.createElement("option");
      opt.value = device.deviceId;
      opt.innerHTML = device.label || "unknown";
      devicesDropDown.appendChild(opt);
    }
  }

  function fillCameraDropdown() {
    getUserMediaPermission()
      .then(() => {
        listDevices().then((devices) => devices.forEach(addCameraOption));
      })
      .catch(() => {
        console.error("Could not get user media devices.");
      });
  }

  return (
    <div className="center-text">
      <h1>Cloudinary Live Streaming Example</h1>
      <p>This demo requires HTTPS on some environments</p>
      <div className="video-wrapper">
        <video className="video" id="video" autoPlay muted playsInline />
      </div>
      <div className="center">
        <div className="center-text">
          <label htmlFor="devices">Select Camera:</label>
        </div>
        <div className="center-text">
          <select id="devices"></select>
        </div>
        <div className="center-text">
          <button id="viewbtn" onClick={view}>
            Show camera
          </button>
          <button id="hidebtn" onClick={hide}>
            Hide camera
          </button>
        </div>
        <div className="center-text">
          <button id="initbtn" onClick={initialize}>
            Initialize stream
          </button>
          <button id="startbtn" onClick={start}>
            Start stream
          </button>
          <button id="stopbtn" onClick={stop}>
            Stop stream
          </button>
        </div>

        <div className="ui">
          <p>
            Status:{" "}
            <span id="status">Click on 'initialize Stream' to begin</span>
          </p>
          <p>
            Public Id: <span id="publicid"></span>
          </p>
          <p>
            File url: <a id="file_url" target="_blank"></a>
          </p>
          <p>
            Stream url: <a id="stream_url" target="_blank"></a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryLiveStreamingExample;
