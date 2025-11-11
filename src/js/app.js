class VMatrixApp {
    constructor() {
        this.matrixCalculator = new MatrixCalculator();
        this.vectorCalculator = new VectorCalculator(); 
        this.graphics3D = null; //se inicializa después
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupMatrixEvents();
        this.setupVectorEvents();
        this.createMatrixInputs('2x2');

        // Inicializar gráficos 3D después de que el DOM esté listo
        setTimeout(() => {
            this.graphics3D = new Graphics3D();
        }, 100);

        console.log("✅ V-MatriX inicializado correctamente");
    }
    setupVectorEvents() {
        console.log("🔄 Configurando eventos de vectores...");

        // Botones de operaciones vectoriales
        const vectorButtons = {
            'btnVectorAdd': 'add',
            'btnVectorSub': 'subtract',
            'btnVectorDot': 'dot',
            'btnVectorCross': 'cross',
            'btnVectorMagA': 'magnitudeA',
            'btnVectorMagB': 'magnitudeB',
            'btnVectorNormA': 'normalizeA',
            'btnVectorNormB': 'normalizeB',
            'btnVectorAngle': 'angle'
        };

        Object.entries(vectorButtons).forEach(([buttonId, operation]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    console.log(`🎯 Botón ${buttonId} clickeado, operación: ${operation}`);
                    this.vectorOperation(operation);
                });
                console.log(`✅ Evento configurado para: ${buttonId}`);
            } else {
                console.warn(`⚠️ Botón no encontrado: ${buttonId}`);
            }
        });

        console.log("✅ Eventos de vectores configurados");
    }

    vectorOperation(operation) {
        console.log(`🚀 Ejecutando operación vectorial: ${operation}`);
        const result = this.vectorCalculator.performOperation(operation);

        // Actualizar gráficos si el resultado es un vector
        if (result && typeof result === 'object' && this.graphics3D) {
            const vectors = this.vectorCalculator.getVectorsForGraphics();
            vectors.result = result;
            this.graphics3D.renderVectors(vectors);
        }
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
        if (!container) {
            console.error(`No se encontró el contenedor para matriz ${matrixId}`);
            return;
        }

        container.className = `matrix-grid ${gridSize}`;
        container.innerHTML = '';

        // Definir placeholders basados en el ID de la matriz
        const placeholders = this.getMatrixPlaceholders(matrixId, size);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const input = document.createElement('input');
                input.type = 'number';

                // Asignar placeholder descriptivo
                const placeholderIndex = i * size + j;
                input.placeholder = placeholders[placeholderIndex];

                input.dataset.row = i;
                input.dataset.col = j;
                input.addEventListener('input', (e) => this.updateMatrixValue(matrixId, e));
                container.appendChild(input);
            }
        }
    }

    // Nueva función para generar placeholders descriptivos
    getMatrixPlaceholders(matrixId, size) {
        const placeholders = [];
        const prefix = matrixId === 'A' ? 'a' : 'b';

        if (size === 2) {
            // Para matriz 2x2
            if (matrixId === 'A') {
                return ['a₁₁', 'a₁₂', 'a₂₁', 'a₂₂'];
            } else {
                return ['b₁₁', 'b₁₂', 'b₂₁', 'b₂₂'];
            }
        } else if (size === 3) {
            // Para matriz 3x3
            if (matrixId === 'A') {
                return ['a₁₁', 'a₁₂', 'a₁₃', 'a₂₁', 'a₂₂', 'a₂₃', 'a₃₁', 'a₃₂', 'a₃₃'];
            } else {
                return ['b₁₁', 'b₁₂', 'b₁₃', 'b₂₁', 'b₂₂', 'b₂₃', 'b₃₁', 'b₃₂', 'b₃₃'];
            }
        }

        // Fallback para otros tamaños
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                placeholders.push(`${prefix}${i + 1}${j + 1}`);
            }
        }

        return placeholders;
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
