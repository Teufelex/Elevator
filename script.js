"use strict"
class House {
  constructor(floors) {
    this.floors = floors;
    this.page = document.createElement("div");
    this.house = document.createElement("div");
    this.elevator = document.createElement("div");
    this.floorSize = 0;
    this.lvl = 1;
    this.posY = 0;
    this.runTop = {};
    this.runBottom = {};
    this.timer = 0;
    this.timerDoors = 0;
    this.timerOn = false;
    this.doorPos = 0;
    this.way = true;
  }

  init() {
    this.addHouse();
    document.body.appendChild(this.page);

    this.getFloorSize();
    this.buildHouse();
    this.createElevator();
    this.createElevatorButtons();
  }

  getFloorSize() {
    let house = document.querySelector(".house");
    let compStyle = getComputedStyle(document.querySelector(".house"));
    this.floorSize = parseInt(compStyle.height, 10) / this.floors;
  }

  buildHouse() {
    for(let i = 0; i < this.floors; i++) {
      let floor = document.createElement("div");
      floor.classList.add("house__floor");
      floor.id = this.floors - i;
      this.addButtons(floor, i);
      this.house.appendChild(floor);
    }
  }

  addButtons(elem, num) {
    let wrapper = document.createElement("div");
    let buttonTop = document.createElement("button");
    let buttonBottom = document.createElement("button");
    let attr = this.floors - num;

    wrapper.classList.add("wrapper__button");
    buttonTop.classList.add("wrapper__button--top", "wrapper__button--buttons");
    buttonBottom.classList.add("wrapper__button--bottom", "wrapper__button--buttons");

    if (num !== 0) {
      buttonTop.setAttribute("data-id", `${attr}`);
      buttonTop.addEventListener("click", this.addTop.bind(this));
    } else {
      buttonTop.setAttribute("disabled", "disabled");
    }

    if (num !== this.floors - 1) {
      buttonBottom.setAttribute("data-id", `${-attr}`);
      buttonBottom.addEventListener("click", this.addDown.bind(this));
    } else {
      buttonBottom.setAttribute("disabled", "disabled");
    }

    wrapper.appendChild(buttonTop);
    wrapper.appendChild(buttonBottom);
    elem.appendChild(wrapper);
  }

  addHouse() {
    let well = document.createElement("div");
    well.classList.add("well");
    this.house.classList.add("house");
    this.page.classList.add("wrapper");
    this.house.appendChild(well);
    this.page.appendChild(this.house);
  }

  createElevator() {
    let elev = document.createElement("div");
    let elevDoorLeft = document.createElement("div");
    let elevDoorRigth = document.createElement("div");
    elev.style.height = this.floorSize + "px";
    elev.style.width = "20vw";
    elevDoorLeft.classList.add("elev__door", "door__left");
    elevDoorRigth.classList.add("elev__door", "door__right");
    elev.appendChild(elevDoorLeft);
    elev.appendChild(elevDoorRigth);
    elev.classList.add("house__elevator");
    this.house.appendChild(elev);
  }

  createElevatorButtons() {
    let panel = document.createElement("div");
    for(let i = 0; i < this.floors; i++) {
      let btn = document.createElement("button");
      btn.classList.add("elevator__btn");
      btn.setAttribute("data-value", `${i + 1}`);
      btn.innerHTML = i + 1;
      btn.style.order = this.floors - i;
      btn.addEventListener("click", this.go.bind(this));
      panel.appendChild(btn);
    }
    panel.classList.add("control");
    this.page.appendChild(panel);
  }

  go(e) {
    e = e || window.event;
    let floor = +e.target.innerHTML;
    e.target.classList.add("button__active");
    let height = this.floorSize * (floor - 1);
    (this.lvl > floor) ? this.runBottom[floor] = height :
    this.runTop[floor] = height;
    if (!this.timerOn && this.lvl > floor) {
      this.goDown(floor);
    } else if (!this.timerOn && this.lvl < floor) {
      this.goTop(floor);
    }
  }

