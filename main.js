import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

document.addEventListener('DOMContentLoaded', () => {
    // Create a Three.js scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Position the camera
    camera.position.set(15, 10, 10);
    camera.lookAt(0, 0, 0);

    // Function to create a grid of cubes based on a 2D array
    function createCubesGrid(gridArray, yOffset) {
        const gridSizeX = gridArray[0].length;
        const gridSizeZ = gridArray.length;
        const cubeSize = 1;
        const spacing = 1.0;

        for (let z = 0; z < gridSizeZ; z++) {
            for (let x = 0; x < gridSizeX; x++) {
                if (gridArray[z][x] === 1) {
                    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
                    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Phong material for lighting

                    const cube = new THREE.Mesh(geometry, material);

                    const xPos = x * spacing - (gridSizeX * spacing) / 2;
                    const zPos = z * spacing - (gridSizeZ * spacing) / 2;

                    cube.position.set(xPos, yOffset, zPos);
                    scene.add(cube);
                }
            }
        }
    }

    function moveCameraToYPosition(yPosition) {
        const cameraTarget = { y: camera.position.y };
        const cameraTween = new TWEEN.Tween(cameraTarget)
            .to({ y: yPosition }, 1000) // Adjust the duration as needed (in milliseconds)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                camera.position.y = cameraTarget.y;
            })
            .start();
    }
    function getNextState(grid) {
        let rows = grid.length;
        let cols = grid[0].length;
        let nextState = grid.map(arr => [...arr]); // Create a copy of the grid

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let liveNeighbors = 0;

                // Check all eight neighbors
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue; // Skip the current cell
                        let x = row + i;
                        let y = col + j;
                        if (x >= 0 && x < rows && y >= 0 && y < cols) {
                            liveNeighbors += grid[x][y];
                        }
                    }
                }

                // Apply the rules of the Game of Life
                if (grid[row][col] === 1 && (liveNeighbors < 2 || liveNeighbors > 3)) {
                    nextState[row][col] = 0;
                } else if (grid[row][col] === 0 && liveNeighbors === 3) {
                    nextState[row][col] = 1;
                }
            }
        }

        return nextState;
    }

    function addZerosToGrid(gridArray, n=10) {
        // Create an array of 5 zeros
        const zeros = new Array(n).fill(0);
    
        // Add zeros to the start and end of each sub-array
        const modifiedSubArrays = gridArray.map(subArray => [...zeros, ...subArray, ...zeros]);
    
        // Create arrays of zeros to add to the start and end of the grid
        const zeroRows = new Array(modifiedSubArrays[0].length).fill(0);
    
        // Add the zero arrays to the start and end of the grid
        return [zeroRows, zeroRows, zeroRows, zeroRows, zeroRows, ...modifiedSubArrays, zeroRows, zeroRows, zeroRows, zeroRows, zeroRows];
    }

    // Add a directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 4, 3);
    scene.add(directionalLight);

    // Add an ambient light
    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // Example 2D array with 1s and 0s (modify this as needed)
    let gridArray = [
        [1, 1, 1, 0],
        [1, 0, 0, 0],
        [0, 1, 0, 0],
    ];
    gridArray = addZerosToGrid(gridArray, 100);

    // Initialize the index for createCubesGrid
    let gridIndex = 0;
    let yesterday;
    let daybeforeyesterday;

    // Create the first grid of cubes
    createCubesGrid(gridArray, gridIndex);

    // Use setInterval to create new grids every second
    let interval = setInterval(() => {
        gridIndex++;
        if(yesterday != null){
            daybeforeyesterday = JSON.parse(JSON.stringify(yesterday));
        }
        yesterday = JSON.parse(JSON.stringify(gridArray));
        gridArray = getNextState(gridArray);
        createCubesGrid(gridArray, gridIndex);
        moveCameraToYPosition(gridIndex + 10);
        if(JSON.stringify(yesterday) == JSON.stringify(gridArray) || JSON.stringify(daybeforeyesterday) == JSON.stringify(gridArray)){
            console.log("LOOP");
            clearInterval(interval);
        }
    }, 100); // 1000 milliseconds (1 second)

    // Call the function to create cubes based on the gridArray
    // createCubesGrid(gridArray, 0);
    const controls = new OrbitControls(camera, renderer.domElement);

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);
        TWEEN.update();
        renderer.render(scene, camera);
    };

    animate();
});
