'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Rect = void 0;
var point_1 = require('./point');
var Rect = /** @class */ (function () {
  function Rect(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  Object.defineProperty(Rect.prototype, 'left', {
    get: function () {
      return this.x;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(Rect.prototype, 'right', {
    get: function () {
      return this.x + this.width;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(Rect.prototype, 'top', {
    get: function () {
      return this.y;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(Rect.prototype, 'bottom', {
    get: function () {
      return this.y + this.height;
    },
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(Rect.prototype, 'center', {
    get: function () {
      return new point_1.Point(this.x + this.width / 2.0, this.y + this.height / 2.0);
    },
    enumerable: false,
    configurable: true,
  });
  Rect.prototype.union = function (pt) {
    var pt1 = new point_1.Point(this.x, this.y);
    var pt2 = new point_1.Point(this.x + this.width, this.y + this.height);
    pt1.x = Math.min(pt1.x, pt.x);
    pt1.y = Math.min(pt1.y, pt.y);
    pt2.x = Math.max(pt2.x, pt.x);
    pt2.y = Math.max(pt2.y, pt.y);
    this.x = pt1.x;
    this.y = pt1.y;
    this.width = pt2.x - pt1.x;
    this.height = pt2.y - pt1.y;
  };
  Rect.prototype.containsPos = function (x, y) {
    return this.x <= x && x < this.x + this.width && this.y <= y && y < this.y + this.height;
  };
  Rect.prototype.containsPoint = function (value) {
    return this.x <= value.x && value.x < this.x + this.width && this.y <= value.y && value.y < this.y + this.height;
  };
  Rect.prototype.containsRect = function (value) {
    return (
      this.x <= value.x &&
      value.x + value.width <= this.x + this.width &&
      this.y <= value.y &&
      value.y + value.height <= this.y + this.height
    );
  };
  Rect.prototype.intersects = function (value) {
    return value.left < this.right && this.left < value.right && value.top < this.bottom && this.top < value.bottom;
  };
  Rect.prototype.hasCommonParts = function (value) {
    return (
      this.intersects(value) ||
      this.containsPos(value.x, value.y) ||
      this.containsPos(value.x + value.width, value.y) ||
      this.containsPos(value.x + value.width, value.y + value.height) ||
      this.containsPos(value.x, value.y + value.height) ||
      value.containsPos(this.x, this.y) ||
      value.containsPos(this.x + this.width, this.y) ||
      value.containsPos(this.x + this.width, this.y + this.height) ||
      value.containsPos(this.x, this.y + this.height)
    );
  };
  return Rect;
})();
exports.Rect = Rect;
