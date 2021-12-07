import "./style.css";
import displayModal from "./modal.js";

const checkInputTitle = document.querySelector("#todo-input-title");
const checkInputLimitTime = document.querySelector("#todo-input-limit-time");
const inputSumbitBtn = document.querySelector(".submit-btn");
const removeCheckedBtn = document.querySelector("#remove-all-checked");
const removeAll = document.querySelector("#remove-all");
const inputEventSupervisor = document.querySelector("#input-supervisor");
const todoList = document.querySelector("#todos");
const sortByRegistTime = document.querySelector("#sort-register-time");
const sortByRestTime = document.querySelector("#sort-rest-time");
const sortSupervisor = document.querySelector(".todo-option-supervisor");
const completedTodos = document.querySelector("#completed-todos");
let globalInputTitle;
let globalInputLimitTime;
let todoListData = [];
let timerPool = [];
let taskStore = new Map();

window.onload = () => {
  checkInputTitle.focus();
};

inputEventSupervisor.addEventListener("keyup", (event) => {
  if (event.code === "Enter") {
    inputSumbitBtn.onclick();
  }
});
checkInputTitle.addEventListener("keyup", function() {
  globalInputTitle = this.value;
});
checkInputLimitTime.addEventListener("keyup", function() {
  globalInputLimitTime = this.value;
});
sortSupervisor.addEventListener("click", function(event) {
  sortByRegistTime.classList.toggle("checked");
  sortByRestTime.classList.toggle("checked");
});
sortByRegistTime.addEventListener("click", async () => {
  let sorted = Array.from(document.querySelectorAll(".task")).sort((a, b) => {
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
sortByRestTime.addEventListener("click", async () => {
  let sorted = Array.from(document.querySelectorAll(".task")).sort((a, b) => {
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

inputSumbitBtn.onclick = function() {
  const inputTitle = globalInputTitle;
  const inputLimitTime = globalInputLimitTime;
  createTask(inputTitle, inputLimitTime);
};
removeCheckedBtn.addEventListener("click", function() {
  let body = document.getElementById("todos");
  let chkbox = document.querySelectorAll("#todos .task #check");
  let removedList = [];
  for (let i in chkbox) {
    if (chkbox[i].nodeType == 1 && chkbox[i].checked == true) {
      body.removeChild(chkbox[i].parentNode);
      makeList(todoListData[i].title, todoListData[i].limitTime);
      removedList.push(i);
    }
  }
  for (let i = removedList.length - 1; i >= 0; i--) {
    todoListData.splice(removedList[i], 1);
  }
});

removeAll.onclick = function() {
  let body = document.getElementById("todos");
  todoListData.forEach((item) => {
    makeList(item.title, item.limitTime);
  });
  timerPool.forEach((timer) => {
    clearTimeout(timer);
  });
  while (body.hasChildNodes()) {
    body.removeChild(body.firstChild);
  }
  todoListData = [];
  timerPool = [];
};

function addCompleteList(node, inputTitle, inputLimitTime, interval) {
  clearTimeout(interval);
  let target = node.parentNode;
  target.parentNode.removeChild(target);
  makeList(inputTitle, inputLimitTime);
}
function makeList(inputTitle, inputLimitTime) {
  let li = document.createElement("li");
  let completeTitle = document.createElement("span");
  completeTitle.innerHTML = inputTitle;
  li.appendChild(completeTitle);
  li.classList.add("task");
  li.style.listStyle = "none";

  completedTodos.appendChild(li);

  let completeLimitTime = document.createElement("span");
  completeLimitTime.innerHTML = inputLimitTime;
  li.appendChild(completeLimitTime);

  const restoreBtn = document.createElement("button");
  restoreBtn.innerText = "복원하기";
  restoreBtn.addEventListener("click", () => {});
  li.appendChild(restoreBtn);
}
function resetChild() {
  let cell = document.getElementById("todos");
  while (cell.hasChildNodes()) {
    cell.removeChild(cell.firstChild);
  }
}
function createTask(inputTitle, inputLimitTime) {
  let registerTime = Date.now();
  let time = inputLimitTime;
  let hasDone = inputLimitTime > 0 ? false : true;
  let interval;

  const validation = Boolean(inputTitle && inputLimitTime);
  if (!validation) {
    alert("데이터를 입력해 주세요!");
  } else {
    store();
    render();
    reset();
  }

  function store() {
    let task = {
      title: inputTitle,
      limitTime: inputLimitTime,
      registerTime: registerTime,
    };
    todoListData.push(task);
  }
  function reset() {
    checkInputTitle.value = "";
    checkInputLimitTime.value = "";
    globalInputTitle = undefined;
    globalInputLimitTime = undefined;
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
      let children = event.target.parentNode.parentNode.childNodes;
      let index = -1;
      for (let i = 0; i < children.length; i++) {
        if (children[i].id === event.target.parentNode.id) {
          index = i;
          break;
        }
      }
      todoListData.splice(index, 1);
      addCompleteList(event.target, inputTitle, inputLimitTime, interval);
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
          displayModal(inputTitle);
          addCompleteList(timerSpan, inputTitle, inputLimitTime);
          hasDone = true;
        }
        timerSpan.innerHTML = time;
        increment(timerSpan);
      }, 1000);
      taskStore.set(registerTime, {
        restTime: time,
        title: inputTitle,
        limitTime: inputLimitTime,
      });
      timerPool.push(interval);
    }
  }
}
