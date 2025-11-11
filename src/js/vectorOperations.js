class VectorCalculator {
    constructor() {
        this.vectors = {
            A: { x: 3, y: 4, z: 2 },
            B: { x: 1, y: -2, z: 5 }
        };
        console.log("🔄 Calculadora de vectores inicializada");
    }

    // Obtener valores actuales de los inputs
    getVectorValues() {
        try {
            const vectorAx = document.getElementById('vectorAx');
            const vectorAy = document.getElementById('vectorAy');
            const vectorAz = document.getElementById('vectorAz');
            const vectorBx = document.getElementById('vectorBx');
            const vectorBy = document.getElementById('vectorBy');
            const vectorBz = document.getElementById('vectorBz');

            if (vectorAx && vectorAy && vectorAz && vectorBx && vectorBy && vectorBz) {
                this.vectors.A = {
                    x: parseFloat(vectorAx.value) || 0,
                    y: parseFloat(vectorAy.value) || 0,
                    z: parseFloat(vectorAz.value) || 0
                };
                
                this.vectors.B = {
                    x: parseFloat(vectorBx.value) || 0,
                    y: parseFloat(vectorBy.value) || 0,
                    z: parseFloat(vectorBz.value) || 0
                };
                console.log("📊 Vectores actualizados:", this.vectors);
                return true;
            } else {
                console.error("❌ No se encontraron todos los inputs de vectores");
                return false;
            }
        } catch (error) {
            console.error("❌ Error obteniendo valores de vectores:", error);
            return false;
        }
    }

    // OPERACIONES VECTORIALES
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

    angleBetweenVectors(v1, v2) {
        const dot = this.dotProduct(v1, v2);
        const mag1 = this.magnitude(v1);
        const mag2 = this.magnitude(v2);
        
        if (mag1 === 0 || mag2 === 0) return 0;
        
        const cosTheta = dot / (mag1 * mag2);
        // Asegurar que esté en el rango [-1, 1] para Math.acos
        const clampedCos = Math.max(-1, Math.min(1, cosTheta));
        return (Math.acos(clampedCos) * 180) / Math.PI;
    }

    // Realizar operación
    performOperation(operation) {
        try {
            if (!this.getVectorValues()) {
                this.displayResult("Error", "No se pudieron obtener los valores de los vectores");
                return null;
            }
            
            const vA = this.vectors.A;
            const vB = this.vectors.B;
            let result;
            let operationName = '';

            console.log(`🎯 Ejecutando operación: ${operation}`, vA, vB);

            switch(operation) {
                case 'add':
                    result = this.addVectors(vA, vB);
                    operationName = 'Suma A + B';
                    break;
                case 'subtract':
                    result = this.subtractVectors(vA, vB);
                    operationName = 'Resta A - B';
                    break;
                case 'dot':
                    result = this.dotProduct(vA, vB);
                    operationName = 'Producto Punto A · B';
                    break;
                case 'cross':
                    result = this.crossProduct(vA, vB);
                    operationName = 'Producto Cruz A × B';
                    break;
                case 'magnitudeA':
                    result = this.magnitude(vA);
                    operationName = 'Magnitud |A|';
                    break;
                case 'magnitudeB':
                    result = this.magnitude(vB);
                    operationName = 'Magnitud |B|';
                    break;
                case 'normalizeA':
                    result = this.normalize(vA);
                    operationName = 'Vector A Normalizado';
                    break;
                case 'normalizeB':
                    result = this.normalize(vB);
                    operationName = 'Vector B Normalizado';
                    break;
                case 'angle':
                    result = this.angleBetweenVectors(vA, vB);
                    operationName = 'Ángulo entre A y B';
                    break;
                default:
                    throw new Error(`Operación desconocida: ${operation}`);
            }

            this.displayResult(operationName, result, vA, vB);
            return result;

        } catch (error) {
            console.error("❌ Error en operación vectorial:", error);
            this.displayResult("Error", `Error: ${error.message}`);
            return null;
        }
    }

    // Mostrar resultado
    displayResult(operationName, result, vA = null, vB = null) {
        try {
            const resultsDiv = document.getElementById('vector-results');
            if (!resultsDiv) {
                console.error("❌ No se encontró el div de resultados de vectores");
                return;
            }

            let resultText = `🎯 ${operationName}\n\n`;
            
            if (vA && vB) {
                resultText += `📊 Vector A: (${vA.x}, ${vA.y}, ${vA.z})\n`;
                resultText += `📊 Vector B: (${vB.x}, ${vB.y}, ${vB.z})\n\n`;
            }

            if (typeof result === 'object') {
                // Es un vector
                resultText += `✨ Vector Resultante:\n`;
                resultText += `   X: ${result.x.toFixed(4)}\n`;
                resultText += `   Y: ${result.y.toFixed(4)}\n`;
                resultText += `   Z: ${result.z.toFixed(4)}\n\n`;
                resultText += `📏 Magnitud: ${this.magnitude(result).toFixed(4)}`;
            } else {
                // Es un escalar
                resultText += `✨ Resultado: ${result.toFixed(6)}`;
                
                if (operationName.includes('Ángulo')) {
                    resultText += '°';
                }
            }

            resultsDiv.innerHTML = `<pre class="result-vector">${resultText}</pre>`;
            console.log("✅ Resultado mostrado:", resultText);

            // Disparar evento para actualizar gráficos
            this.dispatchVectorUpdate(result);

        } catch (error) {
            console.error("❌ Error mostrando resultado:", error);
        }
    }

    dispatchVectorUpdate(result) {
        // Crear evento personalizado para notificar a los gráficos
        const vectorUpdateEvent = new CustomEvent('vectorUpdate', {
            detail: {
                vectors: this.vectors,
                result: result,
                operation: 'update'
            }
        });
        document.dispatchEvent(vectorUpdateEvent);
    }

    // Obtener vectores para gráficos
    getVectorsForGraphics() {
        return {
            ...this.vectors,
            hasResult: false
        };
    }
}