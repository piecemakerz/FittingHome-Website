const iframe = document.getElementById("api-frame");
const modelButtonContainer = document.getElementById(
  "jsModelDownloadButtonContainer"
);
const origBtn = document.getElementById("jsOriginalDownloadBtn");
const gltfBtn = document.getElementById("jsGltfDownloadBtn");
const usdzBtn = document.getElementById("jsUsdzDownloadBtn");

const handleOrigBtnClick = async (event) => {
  const response = await fetch(
    `${window.location.origin}/api/${modelId}/download`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "original", modelId }),
    }
  );
  const { modelLocation } = await response.json();
  const tempHref = document.createElement("a");
  tempHref.href = modelLocation;
  tempHref.click();
};

const handleGLTFBtnClick = async (event) => {
  const response = await fetch(
    `${window.location.origin}/api/${modelId}/download`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "gltf", modelId }),
    }
  );
  const responseJSON = await response.json();
  if (responseJSON.error) {
    alert(responseJSON.error);
  } else {
    const tempHref = document.createElement("a");
    tempHref.href = responseJSON.modelLocation;
    tempHref.click();
  }
};

const handleUSDZBtnClick = async (event) => {
  const response = await fetch(
    `${window.location.origin}/api/${modelId}/download`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "usdz", modelId }),
    }
  );
  const responseJSON = await response.json();
  if (responseJSON.error) {
    alert(responseJSON.error);
  } else {
    const tempHref = document.createElement("a");
    tempHref.href = responseJSON.modelLocation;
    tempHref.click();
  }
};

function init() {
  const client = new Sketchfab(iframe);

  client.init(modelId, {
    success: function onSuccess(api) {
      api.start();
      api.addEventListener("viewerready", () => {
        console.log("Viewer is ready");
      });
    },
    error: function onError() {
      if (processing === "SUCCEEDED") {
        alert("Viewer not ready yet");
      }
    },
  });

  origBtn.addEventListener("click", handleOrigBtnClick);
  gltfBtn.addEventListener("click", handleGLTFBtnClick);
  usdzBtn.addEventListener("click", handleUSDZBtnClick);
}

if (modelButtonContainer) {
  init();
}