  addTop(e) {
    e = e || window.event;
    let floor = +e.target.getAttribute("data-id");
    if (this.lvl === floor) return;
    e.target.classList.add("button__active");
    let height = this.floorSize * (floor - 1);
    this.runTop[floor] = height;
    if (!this.timerOn) this.timer = requestAnimationFrame(() => {this.goTop(floor)});
  }

  goTop(fl) {
    if (!this.timerOn) this.posY = (this.lvl - 1) * this.floorSize;
    this.timerOn = true;
    let elevator = document.querySelector(".house__elevator");
    let cordY = this.runTop[fl];
    let speed = 0.5;

    if (cordY < this.posY) {
      cancelAnimationFrame(this.timer);
      this.timer = 0; 
      this.turnDown(fl);
      return;
    }

    this.posY += speed;
    elevator.style.bottom = this.posY + "px";

    if (cordY <= this.posY) {
      this.removeActiveClasses(fl);
      cancelAnimationFrame(this.timer);
      this.timer = 0;
      this.lvl = fl
      this.way = true;
      this.timerDoors = requestAnimationFrame(() => {this.opClDoors(true)});
    } else {
      this.timer = requestAnimationFrame(() => {this.goTop(fl)});
    }
  }

  checkStartFloorTop(fl) {
    if (fl === 0 && Object.keys(this.runTop).length > 0) {
      for(fl; fl <= this.floors; fl++) {
        if (fl === 1 && this.lvl === 1) {
          delete this.runTop[fl];
        } else if (fl in this.runTop) {
          this.timer = requestAnimationFrame(() => {this.goTop(fl)});
          break;
        }
      }
    } else if (
      fl === 0 && 
      Object.keys(this.runBottom).sort((a, b) => b - a).length > 0) { 
        let floor =  Object.keys(this.runBottom)[0];
        this.turnUp(floor);
    } else if (fl === 0) {
      this.timerOn = false;
    } 
  }

  addDown(e) {
    e = e || window.event;
    let floor = e.target.getAttribute("data-id") * -1;
    if (this.lvl === floor) return;
    e.target.classList.add("button__active");
    let height = this.floorSize * (floor - 1);
    this.runBottom[floor] = height;
    if (!this.timerOn) this.timer = requestAnimationFrame(() => {this.goDown(floor)});
  }

  goDown(fl) {
    if (!this.timerOn) this.posY = (this.lvl - 1) * this.floorSize;
    this.timerOn = true;
    let elevator = document.querySelector(".house__elevator");
    let cordY = this.runBottom[fl];
    let speed = 0.5;

    if (cordY > this.posY) {
      cancelAnimationFrame(this.timer);
      this.timer = 0;
      this.turnUp(fl);
      return;
    }

    this.posY -= speed;
    elevator.style.bottom = this.posY + "px";

    if (cordY >= this.posY) {
      cancelAnimationFrame(this.timer);
      this.timer = 0;
      this.removeActiveClasses(fl);
      this.lvl = fl;
      this.way = false;
      this.timerDoors = requestAnimationFrame(() => {this.opClDoors(true)});
    } else {
      this.timer = requestAnimationFrame(() => {this.goDown(fl)});
    }
  }

  checkNextFloorTop(fl) {
    this.posY = 0;
    delete this.runTop[fl];
    this.timerOn = false;

    if (fl !== this.floors) ++fl;
    for(fl; fl <= this.floors; fl++) {
      if (fl in this.runTop) {
        this.timer = requestAnimationFrame(() => {this.goTop(fl)});
        break;
      } else {
        if (fl === this.floors) this.checkStartFloorBottom(fl);
      }
    }
  }

  checkNextFloorBottom(fl) {
    this.posY = 0;
    delete this.runBottom[fl];
    this.timerOn = false;

    --fl;
    for(fl; fl >= 0; fl--) {
      if (fl in this.runBottom) {
        this.timer = requestAnimationFrame(() => {this.goDown(fl)});
        break;
      } else {
        this.checkStartFloorTop(fl);
      }
    }
  }

