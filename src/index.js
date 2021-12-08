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
let taskStore = new Map();

window.onload = () => {
  checkInputTitle.focus();
};

inputEventSupervisor.addEventListener("keyup", (event) => {
  if (event.code === "Enter") {
    registerTaskBtn.onclick();
  }
});
registerTaskBtn.onclick = function() {
  const isValid = checkValidation();
  if (isValid) {
    createTask(globalInputTitle, globalInputLimitTime);
  } else {
    alert("데이터를 입력해 주세요!");
  }
};
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
      Number(a.id.replace("task-", "")) - Number(b.id.replace("task-", ""))
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

removeCheckedTaskBtn.addEventListener("click", function() {
  let body = document.getElementById("todos");
  let checkedTask = document.querySelectorAll("#todos .task #check");
  for (let i in checkedTask) {
    if (checkedTask[i].nodeType == 1 && checkedTask[i].checked == true) {
      let targetId = +checkedTask[i].parentNode.id.replace("task-", "");
      clearTimeout(taskStore.get(targetId).interval);
      renderCompleteTask(
        checkedTask[i].parentNode.querySelector("span").innerText,
        checkedTask[i].parentNode.querySelector(".limitTime").innerText
      );
      body.removeChild(checkedTask[i].parentNode);
    }
  }
  hasCheckedTask();
});
removeAllBtn.onclick = function() {
  let body = document.getElementById("todos");
  let currentTask = body.childNodes;
  currentTask.forEach((item) => {
    renderCompleteTask(
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
  hasCheckedTask();
};

function addCompleteList(node, interval) {
  clearTimeout(interval);
  let target = node.parentNode;
  target.parentNode.removeChild(target);
  renderCompleteTask(
    target.querySelector("span").innerText,
    target.querySelector(".limitTime").innerText
  );
  hasCheckedTask();
}
function renderCompleteTask(inputTitle, inputLimitTime) {
  let li = document.createElement("li");
  let completeTitle = document.createElement("span");
  completeTitle.classList.add("titleComplete");
  completeTitle.innerHTML = inputTitle;
  li.appendChild(completeTitle);
  li.classList.add("task");
  li.style.listStyle = "none";

  completedTodoList.appendChild(li);

  let completeLimitTime = document.createElement("span");
  completeLimitTime.classList.add("restoreLimitTime");
  completeLimitTime.innerHTML = inputLimitTime;
  li.appendChild(completeLimitTime);

  const restoreBtn = document.createElement("button");
  restoreBtn.innerText = "복원하기";
  restoreBtn.addEventListener("click", (event) => {
    const restoreTitle = event.target.parentNode.querySelector(".titleComplete")
      .innerText;
    const restoreLimitTime = event.target.parentNode.querySelector(
      ".restoreLimitTime"
    ).innerText;
    createTask(restoreTitle, restoreLimitTime);
    event.target.parentNode.parentNode.removeChild(event.target.parentNode);
  });
  li.appendChild(restoreBtn);

  const modifyLimitTimeBtn = document.createElement("button");
  modifyLimitTimeBtn.innerText = "시간 수정하기";
  modifyLimitTimeBtn.addEventListener("click", (event) => {
    let modifiedLimitTime = prompt();
    event.target.parentNode.querySelector(
      ".restoreLimitTime"
    ).innerText = modifiedLimitTime;
  });
  li.appendChild(modifyLimitTimeBtn);
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
  let registerTime = Date.now();
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
    li.setAttribute("id", `task-${registerTime}`);

    let titleSpan = document.createElement("span");
    titleSpan.innerHTML = inputTitle;
    li.appendChild(titleSpan);
    li.classList.add("task");
    li.style.listStyle = "none";
    todoList.appendChild(li);

    let timerSpan = document.createElement("span");
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
    checkbox.addEventListener("click", () => {
      hasCheckedTask();
    });
    li.appendChild(checkbox);

    let titleModifyBtn = document.createElement("button");
    titleModifyBtn.innerText = "수정하기";
    titleModifyBtn.addEventListener("click", () => {
      let modifiedTitle = prompt();
      titleModifyBtn.parentNode.querySelector("span").innerText = modifiedTitle;
    });
    li.appendChild(titleModifyBtn);

    let completeBtn = document.createElement("button");
    completeBtn.setAttribute("id", "complete-btn");
    completeBtn.innerText = "종료";
    completeBtn.addEventListener("click", (event) => {
      let body = event.target.parentNode.parentNode;
      let target = event.target.parentNode;
      let targetId = +target.id.replace("task-", "");
      clearTimeout(taskStore.get(targetId).interval);
      renderCompleteTask(
        target.querySelector("span").innerText,
        target.querySelector(".limitTime").innerText
      );
      body.removeChild(target);
      hasCheckedTask();
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
      taskStore.set(registerTime, {
        interval: interval,
      });
      timerPool.push(interval);
    }
  }
}
function hasCheckedTask() {
  let checkedTask = document.querySelectorAll("#todos .task #check");
  let checkedNodeCount = 0;
  for (let i in checkedTask) {
    if (checkedTask[i].nodeType == 1 && checkedTask[i].checked == true) {
      checkedNodeCount++;
    }
  }
  if (checkedNodeCount > 0) {
    removeCheckedTaskBtn.removeAttribute("disabled");
  } else {
    removeCheckedTaskBtn.setAttribute("disabled", "");
  }
}
function checkValidation() {
  return Boolean(globalInputTitle && globalInputLimitTime);
}
