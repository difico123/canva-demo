let width = window.innerWidth;
let height = window.innerHeight - 25;
let color = document.getElementsByClassName("color");
let container = document.getElementById("container");
let select = document.getElementById("tool");
let range = document.getElementById("volume").value;
let drawMode = document.getElementById("draw-mode");
let shapes = document.getElementsByClassName("shape");
let shape = "";

// first we need Konva core things: stage and layer
let stage = new Konva.Stage({
    container: "container",
    width: width,
    height: height,
});

let screenText = new Konva.Text({
    x: 15,
    y: 15,
    text: 'X: 0 Y: 0',
    fontSize: 30,
    fontFamily: 'Calibri',
    fill: 'green',
});


let layer = new Konva.Layer();
let transformLayer = new Konva.Layer()
let tr = new Konva.Transformer();

transformLayer.add(tr);
stage.add(layer);
layer.add(screenText)

// then we are going to draw into special canvas element
let canvas = document.createElement("canvas");
canvas.width = stage.width();
canvas.height = stage.height();

// created canvas we can add to layer as "Konva.Image" element
let image = new Konva.Image({
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


// Good. Now we need to get access to context element
let context = canvas.getContext("2d");
context.strokeStyle = "#df4b26";
context.lineJoin = "round";
context.lineWidth = 19;

function handleChangeValue(value) {
    context.lineWidth = value;
    container.style.cursor = `url('https://ecepishy.sirv.com/Images/%E2%80%94Pngtree%E2%80%94black%20ring_5487778.png?w=${value}&h=${value}'),auto`;
}

let isPaint = false;
let lastPointerPosition;
let mode = "brush";

function reset() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    layer.batchDraw();
}

for (let i = 0; i < color.length; i++) {
    color[i].style.backgroundColor = color[i].dataset.color;
    color[i].addEventListener("click", (e) => {
        context.strokeStyle = color[i].dataset.color;

        for (let j = 0; j < tr.nodes().length; j++) {
            let node = tr.nodes()[j];
            node.fill(color[i].dataset.color)
        }
    });
}

for (let i = 0; i < shapes.length; i++) {
    shapes[i].addEventListener("dragend", (e) => {
        const { clientX, clientY } = e
        screenText.setText(`X: ${clientX} Y: ${clientY} `)

        let pos = {
            x: clientX - container.offsetLeft,
            y: clientY - container.offsetTop,
        }

        let newShape

        switch (shapes[i].dataset.shape) {
            case "circle":
                {
                    newShape = new Konva.Circle({
                        x: pos.x,
                        y: pos.y,
                        radius: 70,
                        fill: "red",
                        stroke: "yellow",
                        strokeWidth: 4,
                        name: "rect",
                        draggable: true,
                    });
                    break;
                }
            case "square":
                {
                    newShape = new Konva.Rect({
                        fill: "red",
                        name: "rect",
                        stroke: "orange",
                        strokeWidth: 4,
                        draggable: true,
                        width: 200,
                        height: 200,
                    });

                    let width = newShape.width();
                    let height = newShape.height();
                    newShape.setX(pos.x - width / 2);
                    newShape.setY(pos.y - height / 2);
                    break;
                }
            case "rect":
                {
                    newShape = new Konva.Rect({
                        fill: "red",
                        name: "rect",
                        stroke: "orange",
                        strokeWidth: 4,
                        draggable: true,
                        width: 100,
                        height: 200,
                    });

                    let width = newShape.width();
                    let height = newShape.height();
                    newShape.setX(pos.x - width / 2);
                    newShape.setY(pos.y - height / 2);
                    break;
                }
            case "triangle":
                {
                    newShape = new Konva.RegularPolygon({
                        x: pos.x,
                        y: pos.y,
                        sides: 3,
                        radius: 70,
                        fill: "red",
                        draggable: true,
                        stroke: "black",
                        name: "rect",
                        strokeWidth: 20,
                        lineJoin: "round",
                    });
                    break;
                }
        }

        tr.nodes([newShape])
        layer.add(newShape);

    });
}

stage.on("mousedown touchstart", function() {
    isPaint = true;
    lastPointerPosition = stage.getPointerPosition();
});

stage.on("mouseup touchend", function() {
    isPaint = false;
});

stage.on("mousemove touchmove", function() {

    screenText.setText(`X: ` + stage.getPointerPosition().x + ` Y: ` + stage.getPointerPosition().y)
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

    let localPos = {
        x: lastPointerPosition.x - image.x(),
        y: lastPointerPosition.y - image.y(),
    };

    context.moveTo(localPos.x, localPos.y);

    let pos = stage.getPointerPosition();

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

select.addEventListener("change", function() {
    mode = select.value;
});



stage.on("click tap", function(e) {
    // if click on empty area - remove all selections
    if (e.target === stage) {
        return;
    }

    // do nothing if clicked NOT on our rectangles
    if (!e.target.hasName("rect")) {
        tr.nodes([]);
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

stage.add(transformLayer);