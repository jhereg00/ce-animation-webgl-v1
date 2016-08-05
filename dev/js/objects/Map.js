// Makes a journey map animation

// pseudo:
//  1. make a fractal terrain
//  2. divide into topography lines
//  3. map a journey through the terrain (A*)
//  4. smooth curves

// requirements
var GLBuffer = require('lib/webgl/GLBuffer');
var makeTransformMatrix = require('lib/webgl/makeTransformMatrix');
var Matrix = require('lib/math/Matrix');
var Vector = require('lib/math/Vector');

// settings
var FRACTAL_NODES = [129,129], // must be power of 2 + 1
    FRACTAL_VARIATION = 2,
    FRACTAL_SIZE = 7,
    PLANE_INCREMENT = .1
    ;

// classes
/**
 *  Fractal
 *  simulates terrain using the "diamond-square" algorithm
 */
var Fractal = function (gl, width, height) {
  this.gl = gl;
  this.width = width || 2.0;
  this.height = height || 2.0;
  // make an empty array
  var nodes = [];
  for (var x = 0; x < FRACTAL_NODES[0]; ++x) {
    nodes.push([]);
    for (var y = 0; y < FRACTAL_NODES[1]; ++y) {
      nodes[x].push(undefined);
    }
  }

  // make some corners
  nodes[0][0] = [
    -1.0 * (this.width / 2),
    1.0 * (this.height / 2),
    Math.random() * FRACTAL_VARIATION / 8 - FRACTAL_VARIATION / 8 / 2];
  nodes[FRACTAL_NODES[0] - 1][0] = [
    1.0 * (this.width / 2),
    1.0 * (this.height / 2),
    Math.random() * FRACTAL_VARIATION / 8 - FRACTAL_VARIATION / 8 / 2];
  nodes[0][FRACTAL_NODES[1] - 1] = [
    -1.0 * (this.width / 2),
    -1.0 * (this.height / 2),
    Math.random() * FRACTAL_VARIATION / 8 - FRACTAL_VARIATION / 8 / 2];
  nodes[FRACTAL_NODES[0] - 1][FRACTAL_NODES[1] - 1] = [
    1.0 * (this.width / 2),
    -1.0 * (this.height / 2),
    Math.random() * FRACTAL_VARIATION / 8 - FRACTAL_VARIATION / 8 / 2];

  // diamond-square
  var divisor = 2;
  for (; divisor < FRACTAL_NODES[0]; divisor *= 2) {
    var offset = Math.floor((FRACTAL_NODES[0]) / divisor);

    // diamonds
    for (var x = offset; x < FRACTAL_NODES[0] - 1; x += offset * 2) {
      for (var y = offset; y < FRACTAL_NODES[1] - 1; y += offset * 2) {
        // get average of points around
        var averageZ = (nodes[x - offset][y - offset][2] +
                        nodes[x + offset][y - offset][2] +
                        nodes[x - offset][y + offset][2] +
                        nodes[x + offset][y + offset][2]) / 4;
        nodes[x][y] = [
          (2 * (x / (FRACTAL_NODES[0] - 1)) - 1.0) * (this.width / 2),
          (1.0 - 2 * (y / (FRACTAL_NODES[1] - 1))) * (this.height / 2),
          averageZ + (Math.random() * FRACTAL_VARIATION / divisor - FRACTAL_VARIATION / divisor / 2)
        ]
      }
    }
    // squares
    for (var x = 0; x < FRACTAL_NODES[0]; x += offset) {
      var shift = (x + offset) % (offset * 2);
      for (var y = shift; y < FRACTAL_NODES[1]; y += offset * 2) {
        // get average of points around
        var count = 0;
        var averageZ = 0;
        for (var xPrime = x - offset, yPrime = y - offset; xPrime <= x; xPrime += offset, yPrime += offset) {
          if (nodes[xPrime] && nodes[xPrime][yPrime + offset]) {
            averageZ += nodes[xPrime][yPrime + offset][2];
            ++count;
          }
          if (nodes[xPrime + offset] && nodes[xPrime + offset][yPrime]) {
            averageZ += nodes[xPrime + offset][yPrime][2];
            ++count;
          }
        }
        averageZ /= count;
        nodes[x][y] = [
          (2 * (x / (FRACTAL_NODES[0] - 1)) - 1.0) * (this.width / 2),
          (1.0 - 2 * (y / (FRACTAL_NODES[1] - 1))) * (this.height / 2),
          averageZ + (Math.random() * FRACTAL_VARIATION / (divisor - 1) - FRACTAL_VARIATION / (divisor - 1) / 2)
        ]
      }
    }
  }
  this.nodes = nodes;
  //this.logZ();

  this.buildBuffers();

  this.nodeArray = this.getNodes();
  this.tris = this.getTris();
}
Fractal.prototype = {
  /**
   *  getNodes
   *  @returns 1-D array of node points: [x, y, z, x, y, z, x, y, z,...]
   */
  getNodes: function () {
    var retArray = [];
    for (var y = 0; y < FRACTAL_NODES[1]; ++y) {
      for (var x = 0; x < FRACTAL_NODES[0]; ++x) {
        retArray = retArray.concat(this.nodes[x][y]);
      }
    }
    return retArray;
  },
  /**
   *  getTris
   *  @returns index order of nodes in order to draw tris
   */
  getTris: function () {
    var retArray = [];

    var _this = this;

    function getBottomLeft (x, y) {
      retArray.push(_this.getIndexFromCoords(x, y));
      retArray.push(_this.getIndexFromCoords(x, y + 1));
      retArray.push(_this.getIndexFromCoords(x + 1, y + 1));
    }
    function getTopRight (x, y) {
      retArray.push(_this.getIndexFromCoords(x, y));
      retArray.push(_this.getIndexFromCoords(x + 1, y));
      retArray.push(_this.getIndexFromCoords(x + 1, y + 1));
    }
    function getTopLeft (x, y) {
      retArray.push(_this.getIndexFromCoords(x, y));
      retArray.push(_this.getIndexFromCoords(x + 1, y));
      retArray.push(_this.getIndexFromCoords(x, y + 1));
    }
    function getBottomRight (x, y) {
      retArray.push(_this.getIndexFromCoords(x + 1, y));
      retArray.push(_this.getIndexFromCoords(x, y + 1));
      retArray.push(_this.getIndexFromCoords(x + 1, y + 1));
    }
    for (var y = 0; y < FRACTAL_NODES[1] - 1; y++) {
      for (var x = 0; x < FRACTAL_NODES[0] - 1; x++) {
        for (var x1 = x; x1 < x + 2; x1++) {
          if ((x + y) % 2) {
            getTopLeft(x,y);
            getBottomRight(x,y);
          }
          else {
          getBottomLeft(x,y);
            getTopRight(x,y);
          }
        }
      }
    }

    return retArray;
  },
  logZ: function () {
    var logStr = "";
    for (var y = 0; y < FRACTAL_NODES[1]; y++) {
      for (var x = 0; x < FRACTAL_NODES[0]; x++) {
        logStr += Math.round(this.nodes[x][y][2] * 100) + "\t";
      }
      logStr += "\n"
    }
    console.log(logStr);
  },
  logPoints: function () {
    var indexes = this.getTris();
    var nodes = this.getNodes();
    var logStr = "";
    for (var i = 0; i < indexes.length; i++) {
      var j = indexes[i];
      logStr += j + ":\t" + nodes[j * 3] + ", " + nodes[j * 3 + 1] + ", " + nodes[j * 3 + 2];
      logStr += "\n";
      if ((i + 1) % 3 === 0) {
        logStr += "\n";
      }
    }
    console.log(logStr);
  },
  /**
   *  buildBuffers
   */
  buildBuffers: function () {
    this.buffers = {
      vertices: GLBuffer.create(this.gl, this.gl.ARRAY_BUFFER, 3),
      elements: GLBuffer.create(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, 1)
    }
  },
  /**
   *  getIndexFromCoords
   *  @returns index of node in flat array
   */
  getIndexFromCoords: function (x, y) {
    return (y * FRACTAL_NODES[0]) + x;
  },
  draw: function (camera, program) {
    // use the program
    program.use();
    // bind camera
    this.gl.uniformMatrix4fv(program.uniforms.uPMatrix, false, new Float32Array(camera.getMatrix().flatten()));
    // bind the buffers
    var nodes = this.nodeArray;
    this.buffers.vertices.bindToAttribute(program.attributes['aVertexPosition']);
    this.buffers.vertices.bindData(nodes);
    var tris = this.tris;
    this.buffers.elements.bindData(new Uint16Array(tris));

    // temp
    this.gl.uniformMatrix4fv(program.uniforms.uWorldMatrix, false, new Float32Array(
      Matrix.create.rotationX(Math.PI / 180 * 60)
      .multiply(Matrix.create.translation3d(Vector.create([0,0,-1.51])))
      .flatten()));
    this.gl.uniformMatrix4fv(program.uniforms.uModelMatrix, false, new Float32Array(Matrix.create.identity(4).flatten()));

    // draw it
    this.gl.lineWidth(2);
    this.gl.drawElements(this.gl.LINE_STRIP, tris.length, this.gl.UNSIGNED_SHORT, 0);
  }
}

