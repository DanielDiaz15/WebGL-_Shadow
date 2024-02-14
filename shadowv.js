"use strict";

var canvas;
var gl;

var points = [];

var left = -2.0;
var right = 2.0;
var bottom = -2.0;
var topOrtho = 2.0;
var near = -8;
var far = 8;

var xDistance;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var objColor;
var shadColor;
var fColor;

var eye, at, up;
var light;

var m;

var slider;



window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    slider = document.getElementById("shadowSlider");

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    light = vec3(2, 0.0, 0.0);

// matrix for shadow projection (one elemnt=-1/yl)

    m = mat4();
    m[3][3] = 0;
    m[3][0] = -1.0/light[0]


    at = vec3(0.0, 0.0, 0.0);
    up = vec3(0.0, 1.0, 0.0);
    eye = vec3(1.0, 0.0, 1.0);

    objColor = vec4(0.0, 0.0, 1.0, 1.0);
    shadColor = vec4(0.0, 0.0, 0.0, 1.0);

    //Drawing the square

    points.push(vec4(0.5,0.0, -0.5, 1));
    points.push(vec4(0.5,0.5, 0.0, 1));
    points.push(vec4(0.5,0.0, 0.5, 1));
    points.push(vec4(0.5,-0.5, 0.0, 1));

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    fColor = gl.getUniformLocation(program, "fColor");
    xDistance = gl.getUniformLocation(program, "xDistance");

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    projectionMatrix = ortho(left, right, bottom, topOrtho, near, far);
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.uniform1f(xDistance, 0.5);
    slider.oninput = function() {
        var number = parseFloat(this.value);
        gl.uniform1f(xDistance, number); //this.value is a STRING naturally
        //console.log(this.value);
        //light[0] = (number+1.5);
        //console.log(light[0]);
        //m[3][0] = -1.0/light[0];
        updateLight();
        console.log(m[3][0]);
        render();
    }


    render();

}

function updateLight() {
    modelViewMatrix = mult(modelViewMatrix, translate(light[0], light[1], light[2]));
    modelViewMatrix = mult(modelViewMatrix, m);
    modelViewMatrix = mult(modelViewMatrix, translate(-light[0], -light[1],
        -light[2]));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
}

var render = function() {

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // model-view matrix for square

        modelViewMatrix = lookAt(eye, at, up);

        // send color and matrix for square then render

        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniform4fv(fColor, flatten(objColor));
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);


        // model-view matrix for shadow then render

        modelViewMatrix = mult(modelViewMatrix, translate(light[0], light[1], light[2]));
        modelViewMatrix = mult(modelViewMatrix, m);
        modelViewMatrix = mult(modelViewMatrix, translate(-light[0], -light[1],
           -light[2]));

    
        // send color and matrix for shadow

        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniform4fv(fColor, flatten(shadColor));
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    }
