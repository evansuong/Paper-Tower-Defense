import { constants } from "./constants.js";

const { 
  TOWER_SIZE_OFFSET,
  MAP_SIZE
} = constants;

export const Controller = function() {

  this.mousePos = { x: 0, y: 0 };
  this.dragging = false;
  this.dragObject = {};

}

Controller.prototype.onMouseClick = function(e, dragObject) {
  dragObject.className = 'mouse-drag-object';
  dragObject.id = `${e.target.id}`;
  dragObject.style.left = e.pageX - TOWER_SIZE_OFFSET + 'px';
  dragObject.style.top = e.pageY - TOWER_SIZE_OFFSET + 'px';
  this.dragObject = dragObject;
  this.dragging = true;
  this.setMousePos(e);
}


// set tower x, y position to the mouse
Controller.prototype.onMouseMove = function(e) {
  if (this.dragging) {
    this.dragObject.style.left = e.pageX - TOWER_SIZE_OFFSET + 'px';
    this.dragObject.style.top = e.pageY - TOWER_SIZE_OFFSET + 'px';
    this.setMousePos(e);
  }
}

Controller.prototype.onMouseDown = function(e) {
  this.setMousePos(e);
}


Controller.prototype.isMouseInCanvas = function() {
  let { x, y } = this.mousePos;
  return (x < MAP_SIZE && x > 0 && y < MAP_SIZE && y > 0)
}


// get mouse position relative to the canvas
Controller.prototype.setMousePos = function(e) {
  var rect = document.querySelector('canvas').getBoundingClientRect();
  this.mousePos = {
    x: e.clientX - rect.left - 10,
    y: e.clientY - rect.top - 10
  };
}

Controller.prototype.onMouseUp = function(e) {
  this.dragObject = {};
  this.dragging = false;
}

Controller.prototype.getMousePos = function() {
  return this.mousePos;
}

Controller.prototype.getDragObject = function() {
  return this.dragObject;
}