/**
 *  topography
 */
var Topography = function (gl) {
  this.gl = gl;
  this.fractal = new Fractal(gl, FRACTAL_SIZE, FRACTAL_SIZE);

  this.buildLines();

  this.buildBuffers();
}
Topography.prototype = {
  flattenPlanes: function () {
    var retArray = [];
    for (var i = 0; i < this.planes.length; i++) {
      for (var j = 0; j < this.planes[i].length; j++) {
        retArray = retArray.concat(this.planes[i][j]);
      }
    }
    return retArray;
  },
  buildLines: function () {
    // build lines from fractal

    // points algorithm pseudo:
    //  iterate through vertices, and test for intersection
    //  check neighboring vertices going clockwise, only on connected lines
    //  add point if not already in a line
    //  when failing to find a new point:
    //    move to vertex in direction of failure, rotate check direction counter-clockwise 3/8 turn, then repeat

    var points = this.fractal.nodes;
    var MARGIN_OF_ERROR = 1e-12;
    var lines = [];
    var loopIndices = [];
    var directions = {
      R: 0,
      DR: 1,
      D: 2,
      DL: 3,
      L: 4,
      UL: 5,
      U: 6,
      UR: 7
    }
    function getCoordInDir (x, y, dir) {
      if (dir > -1 && dir < 2 || dir === 7) {
        x += 1;
      }
      else if (dir > 2 && dir < 6) {
        x -= 1;
      }

      if (dir > 0 && dir < 4) {
        y += 1;
      }
      else if (dir > 4 && dir < 8) {
        y -= 1;
      }

      if (points[x] && points[x][y])
        return [x,y];
      return undefined;
    }
    function testDir (x, y, dir, z) {
      var point = points[x][y];
      var comparePoint = getCoordInDir (x, y, dir);
      if (!comparePoint)
        return null;

      comparePoint = points[comparePoint[0]][comparePoint[1]];
      if ((point[2] > z && comparePoint[2] < z) ||
          (point[2] < z && comparePoint[2] > z)) {
        var zDiff = point[2] - comparePoint[2];
        var zPerc = (z - point[2]) / zDiff;
        return [
          point[0] + (point[0] - comparePoint[0]) * zPerc,
          point[1] + (point[1] - comparePoint[1]) * zPerc,
          z
        ];
      }
      return null;
    }
    function pointInLine (point) {
      for (var i = 0, len = lines.length; i < len; i++) {
        if (lines[i][0][2] !== point[2])
          continue;
        for (var j = 0; j < lines[i].length; j++) {
          if (lines[i][j][0] >= point[0] - MARGIN_OF_ERROR && lines[i][j][0] <= point[0] + MARGIN_OF_ERROR &&
              lines[i][j][1] >= point[1] - MARGIN_OF_ERROR && lines[i][j][1] <= point[1] + MARGIN_OF_ERROR &&
              lines[i][j][2] >= point[2] - MARGIN_OF_ERROR && lines[i][j][2] <= point[2] + MARGIN_OF_ERROR)
            return true;
        }
      }
      return false;
    }
    // follow a line
    function followLine (x, y, startDir, z, lineIndex) {
      var dir = (startDir + 1) % 8;

      // "infinite" loop that we must manually break
      var foundAny = true;
      var iteration = 0;
      while (true && iteration < 1000) {
        var diagAllowed = !((x + y) % 2);
        if (!diagAllowed && dir % 2)
          dir = (dir + 1) % 8;
        // look in all directions
        var intersect;
        // break if we circle all the way around and don't get a new point
        foundAny = iteration === 0; // always true on first, that's what started the line
        for (var a = 0; a < (diagAllowed ? 8 : 4); a++) {
          intersect = testDir (x, y, dir, z);
          if (intersect && !pointInLine(intersect)) {
            // found a point
            // increment direction by 2 if on a 'square' point
            if (!diagAllowed)
              dir = (dir + 2) % 8;
            else
              dir = (dir + 1) % 8;
            lines[lineIndex].push(intersect);
            foundAny = true;
          }
          else {
            a = 8;
          }
        }

        // empty line, so move and rotate dir
        var newCoords;
        newCoords = getCoordInDir(x, y, dir);
        dir = (dir + 8 - 3) % 8;
        if (newCoords === undefined || !foundAny) {
          break;
        }
        x = newCoords[0];
        y = newCoords[1];
        iteration++;
      }
    }


    // for each plane
    for (var z = -FRACTAL_VARIATION / 2 + PLANE_INCREMENT, i = 0; z < FRACTAL_VARIATION / 2; z += PLANE_INCREMENT, i++) {
      // outside first
      // top
      for (var x = 0; x < points.length; x++) {
        var intersect = testDir (x, 0, directions.R, z);
        if (intersect && !pointInLine(intersect)) {
          lines.push([intersect]);
          followLine(x, 0, directions.R, z, lines.length - 1);
        }
      }
      // left
      for (var y = 0; y < points[0].length; y++) {
        var intersect = testDir (0, y, directions.U, z);
        if (intersect && !pointInLine(intersect)) {
          lines.push([intersect]);
          followLine(0, y, directions.U, z, lines.length - 1);
        }
      }
      // right
      for (var y = 0; y < points[0].length; y++) {
        var intersect = testDir (points.length - 1, y, directions.D, z);
        if (intersect && !pointInLine(intersect)) {
          lines.push([intersect]);
          followLine(points.length - 1, y, directions.D, z, lines.length - 1);
        }
      }
      // bottom
      for (var x = 0; x < points.length; x++) {
        var intersect = testDir (x, points[0].length - 1, directions.L, z);
        if (intersect && !pointInLine(intersect)) {
          lines.push([intersect]);
          followLine(x, points[0].length - 1, directions.L, z, lines.length - 1);
        }
      }

      // interior
      for (var y = 1; y < points[0].length - 1; y++) {
        for (var x = 1; x < points.length - 1; x++) {
          var intersect = testDir (x, y, directions.R, z);
          if (intersect && !pointInLine(intersect)) {
            lines.push([intersect]);
            followLine(x, y, directions.R, z, lines.length - 1);
            loopIndices.push(lines.length - 1);
          }
        }
      }
    }

    this.lines = lines;
    this.loopIndices = loopIndices;
    this.linesFlat = this.flattenLines();
  },
  flattenLines: function () {
    var retArray = [];
    for (var i = 0; i < this.lines.length; i++) {
      retArray.push([]);
      if (!this.lines[i][0] || !this.lines[i][1]) {
        console.log(i, this.lines[i]);
      }
      for (var j = 0; j < this.lines[i].length; j++) {
        retArray[i] = retArray[i].concat(this.lines[i][j]);
      }
    }
    return retArray;
  },
  /**
   *  buildBuffers
   */
  buildBuffers: function () {
    this.buffers = {
      vertices: GLBuffer.create(this.gl, this.gl.ARRAY_BUFFER, 3),
      //elements: GLBuffer.create(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, 1)
    }
  },
  draw: function (camera, program) {
    // program.use();
    // this.gl.uniform1fv(program.uniforms.uPlanes, new Float32Array(this.planes));
    // this.fractal.draw(camera, program);

    // use the program
    program.use();
    // bind camera
    this.gl.uniformMatrix4fv(program.uniforms.uPMatrix, false, new Float32Array(camera.getMatrix().flatten()));
    // bind the buffers
    this.buffers.vertices.bindToAttribute(program.attributes['aVertexPosition']);

    // temp
    this.gl.uniformMatrix4fv(program.uniforms.uWorldMatrix, false, new Float32Array(
      Matrix.create.rotationX(Math.PI / 180 * 60)
      .multiply(Matrix.create.translation3d(Vector.create([0,0,-1.5])))
      .flatten()));
    this.gl.uniformMatrix4fv(program.uniforms.uModelMatrix, false, new Float32Array(Matrix.create.identity(4).flatten()));

    this.gl.lineWidth(2);
    // draw it
    for (var i = 0; i < this.linesFlat.length; i++) {
      this.buffers.vertices.bindData(this.linesFlat[i]);
      var prim = this.loopIndices.indexOf(i) !== -1 ? this.gl.LINE_LOOP : this.gl.LINE_STRIP;
      this.gl.drawArrays(prim, 0, this.linesFlat[i].length / 3);
    }

  }
}


module.exports.Fractal = Topography;
