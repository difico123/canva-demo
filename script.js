var width = window.innerWidth;
var height = window.innerHeight - 25;
let color = document.getElementsByClassName("color");
var container = document.getElementById("container");
var select = document.getElementById("tool");
var range = document.getElementById("volume").value;
let drawMode = document.getElementById("draw-mode");
let shapes = document.getElementsByClassName("shape");
let shape = "";

// first we need Konva core things: stage and layer
var stage = new Konva.Stage({
    container: "container",
    width: width,
    height: height,
});

var layer = new Konva.Layer();
stage.add(layer);

// then we are going to draw into special canvas element
var canvas = document.createElement("canvas");
canvas.width = stage.width();
canvas.height = stage.height();

// created canvas we can add to layer as "Konva.Image" element
var image = new Konva.Image({
    image: canvas,
    x: 0,
    y: 0,
});

layer.add(image);

function getPos() {
    return {
        x: lastPointerPosition.x,
        y: lastPointerPosition.y,
    };
}
// image.on("mousemove touchmove", (e) => {
//     console.log(localPos);
// });

// var blueLine = new Konva.Line({
//     y: 50,
//     points: [10, 70, 40, 23, 150, 60, 250, 20],
//     stroke: "blue",
//     strokeWidth: 10,
//     lineCap: "round",
//     lineJoin: "round",
//     dash: [29, 20, 0.001, 20],
//     draggable: true,
//     name: "rect",
// });

// layer.add(blueLine);

// circle.on("mouseover", function () {
//     document.body.style.cursor = "pointer";
// });

// circle.on("mouseout", function () {
//     document.body.style.cursor = "default";
// });

// Good. Now we need to get access to context element
var context = canvas.getContext("2d");
context.strokeStyle = "#df4b26";
context.lineJoin = "round";
context.lineWidth = 19;

function handleChangeValue(value) {
    context.lineWidth = value;
    container.style.cursor = `url('https://ecepishy.sirv.com/Images/%E2%80%94Pngtree%E2%80%94black%20ring_5487778.png?w=${value}&h=${value}'),auto`;
}

var isPaint = false;
var lastPointerPosition;
var mode = "brush";

function reset() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    layer.batchDraw();
}

for (let i = 0; i < color.length; i++) {
    color[i].style.backgroundColor = color[i].dataset.color;
    color[i].addEventListener("click", (e) => {
        context.strokeStyle = color[i].dataset.color;
    });
}

for (let i = 0; i < shapes.length; i++) {
    shapes[i].addEventListener("dragend", (e) => {
        lastPointerPosition = stage.getPointerPosition();
        switch (shapes[i].dataset.shape) {
            case "circle": {
                let circle = new Konva.Circle({
                    x: getPos().x,
                    y: getPos().y,
                    radius: 70,
                    fill: "red",
                    stroke: "yellow",
                    strokeWidth: 4,
                    name: "rect",
                    draggable: true,
                });
                layer.add(circle);
                break;
            }
            case "square": {
                let square = new Konva.Rect({
                    x: getPos().x,
                    y: getPos().y,
                    fill: "red",
                    name: "rect",
                    stroke: "orange",
                    strokeWidth: 4,
                    draggable: true,
                    width: 200,
                    height: 200,
                });
                layer.add(square);
                break;
            }
            case "rect": {
                let rect = new Konva.Rect({
                    x: getPos().x,
                    y: getPos().y,
                    fill: "red",
                    stroke: "black",
                    strokeWidth: 4,
                    name: "rect",
                    draggable: true,
                    width: 200,
                    height: 100,
                });
                layer.add(rect);
                break;
            }
            case "triangle": {
                var triangle = new Konva.RegularPolygon({
                    x: getPos().x,
                    y: getPos().y,
                    sides: 3,
                    radius: 70,
                    fill: "red",
                    draggable: true,
                    stroke: "black",
                    name: "rect",
                    strokeWidth: 20,
                    lineJoin: "round",
                });

                // add the shape to the layer
                layer.add(triangle);
                break;
            }
        }

        console.log(shapes[i].dataset.shape);
    });
}

stage.on("mousedown touchstart", function () {
    isPaint = true;
    lastPointerPosition = stage.getPointerPosition();
});

stage.on("mouseup touchend", function () {
    isPaint = false;
});

stage.on("mousemove touchmove", function () {
    if (!drawMode.checked) {
        return;
    }
    if (!isPaint) {
        return;
    }

    if (mode === "brush") {
        context.globalCompositeOperation = "source-over";
    }
    if (mode === "eraser") {
        context.globalCompositeOperation = "destination-out";
    }

    context.beginPath();

    var localPos = {
        x: lastPointerPosition.x - image.x(),
        y: lastPointerPosition.y - image.y(),
    };

    context.moveTo(localPos.x, localPos.y);

    var pos = stage.getPointerPosition();

    localPos = {
        x: pos.x - image.x(),
        y: pos.y - image.y(),
    };

    context.lineTo(localPos.x, localPos.y);
    context.closePath();
    context.stroke();

    lastPointerPosition = pos;

    // redraw manually
    layer.batchDraw();
});

select.addEventListener("change", function () {
    mode = select.value;
});

var tr = new Konva.Transformer();

layer.add(tr);
// tr.nodes([circle, blueLine]);

var selectionRectangle = new Konva.Rect({
    fill: "rgba(0,0,255,0.5)",
    visible: true,
});
layer.add(selectionRectangle);

var x1, y1, x2, y2;
stage.on("mousedown touchstart", (e) => {
    // do nothing if we mousedown on any shape
    if (e.target !== stage) {
        return;
    }
    e.evt.preventDefault();
    x1 = stage.getPointerPosition().x;
    y1 = stage.getPointerPosition().y;
    x2 = stage.getPointerPosition().x;
    y2 = stage.getPointerPosition().y;

    selectionRectangle.visible(true);
    selectionRectangle.width(0);
    selectionRectangle.height(0);
});
stage.on("mouseup touchend", (e) => {
    // do nothing if we didn't start selection
    if (!selectionRectangle.visible()) {
        return;
    }
    e.evt.preventDefault();
    setTimeout(() => {
        selectionRectangle.visible(false);
    });

    var shapes = stage.find(".rect");
    var box = selectionRectangle.getClientRect();
    var selected = shapes.filter((shape) => Konva.Util.haveIntersection(box, shape.getClientRect()));
    tr.nodes(selected);
});

stage.on("click tap", function (e) {
    // if we are selecting with rect, do nothing
    if (selectionRectangle.visible()) {
        return;
    }

    // if click on empty area - remove all selections
    if (e.target === stage) {
        tr.nodes([]);
        return;
    }

    // do nothing if clicked NOT on our rectangles
    if (!e.target.hasName("rect")) {
        return;
    }

    // do we pressed shift or ctrl?
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = tr.nodes().indexOf(e.target) >= 0;

    if (!metaPressed && !isSelected) {
        // if no key pressed and the node is not selected
        // select just one
        tr.nodes([e.target]);
    } else if (metaPressed && isSelected) {
        // if we pressed keys and node was selected
        // we need to remove it from selection:
        const nodes = tr.nodes().slice(); // use slice to have new copy of array
        // remove node from array
        nodes.splice(nodes.indexOf(e.target), 1);
        tr.nodes(nodes);
    } else if (metaPressed && !isSelected) {
        // add the node into selection
        const nodes = tr.nodes().concat([e.target]);
        tr.nodes(nodes);
    }
});
