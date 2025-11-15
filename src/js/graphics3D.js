class Graphics3D {
    constructor() {
        this.canvas = document.getElementById('vectorCanvas');
        if (!this.canvas) {
            console.error("❌ No se encontró el canvas para gráficos 3D");
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.vectors = {
            A: { x: 3, y: 4, z: 2 },
            B: { x: 1, y: -2, z: 5 },
            result: null
        };

        // Variables para control de cámara
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = 25;
        this.zoom = 1;
        this.offset = { x: 0, y: 0 };
        this.showGrid = true;

        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };

        this.setupCanvas();
        this.setupEventListeners();

        // Inicializar controles después de un delay para asegurar que el DOM esté listo
        setTimeout(() => {
            this.setupControls();
        }, 500);

        this.renderVectors(this.vectors);

        console.log("🎨 Renderizador 3D Interactivo inicializado");
    }

    setupCanvas() {
        this.origin = {
            x: this.canvas.width / 2 + this.offset.x,
            y: this.canvas.height / 2 + this.offset.y
        };

        this.colors = {
            A: '#00f0ff',
            B: '#ff1493',
            result: '#ffd700',
            scalar: '#ff6b00',      // Naranja para valores escalares
            angle: '#00ff7f',       // Verde para ángulos
            axes: '#ffffff',
            grid: 'rgba(0, 240, 255, 0.15)',
            text: '#00f0ff'
        };
    }

    setupEventListeners() {
        // Escuchar actualizaciones de vectores
        document.addEventListener('vectorUpdate', (event) => {
            if (event.detail && event.detail.vectors) {
                this.vectors = {
                    ...event.detail.vectors,
                    result: event.detail.result
                };
                this.renderVectors(this.vectors);
            }
        });

        // Eventos de mouse para rotación
        this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
        this.canvas.addEventListener('mousemove', (e) => this.drag(e));
        this.canvas.addEventListener('mouseup', () => this.endDrag());
        this.canvas.addEventListener('wheel', (e) => this.handleZoom(e));

        // Actualizar gráficos cuando cambien los inputs
        const vectorInputs = ['vectorAx', 'vectorAy', 'vectorAz', 'vectorBx', 'vectorBy', 'vectorBz'];
        vectorInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.updateFromInputs());
            }
        });
    }

    setupControls() {
        console.log("🎮 Inicializando controles 3D...");
        this.setupControlEvents();
    }

    setupControlEvents() {
        console.log("🔧 Configurando eventos de controles...");

        // Reset View - CON MÁS VERIFICACIONES
        const resetView = document.getElementById('resetView');
        if (resetView) {
            // Remover event listeners existentes para evitar duplicados
            resetView.replaceWith(resetView.cloneNode(true));
            const newResetView = document.getElementById('resetView');

            newResetView.addEventListener('click', () => {
                console.log("🔄 Botón Reset View clickeado");
                this.resetView();
            });
            console.log("✅ Botón resetView configurado correctamente");
        } else {
            console.error("❌ Botón resetView no encontrado en el DOM");
        }

        // Toggle Grid - CON MÁS VERIFICACIONES
        const toggleGrid = document.getElementById('toggleGrid');
        if (toggleGrid) {
            // Remover event listeners existentes
            toggleGrid.replaceWith(toggleGrid.cloneNode(true));
            const newToggleGrid = document.getElementById('toggleGrid');

            newToggleGrid.addEventListener('click', () => {
                console.log("🔲 Botón Toggle Grid clickeado");
                this.toggleGrid();
            });
            console.log("✅ Botón toggleGrid configurado correctamente");
        } else {
            console.error("❌ Botón toggleGrid no encontrado en el DOM");
        }

        // Zoom Control
        const zoomControl = document.getElementById('zoomControl');
        if (zoomControl) {
            zoomControl.addEventListener('input', (e) => {
                this.scale = parseInt(e.target.value);
                const zoomValue = document.getElementById('zoomValue');
                if (zoomValue) zoomValue.textContent = this.scale;
                this.renderVectors(this.vectors);
            });
            console.log("✅ Control de zoom configurado");
        }

        // Rotación X
        const rotateXControl = document.getElementById('rotateXControl');
        if (rotateXControl) {
            rotateXControl.addEventListener('input', (e) => {
                this.rotation.x = (parseInt(e.target.value) * Math.PI) / 180;
                const rotateXValue = document.getElementById('rotateXValue');
                if (rotateXValue) rotateXValue.textContent = e.target.value + '°';
                this.renderVectors(this.vectors);
            });
            console.log("✅ Control rotación X configurado");
        }

        // Rotación Y
        const rotateYControl = document.getElementById('rotateYControl');
        if (rotateYControl) {
            rotateYControl.addEventListener('input', (e) => {
                this.rotation.y = (parseInt(e.target.value) * Math.PI) / 180;
                const rotateYValue = document.getElementById('rotateYValue');
                if (rotateYValue) rotateYValue.textContent = e.target.value + '°';
                this.renderVectors(this.vectors);
            });
            console.log("✅ Control rotación Y configurado");
        }

        console.log("🎯 Todos los controles 3D configurados");
    }

    // FUNCIÓN RESET VIEW MEJORADA
    resetView() {
        console.log("🔄 Ejecutando resetView...");

        // Resetear valores
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = 25;
        this.offset = { x: 0, y: 0 };
        this.showGrid = true;

        // Actualizar controles UI con verificaciones
        const controls = [
            { id: 'zoomControl', value: this.scale },
            { id: 'rotateXControl', value: 0 },
            { id: 'rotateYControl', value: 0 }
        ];

        const values = [
            { id: 'zoomValue', text: this.scale.toString() },
            { id: 'rotateXValue', text: '0°' },
            { id: 'rotateYValue', text: '0°' }
        ];

        // Actualizar controles
        controls.forEach(control => {
            const element = document.getElementById(control.id);
            if (element) {
                element.value = control.value;
                console.log(`✅ ${control.id} actualizado a: ${control.value}`);
            } else {
                console.error(`❌ No se encontró: ${control.id}`);
            }
        });

        // Actualizar valores de texto
        values.forEach(value => {
            const element = document.getElementById(value.id);
            if (element) {
                element.textContent = value.text;
            }
        });

        // Actualizar texto del botón de grid
        const toggleGridBtn = document.getElementById('toggleGrid');
        if (toggleGridBtn) {
            toggleGridBtn.textContent = '🔲 Ocultar Grid';
        }

        // Renderizar
        this.renderVectors(this.vectors);
        console.log("✅ Vista reiniciada completamente");
    }

    // FUNCIÓN TOGGLE GRID MEJORADA
    toggleGrid() {
        console.log("🔲 Ejecutando toggleGrid...");
        this.showGrid = !this.showGrid;

        // Actualizar texto del botón
        const toggleGridBtn = document.getElementById('toggleGrid');
        if (toggleGridBtn) {
            toggleGridBtn.textContent = this.showGrid ? '🔲 Ocultar Grid' : '🔲 Mostrar Grid';
        }

        this.renderVectors(this.vectors);
        console.log(`✅ Grid ${this.showGrid ? 'activado' : 'desactivado'}`);
    }

    // Funciones de control de cámara
    startDrag(e) {
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.lastMousePos.x;
        const deltaY = e.clientY - this.lastMousePos.y;

        this.rotation.y += deltaX * 0.01;
        this.rotation.x += deltaY * 0.01;

        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.renderVectors(this.vectors);
    }

    endDrag() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    handleZoom(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale = Math.max(10, Math.min(100, this.scale * zoomFactor));

        const zoomControl = document.getElementById('zoomControl');
        const zoomValue = document.getElementById('zoomValue');
        if (zoomControl) zoomControl.value = this.scale;
        if (zoomValue) zoomValue.textContent = Math.round(this.scale);

        this.renderVectors(this.vectors);
    }

    updateFromInputs() {
        try {
            this.vectors.A = {
                x: parseFloat(document.getElementById('vectorAx').value) || 0,
                y: parseFloat(document.getElementById('vectorAy').value) || 0,
                z: parseFloat(document.getElementById('vectorAz').value) || 0
            };

            this.vectors.B = {
                x: parseFloat(document.getElementById('vectorBx').value) || 0,
                y: parseFloat(document.getElementById('vectorBy').value) || 0,
                z: parseFloat(document.getElementById('vectorBz').value) || 0
            };

            this.renderVectors(this.vectors);
        } catch (error) {
            console.error("❌ Error actualizando gráficos desde inputs:", error);
        }
    }

    rotatePoint(x, y, z) {
        const cosX = Math.cos(this.rotation.x);
        const sinX = Math.sin(this.rotation.x);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;

        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);
        const x1 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        return { x: x1, y: y1, z: z2 };
    }

    project3DTo2D(x, y, z) {
        const rotated = this.rotatePoint(x, y, z);
        const scale = this.scale * this.zoom;
        const screenX = this.origin.x + (rotated.x * scale) - (rotated.z * scale * 0.5);
        const screenY = this.origin.y - (rotated.y * scale) - (rotated.z * scale * 0.5);

        return { x: screenX, y: screenY, depth: rotated.z };
    }

    renderVectors(vectors) {
        if (!this.ctx) {
            console.error("❌ Contexto 2D no disponible");
            return;
        }

        // Limpiar canvas
        this.ctx.fillStyle = 'rgba(10, 10, 20, 0.98)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Actualizar origen
        this.origin = {
            x: this.canvas.width / 2 + this.offset.x,
            y: this.canvas.height / 2 + this.offset.y
        };

        // Dibujar rejilla si está activada
        if (this.showGrid) {
            this.drawGrid();
        }

        // Dibujar ejes 3D
        this.drawAxes();

        // Dibujar vectores principales
        this.drawVector(vectors.A, this.colors.A, 'A');
        this.drawVector(vectors.B, this.colors.B, 'B');

        // Dibujar vector resultante si existe - MEJORADO PARA VALORES ESCALARES
        if (vectors.result && typeof vectors.result === 'object') {
            // Si es un valor escalar (producto punto, magnitud, ángulo)
            if (vectors.result.isScalar) {
                // Usar color especial para valores escalares
                const scalarColor = vectors.result.isAngle ? this.colors.angle : this.colors.scalar;
                this.drawScalarValue(vectors.result, scalarColor, this.getScalarLabel(vectors.result));
            } else {
                // Es un vector normal
                this.drawVector(vectors.result, this.colors.result, 'Resultado');
            }
        }

        // Dibujar información de la cámara
        this.drawCameraInfo();
    }

    // NUEVO MÉTODO: Dibujar valores escalares
    drawScalarValue(scalarData, color, label) {
        const { ctx } = this;

        // Crear un punto pequeño en el origen para representar el valor escalar
        const point = this.project3DTo2D(scalarData.x, scalarData.y, scalarData.z);

        // Dibujar un círculo especial para valores escalares
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;

        // Círculo más grande y con efecto de glow para valores escalares
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Dibujar un anillo alrededor
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Etiqueta del valor escalar - MEJORADA
        ctx.fillStyle = color;
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.textAlign = 'left';

        // Mostrar el valor numérico
        let valueText;
        if (scalarData.isAngle) {
            valueText = `${label}: ${scalarData.scalarValue.toFixed(2)}°`;
        } else {
            valueText = `${label}: ${scalarData.scalarValue.toFixed(4)}`;
        }

        ctx.fillText(valueText, point.x + 15, point.y - 10);

        // Información adicional
        ctx.font = '10px "Courier New", monospace';
        if (scalarData.isAngle) {
            ctx.fillText('Ángulo entre vectores', point.x + 15, point.y + 5);
        } else if (label.includes('Punto')) {
            ctx.fillText('Producto escalar', point.x + 15, point.y + 5);
        } else {
            ctx.fillText('Magnitud', point.x + 15, point.y + 5);
        }
    }

    // NUEVO MÉTODO: Obtener etiqueta para valores escalares
    getScalarLabel(scalarData) {
        if (scalarData.isAngle) {
            return 'Ángulo';
        } else if (scalarData.operationType === 'dot') {
            return 'A · B';
        } else if (scalarData.operationType === 'magnitude') {
            return '|A|';
        } else {
            return 'Valor';
        }
    }

    // MÉTODO drawVector MEJORADO
    drawVector(vector, color, label) {
        const { ctx } = this;

        if (!vector || typeof vector.x === 'undefined') return;

        // Proyectar punto final del vector
        const end = this.project3DTo2D(vector.x, vector.y, vector.z);
        const start = this.project3DTo2D(0, 0, 0);

        // Dibujar línea del vector
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Dibujar punto final
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(end.x, end.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Etiqueta del vector - MEJORADA PARA DIFERENCIAR TIPOS
        ctx.fillStyle = color;
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'left';

        const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
        const labelText = `${label} (${vector.x.toFixed(2)}, ${vector.y.toFixed(2)}, ${vector.z.toFixed(2)}) |${magnitude.toFixed(2)}|`;

        ctx.fillText(labelText, end.x + 8, end.y - 8);
    }

    drawGrid() {
        const { ctx } = this;
        const gridSize = 200;
        const gridStep = 25;

        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 3]);

        for (let x = -gridSize; x <= gridSize; x += gridStep) {
            const start = this.project3DTo2D(x, 0, -gridSize);
            const end = this.project3DTo2D(x, 0, gridSize);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }

        for (let z = -gridSize; z <= gridSize; z += gridStep) {
            const start = this.project3DTo2D(-gridSize, 0, z);
            const end = this.project3DTo2D(gridSize, 0, z);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }

        ctx.setLineDash([]);
    }

    drawAxes() {
        const { ctx, colors } = this;
        const axisLength = 150;

        ctx.lineWidth = 2.5;

        // Eje X (Rojo)
        const xEnd = this.project3DTo2D(axisLength, 0, 0);
        const xStart = this.project3DTo2D(-axisLength, 0, 0);
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(xStart.x, xStart.y);
        ctx.lineTo(xEnd.x, xEnd.y);
        ctx.stroke();

        // Eje Y (Verde)
        const yEnd = this.project3DTo2D(0, axisLength, 0);
        const yStart = this.project3DTo2D(0, -axisLength, 0);
        ctx.strokeStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(yStart.x, yStart.y);
        ctx.lineTo(yEnd.x, yEnd.y);
        ctx.stroke();

        // Eje Z (Azul)
        const zEnd = this.project3DTo2D(0, 0, axisLength);
        const zStart = this.project3DTo2D(0, 0, -axisLength);
        ctx.strokeStyle = '#0000ff';
        ctx.beginPath();
        ctx.moveTo(zStart.x, zStart.y);
        ctx.lineTo(zEnd.x, zEnd.y);
        ctx.stroke();

        // Etiquetas de ejes
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.textAlign = 'center';

        const xLabel = this.project3DTo2D(axisLength + 10, 0, 0);
        const yLabel = this.project3DTo2D(0, axisLength + 10, 0);
        const zLabel = this.project3DTo2D(0, 0, axisLength + 10);

        ctx.fillText('X', xLabel.x, xLabel.y);
        ctx.fillText('Y', yLabel.x, yLabel.y);
        ctx.fillText('Z', zLabel.x, zLabel.y);
    }

    drawCameraInfo() {
        const { ctx, colors } = this;

        ctx.fillStyle = colors.text;
        ctx.font = '11px "Courier New", monospace';
        ctx.textAlign = 'right';

        const infoText = [
            `🎥 Cámara 3D Activa`,
            `🔍 Zoom: ${this.scale}`,
            `🔄 Rotación: X${Math.round(this.rotation.x * 180 / Math.PI)}° Y${Math.round(this.rotation.y * 180 / Math.PI)}°`,
            `🖱️ Arrastrar para rotar | 🎯 Rueda para zoom`
        ];

        infoText.forEach((text, index) => {
            ctx.fillText(text, this.canvas.width - 10, 20 + index * 14);
        });
    }
}