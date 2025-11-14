class MatrixCalculator {
    constructor() {
        this.matrixSize = '2x2';
        this.matrixA = [];
        this.matrixB = [];
        this.currentMatrix = 'A';
    }

    setMatrixSize(size) {
        this.matrixSize = size;
        this.createMatrixInputs();
    }

    createMatrixInputs() {
        const size = parseInt(this.matrixSize[0]);
        this.matrixA = this.createEmptyMatrix(size);
        this.matrixB = this.createEmptyMatrix(size);
        this.renderMatrixInputs();
    }

    createEmptyMatrix(size) {
        return Array(size).fill().map(() => Array(size).fill(0));
    }

    renderMatrixInputs() {
        // Esto se implementará en app.js
        console.log('Renderizando matrices:', this.matrixSize);
    }

    // === SISTEMA DE HISTORIAL INTEGRADO ===

    // Función para registrar operaciones en el historial
    registerMatrixOperation(operation, matrixA, matrixB, result, duration = 0) {
        const operationEvent = new CustomEvent('operationPerformed', {
            detail: {
                type: 'matrix',
                operation: operation,
                inputA: matrixA,
                inputB: matrixB,
                result: result,
                duration: duration
            }
        });
        document.dispatchEvent(operationEvent);
    }

    // OPERACIONES MATRICIALES CON HISTORIAL

    addMatrices(matrixA, matrixB) {
        const startTime = performance.now(); // Iniciar temporizador
        const size = matrixA.length;
        const result = this.createEmptyMatrix(size);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                result[i][j] = matrixA[i][j] + matrixB[i][j];
            }
        }

        // Registrar en historial
        this.registerMatrixOperation('sum', matrixA, matrixB, result, performance.now() - startTime);
        return result;
    }

    subtractMatrices(matrixA, matrixB) {
        const startTime = performance.now(); // Iniciar temporizador
        const size = matrixA.length;
        const result = this.createEmptyMatrix(size);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                result[i][j] = matrixA[i][j] - matrixB[i][j];
            }
        }

        // Registrar en historial
        this.registerMatrixOperation('subtract', matrixA, matrixB, result, performance.now() - startTime);
        return result;
    }

    multiplyMatrices(matrixA, matrixB) {
        const startTime = performance.now(); // Iniciar temporizador
        const size = matrixA.length;
        const result = this.createEmptyMatrix(size);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                for (let k = 0; k < size; k++) {
                    result[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }

        // Registrar en historial
        this.registerMatrixOperation('multiply', matrixA, matrixB, result, performance.now() - startTime);
        return result;
    }

    determinant2x2(matrix) {
        return (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0]);
    }

    determinant3x3(matrix) {
        const [a, b, c] = matrix[0];
        const [d, e, f] = matrix[1];
        const [g, h, i] = matrix[2];

        return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    }

    getDeterminant(matrix) {
        const startTime = performance.now(); // Iniciar temporizador
        let result;

        if (matrix.length === 2) {
            result = this.determinant2x2(matrix);
        } else if (matrix.length === 3) {
            result = this.determinant3x3(matrix);
        } else {
            result = 0;
        }

        // Registrar en historial (solo una matriz de entrada)
        this.registerMatrixOperation('determinant', matrix, null, result, performance.now() - startTime);
        return result;
    }

    matrixToString(matrix) {
        return matrix.map(row =>
            `[${row.map(val => val.toString().padStart(3)).join(' ')}]`
        ).join('\n');
    }
}