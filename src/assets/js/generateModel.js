const modelGenerationForm = document.getElementById("modelGeneration-form");
const imagesInput = document.getElementById("modelGeneration__file");
const userId = document.getElementById("modelGeneration__userId");
const submitBtn = document.getElementById("modelGeneration__submit");

const handleGenerationStart = async (event) => {
  const file = imagesInput.files[0];
  const userid = userId.value;
  const formdata = new FormData();
  formdata.append("file", file, file.name);
  formdata.append("userid", userid);
  try {
    const response = await fetch("https://fitting-home.fun25.co.kr/upload", {
      method: "POST",
      body: formdata,
    });
    const responseText = await response.text();
    if (response.status === 200) {
      alert(responseText);
      window.location.href = `${window.location.origin}/me`;
    } else {
      alert(responseText);
    }
  } catch (error) {
    console.log(error);
  }
};

function init() {
  submitBtn.addEventListener("click", handleGenerationStart);
}

if (modelGenerationForm) {
  init();
}
