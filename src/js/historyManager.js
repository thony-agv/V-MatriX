// js/historyManager.js
class HistoryManager {
    constructor() {
        this.history = this.loadHistory();
        this.currentFilter = 'all';
        this.currentOperationFilter = 'all';
        this.searchTerm = '';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHistory();
        this.updateStats();
    }

    setupEventListeners() {
        // Filtros
        document.getElementById('filterType')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderHistory();
        });

        document.getElementById('filterOperation')?.addEventListener('change', (e) => {
            this.currentOperationFilter = e.target.value;
            this.renderHistory();
        });

        document.getElementById('searchHistory')?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.renderHistory();
        });

        // Acciones
        document.getElementById('clearHistory')?.addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('exportHistory')?.addEventListener('click', () => {
            this.exportToCSV();
        });

        document.getElementById('importHistory')?.addEventListener('click', () => {
            document.getElementById('historyFileInput').click();
        });

        document.getElementById('historyFileInput')?.addEventListener('change', (e) => {
            this.importFromCSV(e.target.files[0]);
        });

        // Evento global para agregar operaciones desde otras partes
        document.addEventListener('operationPerformed', (e) => {
            this.addOperation(e.detail);
        });
    }

    addOperation(operationData) {
        const operation = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            type: operationData.type, // 'vector' o 'matrix'
            operation: operationData.operation, // 'sum', 'multiply', etc.
            inputA: operationData.inputA,
            inputB: operationData.inputB,
            result: operationData.result,
            duration: operationData.duration || 0
        };

        this.history.unshift(operation); // Agregar al inicio
        this.saveHistory();
        this.renderHistory();
        this.updateStats();

        console.log('📝 Operación agregada al historial:', operation);
    }

    getFilteredHistory() {
        return this.history.filter(item => {
            // Filtro por tipo
            if (this.currentFilter !== 'all' && item.type !== this.currentFilter) {
                return false;
            }

            // Filtro por operación
            if (this.currentOperationFilter !== 'all' && item.operation !== this.currentOperationFilter) {
                return false;
            }

            // Filtro de búsqueda - MEJORADO
            if (this.searchTerm) {
                const operationName = this.getOperationName(item.operation).toLowerCase();
                const typeName = item.type.toLowerCase();
                const inputA = this.formatInput(item.inputA).toLowerCase();
                const inputB = item.inputB ? this.formatInput(item.inputB).toLowerCase() : '';
                const result = this.formatResult(item.result, item.operation).toLowerCase();

                const searchText = `${operationName} ${typeName} ${inputA} ${inputB} ${result}`;

                if (!searchText.includes(this.searchTerm)) {
                    return false;
                }
            }

            return true;
        });
    }

    renderHistory() {
        const container = document.getElementById('historyItems');
        if (!container) return;

        const filteredHistory = this.getFilteredHistory();

        if (filteredHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-history">
                    <div class="empty-icon">🔍</div>
                    <h4>No se encontraron operaciones</h4>
                    <p>Intenta con otros filtros o términos de búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredHistory.map(item => this.renderHistoryItem(item)).join('');
    }

    renderHistoryItem(item) {
        const date = new Date(item.timestamp);
        const timeString = date.toLocaleTimeString();
        const dateString = date.toLocaleDateString();

        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-header">
                    <span class="operation-type ${item.type}">${this.getTypeIcon(item.type)} ${item.type.toUpperCase()}</span>
                    <span class="operation-name">${this.getOperationName(item.operation)}</span>
                    <span class="operation-time">${timeString} - ${dateString}</span>
                    <button class="delete-operation" onclick="historyManager.deleteOperation('${item.id}')">×</button>
                </div>
                
                <div class="history-item-content">
                    <div class="operation-inputs">
                        <div class="input-group">
                            <label>Entrada A:</label>
                            <div class="input-value">${this.formatInput(item.inputA)}</div>
                        </div>
                        ${item.inputB ? `
                        <div class="input-group">
                            <label>Entrada B:</label>
                            <div class="input-value">${this.formatInput(item.inputB)}</div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="operation-result">
                        <label>Resultado:</label>
                        <div class="result-value">${this.formatResult(item.result, item.operation)}</div>
                    </div>
                </div>

                <div class="history-item-actions">
                    <button class="action-btn" onclick="historyManager.reuseOperation('${item.id}')">
                        🔄 Reutilizar
                    </button>
                    <button class="action-btn" onclick="historyManager.copyResult('${item.id}')">
                        📋 Copiar
                    </button>
                    ${item.duration ? `
                    <span class="operation-duration">${item.duration}ms</span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getTypeIcon(type) {
        const icons = {
            vector: '➡️',
            matrix: '🔲'
        };
        return icons[type] || '📊';
    }

    getOperationName(operation) {
        const names = {
            // Operaciones de vectores
            sum: 'Suma',
            subtract: 'Resta',
            multiply: 'Multiplicación',
            cross: 'Producto Cruz',
            magnitude: 'Magnitud',
            normalize: 'Normalización',
            dot: 'Producto Punto',
            angle: 'Ángulo entre Vectores',

            // Operaciones de matrices
            determinant: 'Determinante',
            transpose: 'Transpuesta',
            inverse: 'Inversa'
        };
        return names[operation] || operation;
    }

    formatInput(input) {
        if (Array.isArray(input)) {
            if (Array.isArray(input[0])) {
                // Matriz
                return `[${input.map(row => `[${row.join(', ')}]`).join(', ')}]`;
            } else {
                // Vector
                return `[${input.join(', ')}]`;
            }
        } else if (typeof input === 'object' && input !== null) {
            // Vector como objeto {x, y, z}
            return `(${input.x}, ${input.y}, ${input.z})`;
        }
        return input;
    }

    formatResult(result, operation) {
        if (operation === 'magnitude') {
            return result.toFixed(4);
        } else if (operation === 'determinant') {
            return result.toFixed(4);
        } else if (operation === 'angle') {
            return `${result.toFixed(2)}°`;
        } else if (Array.isArray(result)) {
            if (Array.isArray(result[0])) {
                // Matriz resultante
                return `[${result.map(row => `[${row.join(', ')}]`).join(', ')}]`;
            } else {
                // Vector resultante
                return `[${result.join(', ')}]`;
            }
        } else if (typeof result === 'object' && result !== null) {
            // Vector como objeto {x, y, z}
            return `(${result.x.toFixed(4)}, ${result.y.toFixed(4)}, ${result.z.toFixed(4)})`;
        } else if (typeof result === 'number') {
            // Resultado escalar
            return result.toFixed(6);
        }
        return result;
    }

    deleteOperation(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.saveHistory();
        this.renderHistory();
        this.updateStats();
    }

    reuseOperation(id) {
        const operation = this.history.find(item => item.id == id);
        if (!operation) return;

        console.log('🔄 Reutilizando operación:', operation);

        // Reutilizar en vectores
        if (operation.type === 'vector') {
            if (operation.inputA && typeof operation.inputA === 'object') {
                document.getElementById('vectorAx').value = operation.inputA.x || 0;
                document.getElementById('vectorAy').value = operation.inputA.y || 0;
                document.getElementById('vectorAz').value = operation.inputA.z || 0;
            }
            if (operation.inputB && typeof operation.inputB === 'object') {
                document.getElementById('vectorBx').value = operation.inputB.x || 0;
                document.getElementById('vectorBy').value = operation.inputB.y || 0;
                document.getElementById('vectorBz').value = operation.inputB.z || 0;
            }

            // Cambiar a pestaña de vectores
            document.querySelector('[data-tab="vectors"]').click();

            this.showNotification('✅ Vectores cargados desde historial');
        }

        // Reutilizar en matrices
        if (operation.type === 'matrix') {
            // Aquí puedes agregar la lógica para cargar matrices
            this.showNotification('🔄 Funcionalidad de matrices en desarrollo');
        }

        // Disparar evento para actualizar gráficos
        if (operation.type === 'vector') {
            const vectorUpdateEvent = new CustomEvent('vectorUpdate', {
                detail: {
                    vectors: {
                        A: operation.inputA,
                        B: operation.inputB
                    },
                    result: operation.result,
                    operation: 'reuse'
                }
            });
            document.dispatchEvent(vectorUpdateEvent);
        }
    }

    copyResult(id) {
        const operation = this.history.find(item => item.id === id);
        if (!operation) return;

        const resultText = this.formatResult(operation.result, operation.operation);
        navigator.clipboard.writeText(resultText).then(() => {
            this.showNotification('✅ Resultado copiado al portapapeles');
        }).catch(() => {
            this.showNotification('❌ Error al copiar');
        });
    }

    clearHistory() {
        if (confirm('¿Estás seguro de que quieres eliminar todo el historial?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            this.updateStats();
            this.showNotification('🗑️ Historial eliminado');
        }
    }

    exportToCSV() {
        const headers = ['Fecha', 'Hora', 'Tipo', 'Operación', 'Entrada A', 'Entrada B', 'Resultado', 'Duración (ms)'];

        const csvContent = [
            headers.join(','),
            ...this.history.map(item => {
                const date = new Date(item.timestamp);
                return [
                    date.toLocaleDateString(),
                    date.toLocaleTimeString(),
                    item.type,
                    item.operation,
                    JSON.stringify(item.inputA),
                    item.inputB ? JSON.stringify(item.inputB) : '',
                    JSON.stringify(item.result),
                    item.duration || ''
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial-algebra-lineal-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('📤 Historial exportado como CSV');
    }

    importFromCSV(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvContent = e.target.result;
                const lines = csvContent.split('\n').slice(1); // Saltar headers

                const importedOperations = lines.filter(line => line.trim()).map(line => {
                    const [date, time, type, operation, inputA, inputB, result, duration] = line.split(',');

                    return {
                        id: Date.now() + Math.random(),
                        timestamp: new Date(`${date} ${time}`).toISOString(),
                        type: type,
                        operation: operation,
                        inputA: JSON.parse(inputA),
                        inputB: inputB ? JSON.parse(inputB) : null,
                        result: JSON.parse(result),
                        duration: duration ? parseInt(duration) : 0
                    };
                });

                this.history = [...importedOperations, ...this.history];
                this.saveHistory();
                this.renderHistory();
                this.updateStats();
                this.showNotification('📥 Historial importado correctamente');
            } catch (error) {
                this.showNotification('❌ Error al importar el archivo CSV');
                console.error('Error importing CSV:', error);
            }
        };
        reader.readAsText(file);
    }

    updateStats() {
        const totalOperations = document.getElementById('totalOperations');
        const historySize = document.getElementById('historySize');
        const lastUpdate = document.getElementById('lastUpdate');

        if (totalOperations) {
            totalOperations.textContent = `Total: ${this.history.length} operaciones`;
        }

        if (historySize) {
            const size = new Blob([JSON.stringify(this.history)]).size;
            historySize.textContent = `Tamaño: ${(size / 1024).toFixed(2)} KB`;
        }

        if (lastUpdate) {
            lastUpdate.textContent = `Última actualización: ${new Date().toLocaleTimeString()}`;
        }
    }

    showNotification(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'history-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 240, 255, 0.9);
            color: #0a0a0a;
            padding: 12px 20px;
            border-radius: 4px;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('algebraLinearHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('algebraLinearHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }
}

// Inicializar el gestor de historial
let historyManager;

document.addEventListener('DOMContentLoaded', function () {
    historyManager = new HistoryManager();
    // Función global para manejar los botones del historial
    window.historyManager = historyManager;

    // Configurar eventos de los botones de acciones
    function setupHistoryActions() {
        // Evento para reutilizar operación
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('action-btn') && e.target.textContent.includes('Reutilizar')) {
                const historyItem = e.target.closest('.history-item');
                if (historyItem) {
                    const operationId = historyItem.dataset.id;
                    historyManager.reuseOperation(operationId);
                }
            }

            if (e.target.classList.contains('action-btn') && e.target.textContent.includes('Copiar')) {
                const historyItem = e.target.closest('.history-item');
                if (historyItem) {
                    const operationId = historyItem.dataset.id;
                    historyManager.copyResult(operationId);
                }
            }

            if (e.target.classList.contains('delete-operation')) {
                const historyItem = e.target.closest('.history-item');
                if (historyItem) {
                    const operationId = historyItem.dataset.id;
                    historyManager.deleteOperation(operationId);
                }
            }
        });
    }

    // Actualizar el event listener DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function () {
        historyManager = new HistoryManager();
        setupHistoryActions();

        // Configurar motor de búsqueda
        const searchInput = document.getElementById('searchHistory');
        if (searchInput) {
            searchInput.addEventListener('input', function (e) {
                historyManager.searchTerm = e.target.value.toLowerCase();
                historyManager.renderHistory();
            });
        }
    });

    //opción de ángulo en el filtro de operaciones      
    const filterOperation = document.getElementById('filterOperation');
    if (filterOperation && !filterOperation.querySelector('option[value="angle"]')) {
        filterOperation.innerHTML += '<option value="angle">Ángulo</option>';
    }
});
