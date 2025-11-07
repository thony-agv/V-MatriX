class VMatrixApp {
    constructor() {
        this.matrixCalculator = new MatrixCalculator();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMatrixEvents();
        this.createMatrixInputs('2x2');
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                navButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

                button.classList.add('active');
                const tabId = button.getAttribute('data-tab') + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    setupMatrixEvents() {
        // Selector de tamaño
        document.getElementById('matrixSize').addEventListener('change', (e) => {
            this.createMatrixInputs(e.target.value);
        });

        // Botones de operaciones
        document.getElementById('btnMatrixAdd').addEventListener('click', () => this.matrixOperation('add'));
        document.getElementById('btnMatrixSub').addEventListener('click', () => this.matrixOperation('subtract'));
        document.getElementById('btnMatrixMul').addEventListener('click', () => this.matrixOperation('multiply'));
        document.getElementById('btnDetA').addEventListener('click', () => this.calculateDeterminant('A'));
        document.getElementById('btnDetB').addEventListener('click', () => this.calculateDeterminant('B'));
    }

    createMatrixInputs(size) {
        this.matrixCalculator.setMatrixSize(size);
        const gridSize = size === '2x2' ? 'matrix-grid-2x2' : 'matrix-grid-3x3';
        const matrixSize = parseInt(size[0]);

        const matricesContainer = document.querySelector('.matrices-container');
        if (size === '3x3') {
            matricesContainer.classList.add('matrices-3x3');
        } else {
            matricesContainer.classList.remove('matrices-3x3');
        }

        this.renderMatrix('A', matrixSize, gridSize);
        this.renderMatrix('B', matrixSize, gridSize);
    }

    renderMatrix(matrixId, size, gridSize) {
        const container = document.getElementById(`matrix${matrixId}-inputs`);
        container.className = `matrix-grid ${gridSize}`;
        container.innerHTML = '';

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.placeholder = '0';
                input.dataset.row = i;
                input.dataset.col = j;

                // AGREGAR CLASE PARA ESTILOS CYBERPUNK
                input.className = 'matrix-cell-input';

                // Placeholder más atractivo
                const placeholders = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
                input.placeholder = placeholders[(i * size + j) % 10];

                input.addEventListener('input', (e) => this.updateMatrixValue(matrixId, e));

                // Efectos adicionales
                input.addEventListener('focus', (e) => {
                    e.target.style.transform = 'scale(1.05)';
                });

                input.addEventListener('blur', (e) => {
                    e.target.style.transform = 'scale(1)';
                });

                container.appendChild(input);
            }
        }
    }

    updateMatrixValue(matrixId, event) {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const value = parseFloat(event.target.value) || 0;

        if (matrixId === 'A') {
            this.matrixCalculator.matrixA[row][col] = value;
        } else {
            this.matrixCalculator.matrixB[row][col] = value;
        }
    }

    matrixOperation(operation) {
        let result;
        const matrixA = this.matrixCalculator.matrixA;
        const matrixB = this.matrixCalculator.matrixB;

        switch (operation) {
            case 'add':
                result = this.matrixCalculator.addMatrices(matrixA, matrixB);
                break;
            case 'subtract':
                result = this.matrixCalculator.subtractMatrices(matrixA, matrixB);
                break;
            case 'multiply':
                result = this.matrixCalculator.multiplyMatrices(matrixA, matrixB);
                break;
        }

        this.displayMatrixResult(`Resultado (${operation}):\n${this.matrixCalculator.matrixToString(result)}`);
    }

    calculateDeterminant(matrixId) {
        const matrix = matrixId === 'A' ? this.matrixCalculator.matrixA : this.matrixCalculator.matrixB;
        const det = this.matrixCalculator.getDeterminant(matrix);
        this.displayMatrixResult(`Determinante de Matriz ${matrixId}: ${det}`);
    }

    displayMatrixResult(message) {
        document.getElementById('matrix-results').innerHTML = `<pre>${message}</pre>`;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new VMatrixApp();
});