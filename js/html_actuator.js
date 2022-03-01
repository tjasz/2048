function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classval = tile.value % 5 === 0 ? tile.value / 5 * 2 : tile.value % 3 === 0 ? tile.value / 3 * 2 : tile.value;
  var classes = ["tile", "tile-" + classval, positionClass];

  if (classval > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // determine style based on tile value
  if (tile.value % 5 === 0) {
    var pow2 = Math.log(tile.value / 5) / Math.log(2);
    var huebase = 240;

    var hue = huebase - 30 + Math.floor(pow2 / 3) * 20;
    var sat = 25.0 +  Math.floor((pow2+1) / 3) * 25;
    var light = 80.0 - Math.floor((pow2+2) / 3) * 20;

    inner.style.backgroundColor = "hsl(" + hue + ", " + sat + "%, " + light + "%)";
    console.log("hsl(" + hue + ", " + sat + "%, " + light + "%)");
    inner.style.color = light > 50 ? "#202020" : "white";
  }
  else if (tile.value % 3 === 0) {
    var pow2 = Math.log(tile.value / 3) / Math.log(2);
    var huebase = 120;

    var hue = huebase - 30 + Math.floor(pow2 / 3) * 20;
    var sat = 25.0 +  Math.floor((pow2+1) / 3) * 25;
    var light = 80.0 - Math.floor((pow2+2) / 3) * 20;

    inner.style.backgroundColor = "hsl(" + hue + ", " + sat + "%, " + light + "%)";
    console.log("hsl(" + hue + ", " + sat + "%, " + light + "%)");
    inner.style.color = light > 50 ? "#202020" : "white";
  }
  else if (tile.value % 2 === 0) {
    var pow2 = Math.log(tile.value / 2) / Math.log(2);
    var huebase = 0;

    var hue = huebase - 30 + Math.floor(pow2 / 3) * 20;
    var sat = 25.0 +  Math.floor((pow2+1) / 3) * 25;
    var light = 80.0 - Math.floor((pow2+2) / 3) * 20;

    inner.style.backgroundColor = "hsl(" + hue + ", " + sat + "%, " + light + "%)";
    console.log("hsl(" + hue + ", " + sat + "%, " + light + "%)");
    inner.style.color = light > 50 ? "#202020" : "white";
  }
  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
