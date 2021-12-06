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
  await resetChild();
  let tmp = new Map(
    [...taskStore.entries()].sort((a, b) => {
      return a[0] - b[0];
    })
  );
  taskStore.clear();
  tmp.forEach((item) => {
    console.log(item);
    createTask(item.title, item.restTime);
  });
});
sortByRestTime.addEventListener("click", async () => {
  await resetChild();
  let tmp = new Map(
    [...taskStore.entries()].sort((a, b) => {
      return a[1].restTime - b[1].restTime;
    })
  );
  taskStore.clear();
  tmp.forEach((item) => {
    console.log(item);
    createTask(item.title, item.restTime);
  });

  // 남은 시간 순
});

let taskStore = new Map();
inputSumbitBtn.onclick = function() {
  const inputTitle = globalInputTitle;
  const inputLimitTime = globalInputLimitTime;
  createTask(inputTitle, inputLimitTime);
};
removeCheckedBtn.addEventListener("click", function() {
  let body = document.getElementById("todos");
  let chkbox = document.querySelectorAll("#todos .task #check");
  for (let i in chkbox) {
    if (chkbox[i].nodeType == 1 && chkbox[i].checked == true) {
      body.removeChild(chkbox[i].parentNode);
    }
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
      registerTime: new Date(),
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
      console.log("add");
      taskStore.set(registerTime, {
        restTime: time,
        title: inputTitle,
        limitTime: inputLimitTime,
      });
      timerPool.push(interval);
    }
  }
}
