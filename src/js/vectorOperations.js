class VectorCalculator {
    constructor() {
        this.vectors = {
            A: { x: 0, y: 0, z: 0 },
            B: { x: 0, y: 0, z: 0 }
        };
        console.log("🔄 Calculadora de vectores inicializada");
    }

    // === SISTEMA DE HISTORIAL INTEGRADO ===

    // Función para registrar operaciones en el historial
    registerVectorOperation(operation, vectorA, vectorB, result, duration = 0) {
        const operationEvent = new CustomEvent('operationPerformed', {
            detail: {
                type: 'vector',
                operation: operation,
                inputA: vectorA,
                inputB: vectorB,
                result: result,
                duration: duration
            }
        });
        document.dispatchEvent(operationEvent);
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

    // OPERACIONES VECTORIALES CON HISTORIAL

    addVectors(v1, v2) {
        const startTime = performance.now();
        const result = {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        };

        this.registerVectorOperation('sum', v1, v2, result, performance.now() - startTime);
        return result;
    }

    subtractVectors(v1, v2) {
        const startTime = performance.now();
        const result = {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        };

        this.registerVectorOperation('subtract', v1, v2, result, performance.now() - startTime);
        return result;
    }

    dotProduct(v1, v2) {
        const startTime = performance.now();
        const result = (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);

        // Para mostrar en gráfica, creamos un vector pequeño en la dirección del resultado
        const graphicResult = {
            x: result * 0.1, // Escalar para visualización
            y: 0,
            z: 0,
            isScalar: true,
            scalarValue: result
        };

        this.registerVectorOperation('dot', v1, v2, result, performance.now() - startTime);
        return graphicResult; // Devolvemos el objeto especial para gráfica
    }

    crossProduct(v1, v2) {
        const startTime = performance.now();
        const result = {
            x: (v1.y * v2.z) - (v1.z * v2.y),
            y: (v1.z * v2.x) - (v1.x * v2.z),
            z: (v1.x * v2.y) - (v1.y * v2.x)
        };

        this.registerVectorOperation('cross', v1, v2, result, performance.now() - startTime);
        return result;
    }

    magnitude(vector) {
        const startTime = performance.now();
        const result = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);

        // Para mostrar en gráfica, creamos un vector que represente la magnitud
        const graphicResult = {
            x: result * 0.1, // Escalar para visualización
            y: 0,
            z: 0,
            isScalar: true,
            scalarValue: result
        };

        this.registerVectorOperation('magnitude', vector, null, result, performance.now() - startTime);
        return graphicResult;
    }

    normalize(vector) {
        const startTime = performance.now();
        const mag = this.magnitude(vector);
        let result;

        if (mag.scalarValue === 0) {
            result = { x: 0, y: 0, z: 0 };
        } else {
            result = {
                x: vector.x / mag.scalarValue,
                y: vector.y / mag.scalarValue,
                z: vector.z / mag.scalarValue
            };
        }

        this.registerVectorOperation('normalize', vector, null, result, performance.now() - startTime);
        return result;
    }

    angleBetweenVectors(v1, v2) {
        const startTime = performance.now();
        const dot = this.dotProduct(v1, v2);
        const mag1 = this.magnitude(v1);
        const mag2 = this.magnitude(v2);

        let result;
        if (mag1.scalarValue === 0 || mag2.scalarValue === 0) {
            result = 0;
        } else {
            const cosTheta = dot.scalarValue / (mag1.scalarValue * mag2.scalarValue);
            const clampedCos = Math.max(-1, Math.min(1, cosTheta));
            result = (Math.acos(clampedCos) * 180) / Math.PI;
        }

        // Para mostrar en gráfica, creamos un vector especial
        const graphicResult = {
            x: result * 0.01, // Escalar para visualización
            y: 0,
            z: 0,
            isScalar: true,
            scalarValue: result,
            isAngle: true
        };

        this.registerVectorOperation('angle', v1, v2, result, performance.now() - startTime);
        return graphicResult;
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

            switch (operation) {
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

    // Mostrar resultado - MEJORADO PARA MANEJAR VALORES ESCALARES
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
            } else if (vA) {
                resultText += `📊 Vector A: (${vA.x}, ${vA.y}, ${vA.z})\n\n`;
            }

            // Manejar diferentes tipos de resultados
            if (result && result.isScalar) {
                // Es un valor escalar (producto punto, magnitud, ángulo)
                if (result.isAngle) {
                    resultText += `✨ Resultado: ${result.scalarValue.toFixed(4)}°`;
                } else {
                    resultText += `✨ Resultado: ${result.scalarValue.toFixed(6)}`;

                    // Información adicional para magnitudes
                    if (operationName.includes('Magnitud')) {
                        resultText += `\n📏 (Valor absoluto)`;
                    }
                }
            } else if (typeof result === 'object') {
                // Es un vector
                resultText += `✨ Vector Resultante:\n`;
                resultText += `   X: ${result.x.toFixed(4)}\n`;
                resultText += `   Y: ${result.y.toFixed(4)}\n`;
                resultText += `   Z: ${result.z.toFixed(4)}\n\n`;

                // Calcular magnitud del vector resultante
                const magnitude = Math.sqrt(result.x ** 2 + result.y ** 2 + result.z ** 2);
                resultText += `📏 Magnitud: ${magnitude.toFixed(4)}`;
            } else {
                // Es un escalar simple
                resultText += `✨ Resultado: ${result.toFixed(6)}`;
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