  checkStartFloorBottom(fl) {
    if (Object.keys(this.runBottom).length > 0) {
      for(fl; fl >= 0; fl--) {
        if (fl === this.floors && this.lvl === this.floors) {
          delete this.runBottom[fl];
        } else if (fl in this.runBottom) {
          this.timer = requestAnimationFrame(() => {this.goDown(fl)});
          break;
        }
      }
    } else if (Object.keys(this.runTop).sort((a, b) => a - b).length > 0) { 
        let floor =  Object.keys(this.runTop)[0];
        this.turnDown(floor);
    } else {
      this.timerOn = false;
    } 
  }

  turnUp(fl) {
    this.timerOn = false;
    delete this.runBottom[fl];
    this.runTop[fl] = this.floorSize * (fl - 1);
    this.timer = requestAnimationFrame(() => {this.goTop(fl)});
  }

  turnDown(fl) {
    this.timerOn = false;
    delete this.runTop[fl];
    this.runBottom[fl] = this.floorSize * (fl - 1);
    this.timer = requestAnimationFrame(() => {this.goDown(fl)});
  }

  removeActiveClasses(fl) {
    let floor_btnUp = document.querySelector(`button[data-id = "${fl}"]`);
    let floor_btnDown = document.querySelector(`button[data-id = "-${fl}"]`);
    if (floor_btnUp) floor_btnUp.classList.remove("button__active");
    if (floor_btnDown) floor_btnDown.classList.remove("button__active");
    document.querySelector(`button[data-value = "${fl}"]`).classList.remove("button__active");
  }

  opClDoors(whatToDo) {
    let doorL = document.querySelector(".door__left");
    let doorR = document.querySelector(".door__right");
    let width = +doorL.offsetWidth;
    let speed = 0.5;
    this.doorPos = (whatToDo) ?  
    this.doorPos - speed : 
    this.doorPos + speed;
    let val = (whatToDo) ? width > -this.doorPos : this.doorPos < 0;

    doorL.style.left = this.doorPos + "px";
    doorR.style.right = this.doorPos + "px";

    if (val) {
      this.timerDoors = requestAnimationFrame(() => {this.opClDoors(whatToDo)});
    } else {
      cancelAnimationFrame(this.timerDoors);
      this.timerDoors = 0;

      if (whatToDo) {
        this.timerDoors = requestAnimationFrame(() => {this.wait()});
      } else {
        this.timer = (this.way) ? 
        requestAnimationFrame(() => {this.checkNextFloorTop(this.lvl)}) :
        requestAnimationFrame(() => {this.checkNextFloorBottom(this.lvl)});
        this.timerOn = false;
        this.doorPos = 0;
      }
    }
  }

  wait() {
    let rand;
    do {
      rand = Math.round(0.5 + Math.random() * this.floors);
    } while (rand === this.lvl);
    let elem = document.querySelector(`button[data-value="${rand}"]`);
    elem.click();

    this.timer = setTimeout(() => {this.opClDoors(false); this.start()}, 3000);
  }

  start() {
    let num = this.randomNum();
    let topOrDown = Math.round(0.5 + Math.random() * 2);
    let btnTop = document.querySelector(`button[data-id="${num}"]`);
    let btnDown = document.querySelector(`button[data-id="-${num}"]`);
    if (!btnTop) btnTop = btnDown;
    if (!btnDown) btnDown = btnTop;
    (topOrDown === 1) ? btnTop.click() : btnDown.click();
  }

  randomNum() {
    let rand = 0.5 + Math.random() * this.floors;
    return Math.round(rand);
  }
}


window.onload = () => {
  let house = new House(9);
  house.init();
  house.start();

  document.querySelector(".size__wrapper").onclick = (e) => {
    e = e || window.event;
    cancelAnimationFrame(house.timer);
    cancelAnimationFrame(house.timerDoors);
    clearTimeout(house.timer);

    let container = document.querySelector(".wrapper");
    let elem = e.target.id;
    let size;
    if (elem === "size_5") size = 5;
    if (elem === "size_9") size = 9;
    if (elem === "size_15") size = 15;
    
    document.body.removeChild(container);
    house = new House(size);
    house.runTop = {};
    house.runBottom = {};
    house.init();
    house.start();
  }
}