
export function PausePanel(panel, elements) {
  this.panel = panel;
  this.elements = elements;
  this.type = '';
  this.hide();
}

PausePanel.prototype.setPanel = function(type) {
  this.panel.textContent = '';
  this.type = type;

  let renderElements = this.elements[type];
  renderElements.forEach(element => {
    this.panel.appendChild(element);
  });
  this.show();
}

PausePanel.prototype.hide = function() {
  this.panel.style.display = 'none';
}

PausePanel.prototype.show = function() {
  this.panel.style.display = 'flex';
}

PausePanel.prototype.getPanel = function() {
  return this.type;
}
