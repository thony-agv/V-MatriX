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

        // NUEVO: Variables para control de cámara
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = 25;
        this.zoom = 1;
        this.offset = { x: 0, y: 0 };

        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };

        this.setupCanvas();
        this.setupEventListeners();
        this.setupControls();
        this.renderVectors(this.vectors);

        console.log("🎨 Renderizador 3D Interactivo inicializado");
    }

    setupCanvas() {
        this.origin = {
            x: this.canvas.width / 2 + this.offset.x,
            y: this.canvas.height / 2 + this.offset.y
        };

        this.colors = {
            A: '#00f0ff',  // Cian neón
            B: '#ff1493',  // Rosa neón  
            result: '#ffd700', // Amarillo neón
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

        // NUEVO: Eventos de mouse para rotación
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

    // NUEVO: Controles de interfaz
    setupControls() {
        // Crear controles UI si no existen
        if (!document.getElementById('graphics-controls')) {
            this.createControlsUI();
        }
    }

    createControlsUI() {
        const controlsHTML = `
            <div class="graphics-controls">
                <div class="control-group">
                    <label>🔍 Zoom:</label>
                    <input type="range" id="zoomControl" min="10" max="100" value="25" class="control-slider">
                </div>
                <div class="control-group">
                    <label>🔄 Rotación X:</label>
                    <input type="range" id="rotateXControl" min="0" max="360" value="0" class="control-slider">
                </div>
                <div class="control-group">
                    <label>🔄 Rotación Y:</label>
                    <input type="range" id="rotateYControl" min="0" max="360" value="0" class="control-slider">
                </div>
                <div class="control-buttons">
                    <button id="resetView" class="control-btn">🔄 Reiniciar Vista</button>
                    <button id="toggleGrid" class="control-btn">🔲 Toggle Grid</button>
                </div>
            </div>
        `;

        // Insertar controles antes del canvas
        this.canvas.insertAdjacentHTML('beforebegin', controlsHTML);

        // Configurar eventos de controles
        this.setupControlEvents();
    }

    setupControlEvents() {
        // Zoom
        const zoomControl = document.getElementById('zoomControl');
        if (zoomControl) {
            zoomControl.addEventListener('input', (e) => {
                this.scale = parseInt(e.target.value);
                this.renderVectors(this.vectors);
            });
        }

        // Rotación X
        const rotateXControl = document.getElementById('rotateXControl');
        if (rotateXControl) {
            rotateXControl.addEventListener('input', (e) => {
                this.rotation.x = (parseInt(e.target.value) * Math.PI) / 180;
                this.renderVectors(this.vectors);
            });
        }

        // Rotación Y
        const rotateYControl = document.getElementById('rotateYControl');
        if (rotateYControl) {
            rotateYControl.addEventListener('input', (e) => {
                this.rotation.y = (parseInt(e.target.value) * Math.PI) / 180;
                this.renderVectors(this.vectors);
            });
        }

        // Botón reiniciar
        const resetView = document.getElementById('resetView');
        if (resetView) {
            resetView.addEventListener('click', () => this.resetView());
        }

        // Botón toggle grid
        const toggleGrid = document.getElementById('toggleGrid');
        if (toggleGrid) {
            toggleGrid.addEventListener('click', () => this.toggleGrid());
        }
    }

    // NUEVO: Funciones de control de cámara
    startDrag(e) {
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.lastMousePos.x;
        const deltaY = e.clientY - this.lastMousePos.y;

        // Rotación basada en el movimiento del mouse
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

        // Actualizar control de zoom
        const zoomControl = document.getElementById('zoomControl');
        if (zoomControl) {
            zoomControl.value = this.scale;
        }

        this.renderVectors(this.vectors);
    }

    resetView() {
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = 25;
        this.offset = { x: 0, y: 0 };

        // Actualizar controles
        const zoomControl = document.getElementById('zoomControl');
        const rotateXControl = document.getElementById('rotateXControl');
        const rotateYControl = document.getElementById('rotateYControl');

        if (zoomControl) zoomControl.value = this.scale;
        if (rotateXControl) rotateXControl.value = 0;
        if (rotateYControl) rotateYControl.value = 0;

        this.renderVectors(this.vectors);
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
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

    // NUEVO: Función de rotación 3D mejorada
    rotatePoint(x, y, z) {
        // Rotación en X
        const cosX = Math.cos(this.rotation.x);
        const sinX = Math.sin(this.rotation.x);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;

        // Rotación en Y
        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);
        const x1 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        // Rotación en Z (opcional)
        const cosZ = Math.cos(this.rotation.z);
        const sinZ = Math.sin(this.rotation.z);
        const x2 = x1 * cosZ - y1 * sinZ;
        const y2 = x1 * sinZ + y1 * cosZ;

        return { x: x2, y: y2, z: z2 };
    }

    project3DTo2D(x, y, z) {
        // Aplicar rotación
        const rotated = this.rotatePoint(x, y, z);

        // Proyección isométrica con perspectiva
        const scale = this.scale * this.zoom;
        const screenX = this.origin.x + (rotated.x * scale) - (rotated.z * scale * 0.5);
        const screenY = this.origin.y - (rotated.y * scale) - (rotated.z * scale * 0.5);

        return { x: screenX, y: screenY, depth: rotated.z };
    }

    renderVectors(vectors) {
        if (!this.ctx) return;

        // Limpiar canvas con fondo cyberpunk
        this.ctx.fillStyle = 'rgba(10, 10, 20, 0.98)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Actualizar origen (por si hay offset)
        this.origin = {
            x: this.canvas.width / 2 + this.offset.x,
            y: this.canvas.height / 2 + this.offset.y
        };

        // Dibujar rejilla de fondo
        this.drawGrid();

        // Dibujar ejes 3D
        this.drawAxes();

        // Dibujar vectores (en orden de profundidad para mejor visualización)
        this.drawVector(vectors.A, this.colors.A, 'A');
        this.drawVector(vectors.B, this.colors.B, 'B');

        // Dibujar vector resultante si existe
        if (vectors.result && typeof vectors.result === 'object') {
            this.drawVector(vectors.result, this.colors.result, 'Resultado');
        }

        // Dibujar información de la cámara
        this.drawCameraInfo();

        // Dibujar leyenda
        this.drawLegend();
    }

    drawGrid() {
        const { ctx } = this;
        const gridSize = 200;
        const gridStep = 25;

        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 3]);

        // Líneas en XZ (plano horizontal)
        for (let x = -gridSize; x <= gridSize; x += gridStep) {
            const start = this.project3DTo2D(x, 0, -gridSize);
            const end = this.project3DTo2D(x, 0, gridSize);

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }

        // Líneas en ZX (plano horizontal)
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

    drawVector(vector, color, label) {
        const { ctx } = this;

        if (!vector || typeof vector.x === 'undefined') return;

        // Proyectar punto final del vector
        const end = this.project3DTo2D(vector.x, vector.y, vector.z);
        const start = this.project3DTo2D(0, 0, 0);

        // Dibujar línea del vector con efecto de glow
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Dibujar punto final con efecto de glow
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(end.x, end.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Etiqueta del vector
        ctx.fillStyle = color;
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.textAlign = 'left';

        const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
        const labelText = `${label} (${vector.x}, ${vector.y}, ${vector.z}) |${magnitude.toFixed(2)}|`;
        ctx.fillText(labelText, end.x + 10, end.y - 10);
    }

    drawCameraInfo() {
        const { ctx, colors } = this;

        ctx.fillStyle = colors.text;
        ctx.font = '12px "Courier New", monospace';
        ctx.textAlign = 'right';

        const infoText = [
            `🎥 Cámara 3D Activa`,
            `🔍 Zoom: ${this.scale}`,
            `🔄 Rotación: X${Math.round(this.rotation.x * 180 / Math.PI)}° Y${Math.round(this.rotation.y * 180 / Math.PI)}°`,
            `🖱️ Arrastrar para rotar | 🎯 Rueda para zoom`
        ];

        infoText.forEach((text, index) => {
            ctx.fillText(text, this.canvas.width - 15, 25 + index * 18);
        });
    }

    drawLegend() {
        const { ctx, colors } = this;
        const legendX = 15;
        const legendY = 30;

        ctx.fillStyle = colors.text;
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'left';

        ctx.fillText('🎯 Leyenda:', legendX, legendY);

        ctx.fillStyle = colors.A;
        ctx.fillText('● Vector A', legendX, legendY + 20);

        ctx.fillStyle = colors.B;
        ctx.fillText('● Vector B', legendX, legendY + 40);

        ctx.fillStyle = colors.result;
        ctx.fillText('● Resultado', legendX, legendY + 60);
    }
}