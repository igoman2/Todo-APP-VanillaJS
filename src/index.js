import "./style.css";

const modal = document.querySelector(".modal");
const closeButton = modal.querySelector("button");
const modalBackground = modal.querySelector(".modal-background");

const checkInputTitle = document.querySelector("#todo-input-title");
const checkInputLimitTime = document.querySelector("#todo-input-limit-time");
const inputSumbitBtn = document.querySelector("#submit-button");
const removeCheckedBtn = document.querySelector("#remove-all-checked");
const removeAll = document.querySelector("#remove-all");
const inputEventSupervisor = document.querySelector("#input-supervisor");
const ul = document.querySelector("ul");
const sortByRegistTime = document.querySelector("#sort-register-time");
const sortByRestTime = document.querySelector("#sort-rest-time");
const sortParent = document.querySelector(".todo-option-filter");
const completedTodos = document.querySelector("#completed-todos");
let globalInputTitle;
let globalInputLimitTime;
let todoListData = [];

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

sortParent.addEventListener("click", function(event) {
  console.log(event.target);
  sortByRegistTime.classList.toggle("checked");
  sortByRestTime.classList.toggle("checked");
});
sortByRegistTime.addEventListener("click", function() {
  resetChild();
  todoListData.sort((a, b) => {
    return a.registerTime - b.registerTime;
  });
  todoListData.forEach((item) => {
    var li = document.createElement("li");
    let titleSpan = document.createElement("span");
    titleSpan.innerHTML = item.title;
    li.appendChild(titleSpan);
    li.classList.add("task");
    li.style.listStyle = "none";
    ul.appendChild(li);

    var timerSpan = document.createElement("span");
    timerSpan.setAttribute("id", "stopWatchDisplay");
    timerSpan.classList.add("timerDisplay");
    timerSpan.innerHTML = item.limitTime;
    li.appendChild(timerSpan);
  });
});
sortByRestTime.addEventListener("click", function() {
  // 남은 시간 순
});

inputSumbitBtn.onclick = function() {
  const inputTitle = globalInputTitle;
  const inputLimitTime = globalInputLimitTime;
  let time = inputLimitTime;
  let hasDone = inputLimitTime > 0 ? false : true;

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
    let todo = document.querySelectorAll(".todo");
    todoClickEvent(todo, todoListData);
    checkInputTitle.focus();
  }
  function render() {
    var li = document.createElement("li");
    let titleSpan = document.createElement("span");
    titleSpan.innerHTML = inputTitle;
    li.appendChild(titleSpan);
    li.classList.add("task");
    li.style.listStyle = "none";
    ul.appendChild(li);

    var timerSpan = document.createElement("span");
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
      makeComplete(event);
    });

    li.appendChild(completeBtn);
    increment(timerSpan);
  }

  function increment(timerSpan) {
    let interval;
    if (!hasDone) {
      interval = setTimeout(() => {
        time--;
        if (time == 0) {
          displayModal();
          let target = timerSpan.parentNode;
          target.parentNode.removeChild(target);

          var li = document.createElement("li");
          let completeTitle = document.createElement("span");
          completeTitle.innerHTML = inputTitle;
          li.appendChild(completeTitle);
          li.classList.add("task");
          li.style.listStyle = "none";
          completedTodos.appendChild(li);

          var completeLimitTime = document.createElement("span");
          completeLimitTime.innerHTML = inputLimitTime;
          li.appendChild(completeLimitTime);

          hasDone = true;
        }
        timerSpan.innerHTML = time;
        increment(timerSpan);
      }, 1000);
    }
  }
};
removeCheckedBtn.addEventListener("click", function() {
  var body = document.getElementById("todos");
  var chkbox = document.querySelectorAll("#todos .task #check");
  for (var i in chkbox) {
    if (chkbox[i].nodeType == 1 && chkbox[i].checked == true) {
      body.removeChild(chkbox[i].parentNode);
    }
  }
});

removeAll.onclick = function() {
  let allTodos = document.querySelectorAll(".todo");
  for (let i = 0; i < todoListData.length; i++) {
    allTodos[i].remove();
  }
  todoListData = [];
};

//check박스를 클릭 할때 마다 스타일 변화 및 삭제기능 추가
function todoClickEvent(target, data) {
  //this 지정

  for (let i = 0; i < target.length; i++) {
    // console.log(target[i].childNodes)
    //스타일 변화
    target[i].childNodes[1].addEventListener("click", function() {
      if (this.parentNode.classList.value.indexOf("checked") >= 0) {
        this.parentNode.classList.remove("checked");
        this.parentNode.style.color = "#000";
      } else {
        this.parentNode.classList.add("checked");
        this.parentNode.style.color = "red";
      }
    });
    //삭제
    target[i].childNodes[5].addEventListener("click", function() {
      if (this.parentNode.classList.value.indexOf("checked") >= 0) {
        this.parentNode.remove();
        data.splice(i, 1);
        target = document.querySelectorAll(".todo");
      }
    });
    // 수정
    target[i].childNodes[7].addEventListener("click", function() {
      var prompt = window.prompt("수정할 내용을 입력해주세요");
      if (prompt.length > 0) {
        this.parentNode.childNodes[3].innerHTML = prompt;
        data[i] = prompt;
      }
    });
  }
}
function makeComplete(event) {
  const parent = event.target.parentNode.parentNode;
  parent.removeChild(event.target.parentNode);
}

function resetChild() {
  var cell = document.getElementById("todos");
  while (cell.hasChildNodes()) {
    cell.removeChild(cell.firstChild);
  }
}

closeButton.addEventListener("click", displayModal);
modalBackground.addEventListener("click", displayModal);
function displayModal() {
  modal.classList.toggle("hidden");
}
