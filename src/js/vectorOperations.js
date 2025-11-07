class VectorCalculator {
    constructor() {
        this.vectors = {
            A: { x: 0, y: 0, z: 0 },
            B: { x: 0, y: 0, z: 0 }
        };
        this.graphicsRenderer = new Graphics3D();
    }

    // Operaciones vectoriales básicas
    addVectors(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        };
    }

    subtractVectors(v1, v2) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        };
    }

    dotProduct(v1, v2) {
        return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);
    }

    crossProduct(v1, v2) {
        return {
            x: (v1.y * v2.z) - (v1.z * v2.y),
            y: (v1.z * v2.x) - (v1.x * v2.z),
            z: (v1.x * v2.y) - (v1.y * v2.x)
        };
    }

    magnitude(vector) {
        return Math.sqrt(vector.x**2 + vector.y**2 + vector.z**2);
    }

    normalize(vector) {
        const mag = this.magnitude(vector);
        if (mag === 0) return { x: 0, y: 0, z: 0 };
        
        return {
            x: vector.x / mag,
            y: vector.y / mag,
            z: vector.z / mag
        };
    }

    // Actualizar vector
    updateVector(vectorId, x, y, z) {
        this.vectors[vectorId] = { x, y, z };
        this.graphicsRenderer.renderVectors(this.vectors);
    }

    // Realizar operación y mostrar resultado
    performOperation(operation) {
        const vA = this.vectors.A;
        const vB = this.vectors.B;
        let result;

        switch(operation) {
            case 'add':
                result = this.addVectors(vA, vB);
                break;
            case 'subtract':
                result = this.subtractVectors(vA, vB);
                break;
            case 'dot':
                result = this.dotProduct(vA, vB);
                break;
            case 'cross':
                result = this.crossProduct(vA, vB);
                break;
            case 'magnitudeA':
                result = this.magnitude(vA);
                break;
            case 'magnitudeB':
                result = this.magnitude(vB);
                break;
            case 'normalizeA':
                result = this.normalize(vA);
                break;
            case 'normalizeB':
                result = this.normalize(vB);
                break;
        }

        return result;
    }
}