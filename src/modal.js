const modal = document.querySelector(".modal");
const closeButton = modal.querySelector("button");
const modalBackground = modal.querySelector(".modal-background");
const completeTaskTitme = modal.querySelector(".complete-task-title");

closeButton.addEventListener("click", () => {
  modal.classList.toggle("hidden");
});
modalBackground.addEventListener("click", () => {
  modal.classList.toggle("hidden");
});
export default function displayModal(title) {
  if (modal.classList.contains("hidden")) {
    modal.classList.toggle("hidden");
  }
  completeTaskTitme.innerHTML = `[${title}] 아이템이 종료 되었습니다`;
}
