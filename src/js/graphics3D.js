class Graphics3D {
    constructor() {
        this.canvas = document.getElementById('vectorCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        // Configuración inicial del canvas 3D
        this.origin = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.scale = 20; // Escala para visualización
    }

    renderVectors(vectors) {
        // Limpiar canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar ejes 3D
        this.drawAxes();
        
        // Dibujar vectores
        this.drawVector(vectors.A, '#00ff41', 'A');
        this.drawVector(vectors.B, '#ff00ff', 'B');
        
        // Dibujar vector resultante si existe
        if (vectors.result) {
            this.drawVector(vectors.result, '#ffff00', 'Resultado');
        }
    }

    drawAxes() {
        const { ctx, origin } = this;
        
        // Eje X (Rojo)
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x + 150, origin.y);
        ctx.stroke();
        
        // Eje Y (Verde)
        ctx.strokeStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x, origin.y - 150);
        ctx.stroke();
        
        // Eje Z (Azul)
        ctx.strokeStyle = '#0000ff';
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x - 100, origin.y + 100);
        ctx.stroke();
        
        // Etiquetas de ejes
        ctx.fillStyle = '#ffffff';
        ctx.fillText('X', origin.x + 160, origin.y + 10);
        ctx.fillText('Y', origin.x + 10, origin.y - 160);
        ctx.fillText('Z', origin.x - 110, origin.y + 120);
    }

    drawVector(vector, color, label) {
        const { ctx, origin, scale } = this;
        
        // Convertir coordenadas 3D a 2D (proyección isométrica simple)
        const screenX = origin.x + (vector.x * scale) - (vector.z * scale * 0.5);
        const screenY = origin.y - (vector.y * scale) - (vector.z * scale * 0.5);
        
        // Dibujar línea del vector
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(screenX, screenY);
        ctx.stroke();
        
        // Dibujar punto final
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Etiqueta del vector
        ctx.fillStyle = color;
        ctx.fillText(`${label} (${vector.x}, ${vector.y}, ${vector.z})`, screenX + 10, screenY - 10);
    }

    updateResultVector(resultVector) {
        // Actualizar y renderizar vector resultante
        this.renderVectors({
            A: this.vectors.A,
            B: this.vectors.B,
            result: resultVector
        });
    }
}