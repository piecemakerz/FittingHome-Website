const modelTable = document.getElementById("models");
const rows = modelTable ? modelTable.getElementsByClassName("row") : null;

const handleDeleteBtnClick = async (event) => {
  const row = event.target.parentNode.parentNode;
  const modelId = row.getElementsByClassName("modelId")[0].textContent;
  const response = await fetch(
    `${window.location.origin}/api/${modelId}/delete`,
    {
      method: "GET",
    }
  );
  if (response.status === 200) {
    alert("모델 삭제에 성공했습니다.");
    window.location.reload();
  } else {
    alert("모델을 삭제하지 못했습니다.");
  }
};

function init() {
  for (let row of rows) {
    const deleteButton = row.querySelector("button");
    deleteButton.addEventListener("click", handleDeleteBtnClick);
  }
}

if (modelTable) {
  init();
}
