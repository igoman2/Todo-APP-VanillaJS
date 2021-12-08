import "./style.css";
import displayModal from "./modal.js";

const inputEventSupervisor = document.querySelector("#input-supervisor");
const checkInputTitle = document.querySelector("#todo-input-title");
const checkInputLimitTime = document.querySelector("#todo-input-limit-time");

const registerTaskBtn = document.querySelector(".submit-btn");
const removeCheckedTaskBtn = document.querySelector("#remove-all-checked");
const removeAllBtn = document.querySelector("#remove-all");

const sortSupervisor = document.querySelector(".todo-option-supervisor");
const sortByRegisterTimeBtn = document.querySelector("#sort-register-time");
const sortByRestTimeBtn = document.querySelector("#sort-rest-time");

const todoList = document.querySelector("#todos");
const completedTodoList = document.querySelector("#completed-todos");

let globalInputTitle;
let globalInputLimitTime;
let timerPool = [];

window.onload = () => {
  checkInputTitle.focus();
};

inputEventSupervisor.addEventListener("keyup", (event) => {
  if (event.code === "Enter") {
    registerTaskBtn.onclick();
  }
});
checkInputTitle.addEventListener("keyup", function() {
  globalInputTitle = this.value;
});
checkInputLimitTime.addEventListener("keyup", function() {
  globalInputLimitTime = this.value;
});

sortSupervisor.addEventListener("click", () => {
  sortByRegisterTimeBtn.classList.toggle("checked");
  sortByRestTimeBtn.classList.toggle("checked");
});
sortByRegisterTimeBtn.addEventListener("click", async () => {
  let sorted = Array.from(todoList.querySelectorAll(".task")).sort((a, b) => {
    return (
      Number(
        a.querySelector("li .timerDisplay").id.replace("stopWatchDisplay-", "")
      ) -
      Number(
        b.querySelector("li .timerDisplay").id.replace("stopWatchDisplay-", "")
      )
    );
  });
  await resetChild();
  sorted.forEach((node) => {
    todoList.appendChild(node);
  });
});
sortByRestTimeBtn.addEventListener("click", async () => {
  let sorted = Array.from(todoList.querySelectorAll(".task")).sort((a, b) => {
    return (
      a.querySelector("li .timerDisplay").innerText -
      b.querySelector("li .timerDisplay").innerText
    );
  });
  await resetChild();
  sorted.forEach((node) => {
    todoList.appendChild(node);
  });
});

registerTaskBtn.onclick = function() {
  const isValid = checkValidation();
  if (isValid) {
    createTask(globalInputTitle, globalInputLimitTime);
  } else {
    alert("데이터를 입력해 주세요!");
  }
};
removeCheckedTaskBtn.addEventListener("click", function() {
  let body = document.getElementById("todos");
  let checkedTask = document.querySelectorAll("#todos .task #check");
  for (let i in checkedTask) {
    if (checkedTask[i].nodeType == 1 && checkedTask[i].checked == true) {
      makeList(
        checkedTask[i].parentNode.querySelector("span").innerText,
        checkedTask[i].parentNode.querySelector(".limitTime").innerText
      );
      body.removeChild(checkedTask[i].parentNode);
    }
  }
});
removeAllBtn.onclick = function() {
  let body = document.getElementById("todos");
  let currentTask = body.childNodes;
  currentTask.forEach((item) => {
    makeList(
      item.querySelector("span").innerText,
      item.querySelector(".limitTime").innerText
    );
  });
  timerPool.forEach((timer) => {
    clearTimeout(timer);
  });
  while (body.hasChildNodes()) {
    body.removeChild(body.firstChild);
  }
  timerPool = [];
};

function addCompleteList(node, interval) {
  clearTimeout(interval);
  let target = node.parentNode;
  target.parentNode.removeChild(target);
  makeList(
    target.querySelector("span").innerText,
    target.querySelector(".limitTime").innerText
  );
}
function makeList(inputTitle, inputLimitTime) {
  let li = document.createElement("li");
  let completeTitle = document.createElement("span");
  completeTitle.innerHTML = inputTitle;
  li.appendChild(completeTitle);
  li.classList.add("task");
  li.style.listStyle = "none";

  completedTodoList.appendChild(li);

  let completeLimitTime = document.createElement("span");
  completeLimitTime.innerHTML = inputLimitTime;
  li.appendChild(completeLimitTime);

  const restoreBtn = document.createElement("button");
  restoreBtn.innerText = "복원하기";
  restoreBtn.addEventListener("click", (event) => {
    createTask(inputTitle, inputLimitTime);
    event.target.parentNode.parentNode.removeChild(event.target.parentNode);
  });
  li.appendChild(restoreBtn);
}
function resetChild() {
  let cell = document.getElementById("todos");
  while (cell.hasChildNodes()) {
    cell.removeChild(cell.firstChild);
  }
}
function createTask(inputTitle, inputLimitTime) {
  let time = inputLimitTime;
  let hasDone = inputLimitTime > 0 ? false : true;
  let interval;
  render();
  resetInput();

  function resetInput() {
    checkInputTitle.value = "";
    checkInputLimitTime.value = "";
    inputTitle = undefined;
    inputLimitTime = undefined;
    checkInputTitle.focus();
  }
  function render() {
    let li = document.createElement("li");
    li.setAttribute("id", `task-${Date.now()}`);

    let titleSpan = document.createElement("span");
    titleSpan.innerHTML = inputTitle;
    li.appendChild(titleSpan);
    li.classList.add("task");
    li.style.listStyle = "none";
    todoList.appendChild(li);

    let timerSpan = document.createElement("span");
    timerSpan.setAttribute("id", `stopWatchDisplay-${Date.now()}`);
    timerSpan.classList.add("timerDisplay");
    timerSpan.innerHTML = inputLimitTime;
    li.appendChild(timerSpan);

    let limitTimeSpan = document.createElement("span");
    limitTimeSpan.classList.add("limitTime");
    limitTimeSpan.innerText = inputLimitTime;
    limitTimeSpan.style.display = "none";
    li.appendChild(limitTimeSpan);

    let checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", "check");
    li.appendChild(checkbox);

    let modifyBtn = document.createElement("button");
    modifyBtn.innerText = "수정하기";
    modifyBtn.addEventListener("click", () => {
      let modifiedTitle = prompt();
      modifyBtn.parentNode.querySelector("span").innerText = modifiedTitle;
    });
    li.appendChild(modifyBtn);

    let completeBtn = document.createElement("button");
    completeBtn.setAttribute("id", "complete-btn");
    completeBtn.innerText = "종료";
    completeBtn.addEventListener("click", (event) => {
      let body = event.target.parentNode.parentNode;
      let target = event.target.parentNode;
      makeList(
        target.querySelector("span").innerText,
        target.querySelector(".limitTime").innerText
      );
      body.removeChild(target);
    });
    li.appendChild(completeBtn);

    increment(timerSpan);
  }
  function increment(timerSpan) {
    if (!hasDone) {
      interval = setTimeout(() => {
        time--;
        if (time <= 5) {
          timerSpan.parentNode.classList.add("warn");
        }
        if (time == 0) {
          displayModal(timerSpan.parentNode.querySelector("span").innerText);
          addCompleteList(timerSpan, interval);
          hasDone = true;
        }
        timerSpan.innerHTML = time;
        increment(timerSpan);
      }, 1000);
      timerPool.push(interval);
    }
  }
}
function checkValidation() {
  return Boolean(globalInputTitle && globalInputLimitTime);
}
