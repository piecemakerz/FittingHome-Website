const modelGenerationForm = document.getElementById("modelGeneration-form");
const imagesInput = document.getElementById("modelGeneration__file");
const userId = document.getElementById("modelGeneration__userId");
const submitBtn = document.getElementById("modelGeneration__submit");

const handleGenerationStart = async () => {
  const file = imagesInput.files[0];
  console.log(file);
  const userid = userId.value;
  const formdata = new FormData();
  formdata.append("file", file, file.name);
  formdata.append("userid", userid);

  const response = await fetch(`${window.location.origin}/api/generate`, {
    method: "POST",
    body: formdata,
  });

  if (response.status === 200) {
    alert("Model Generation Started");
    window.location.href = `${window.location.origin}/me`;
  } else {
    alert("Model Generation Failed");
  }
};

function init() {
  submitBtn.addEventListener("click", handleGenerationStart);
}

if (modelGenerationForm) {
  init();
}
