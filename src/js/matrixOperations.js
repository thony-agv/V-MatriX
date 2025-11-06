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

    // OPERACIONES MATRICIALES
    addMatrices(matrixA, matrixB) {
        const size = matrixA.length;
        const result = this.createEmptyMatrix(size);
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                result[i][j] = matrixA[i][j] + matrixB[i][j];
            }
        }
        return result;
    }

    subtractMatrices(matrixA, matrixB) {
        const size = matrixA.length;
        const result = this.createEmptyMatrix(size);
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                result[i][j] = matrixA[i][j] - matrixB[i][j];
            }
        }
        return result;
    }

    multiplyMatrices(matrixA, matrixB) {
        const size = matrixA.length;
        const result = this.createEmptyMatrix(size);
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                for (let k = 0; k < size; k++) {
                    result[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }
        return result;
    }

    determinant2x2(matrix) {
        return (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0]);
    }

    determinant3x3(matrix) {
        const [a, b, c] = matrix[0];
        const [d, e, f] = matrix[1];
        const [g, h, i] = matrix[2];
        
        return a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
    }

    getDeterminant(matrix) {
        if (matrix.length === 2) {
            return this.determinant2x2(matrix);
        } else if (matrix.length === 3) {
            return this.determinant3x3(matrix);
        }
        return 0;
    }

    matrixToString(matrix) {
        return matrix.map(row => 
            `[${row.map(val => val.toString().padStart(3)).join(' ')}]`
        ).join('\n');
    }
}