const programCounter = document.querySelector('#program-counter .register-value');
const instructionRegister = document.querySelector('#instruction-register .register-value');
const accumulator = document.querySelector('#accumulator .register-value');
const stages = document.querySelectorAll('.stage');
const ramCells = document.querySelectorAll('#ram table tr:not(:first-child)');
const explanation = document.getElementById('explanation');
const nextBtn = document.getElementById('next-btn');
const resetBtn = document.getElementById('reset-btn');
const simulationContainer = document.getElementById('simulation-container');
const progressBar = document.getElementById('progress');
const svgContainer = document.getElementById('svg-container');
const arrow = document.getElementById('arrow');

const fetchSound = document.getElementById('fetch-sound');
const decodeSound = document.getElementById('decode-sound');
const executeSound = document.getElementById('execute-sound');

let currentStage = 0;
let currentAddress = 0;

function updateActiveStage() {
    stages.forEach((stage, index) => {
        stage.classList.toggle('active', index === currentStage);
    });
    progressBar.style.width = `${((currentStage + 1) / 3) * 100}%`;
}

function createCurvedArrow(from, to, color = '#3498db') {
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const containerRect = simulationContainer.getBoundingClientRect();

    const startX = fromRect.left + fromRect.width / 2 - containerRect.left;
    const startY = fromRect.top + fromRect.height / 2 - containerRect.top;
    const endX = toRect.left + toRect.width / 2 - containerRect.left;
    const endY = toRect.top + toRect.height / 2 - containerRect.top;

    const midX = (startX + endX) / 2;
    const midY = startY - 50; // Adjust this value to control the curvature

    const path = `M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`;

    arrow.setAttribute('d', path);
    arrow.style.stroke = color;

    gsap.from(arrow, {
        strokeDasharray: arrow.getTotalLength(),
        strokeDashoffset: arrow.getTotalLength(),
        duration: 0.5,
        ease: "power2.out"
    });

    setTimeout(() => {
        arrow.setAttribute('d', '');
    }, 1000);
}

function highlightElement(element) {
    element.classList.add('highlight');
    setTimeout(() => {
        element.classList.remove('highlight');
    }, 1000);
}

function fetchInstruction() {
    fetchSound.play();
    const instruction = ramCells[currentAddress].querySelector('input').value;
    instructionRegister.textContent = instruction;
    programCounter.textContent = currentAddress;

    highlightElement(ramCells[currentAddress]);
    createCurvedArrow(ramCells[currentAddress], instructionRegister.parentElement, '#e74c3c');

    explanation.textContent = `Fetch: CPU retrieves the instruction at address ${currentAddress}: "${instruction}"`;
}

function decodeInstruction() {
    decodeSound.play();
    const instruction = instructionRegister.textContent;
    highlightElement(instructionRegister.parentElement);
    explanation.textContent = `Decode: CPU interprets the instruction: "${instruction}"`;
}

function executeInstruction() {
    executeSound.play();
    const [operation, value] = instructionRegister.textContent.split(' ');
    const targetCell = ramCells[parseInt(value)].querySelector('input');

    switch (operation) {
        case 'LOAD':
            accumulator.textContent = targetCell.value;
            createCurvedArrow(targetCell, accumulator.parentElement, '#2ecc71');
            explanation.textContent = `Execute: Load value ${targetCell.value} from address ${value} into the accumulator`;
            break;
        case 'ADD':
            accumulator.textContent = parseInt(accumulator.textContent) + parseInt(targetCell.value);
            createCurvedArrow(targetCell, accumulator.parentElement, '#f39c12');
            explanation.textContent = `Execute: Add ${targetCell.value} from address ${value} to the accumulator`;
            break;
        case 'STORE':
            targetCell.value = accumulator.textContent;
            createCurvedArrow(accumulator.parentElement, targetCell, '#3498db');
            explanation.textContent = `Execute: Store accumulator value ${accumulator.textContent} to address ${value}`;
            break;
        case 'JUMP':
            currentAddress = parseInt(value) - 1; // -1 because we increment later
            createCurvedArrow(instructionRegister.parentElement, programCounter.parentElement, '#9b59b6');
            explanation.textContent = `Execute: Jump to address ${value}`;
            break;
    }
    highlightElement(accumulator.parentElement);
}

function nextStep() {
    switch (currentStage) {
        case 0:
            fetchInstruction();
            break;
        case 1:
            decodeInstruction();
            break;
        case 2:
            executeInstruction();
            currentAddress++;
            if (currentAddress >= ramCells.length) currentAddress = 0;
            break;
    }
    currentStage = (currentStage + 1) % 3;
    updateActiveStage();
}

function reset() {
    currentStage = 0;
    currentAddress = 0;
    programCounter.textContent = '0';
    instructionRegister.textContent = '';
    accumulator.textContent = '0';
    ramCells.forEach((row, index) => {
        if (index > 5) row.querySelector('input').value = '1';
    });
    explanation.textContent = 'Simulation reset. Click "Next Step" to begin.';
    updateActiveStage();
    arrow.setAttribute('d', '');
}

nextBtn.addEventListener('click', nextStep);
resetBtn.addEventListener('click', reset);


tippy('#program-counter', { content: 'Stores the address of the next instruction to be executed' });
tippy('#instruction-register', { content: 'Holds the current instruction being processed' });
tippy('#accumulator', { content: 'Temporary storage for arithmetic and logical operations' });
tippy('.stage', { content: 'Current stage of the fetch-execute cycle' });

ramCells.forEach((cell, index) => {
    tippy(cell, { content: `RAM address ${index}` });
});

reset(); 