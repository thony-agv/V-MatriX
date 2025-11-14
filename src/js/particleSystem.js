class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("❌ No se encontró el canvas para partículas");
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isRunning = false;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.simulationTime = 0;

        // Configuración inicial
        this.config = {
            particleCount: 50,
            maxParticles: 500,
            particleSpeed: 5,
            particleSize: 3,
            gravity: 0.1,
            magneticForce: 0.05,
            windForce: 0.02,
            vortexForce: 0.03,
            enableCollisions: true,
            enableTrails: true,
            enableGlow: true,
            particleColor: 'rainbow',
            trailLength: 20
        };

        // Control de cámara
        this.rotation = { x: 0, y: 0 };
        this.scale = 25;
        this.origin = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };

        this.setupEventListeners();
        this.setupControls();
        this.createParticles(this.config.particleCount);

        console.log("⚡ Sistema de Partículas 3D inicializado");
    }

    setupEventListeners() {
        // Eventos de mouse para control de cámara
        this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
        this.canvas.addEventListener('mousemove', (e) => this.drag(e));
        this.canvas.addEventListener('mouseup', () => this.endDrag());
        this.canvas.addEventListener('wheel', (e) => this.handleZoom(e));

        // Click para agregar partículas
        this.canvas.addEventListener('click', (e) => this.addParticleAtClick(e));
        this.canvas.addEventListener('dblclick', () => this.clearParticles());

        // Eventos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    setupControls() {
        // Actualizar controles con valores iniciales
        this.updateControlValues();

        // Configurar eventos de controles
        const controls = {
            'particleCount': (value) => this.config.particleCount = parseInt(value),
            'particleSpeed': (value) => this.config.particleSpeed = parseInt(value),
            'particleSize': (value) => this.config.particleSize = parseInt(value),
            'gravityForce': (checked) => this.config.gravity = checked ? 0.1 : 0,
            'magneticForce': (checked) => this.config.magneticForce = checked ? 0.05 : 0,
            'windForce': (checked) => this.config.windForce = checked ? 0.02 : 0,
            'vortexForce': (checked) => this.config.vortexForce = checked ? 0.03 : 0,
            'enableCollisions': (checked) => this.config.enableCollisions = checked,
            'enableTrails': (checked) => this.config.enableTrails = checked,
            'enableGlow': (checked) => this.config.enableGlow = checked,
            'particleColor': (value) => this.config.particleColor = value
        };

        Object.entries(controls).forEach(([id, setter]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.addEventListener('change', (e) => setter(e.target.checked));
                } else if (element.type === 'range') {
                    element.addEventListener('input', (e) => {
                        setter(e.target.value);
                        this.updateControlValues();
                    });
                } else {
                    element.addEventListener('change', (e) => setter(e.target.value));
                }
            }
        });

        // Controles de simulación
        document.getElementById('startSimulation')?.addEventListener('click', () => this.start());
        document.getElementById('pauseSimulation')?.addEventListener('click', () => this.pause());
        document.getElementById('resetSimulation')?.addEventListener('click', () => this.reset());
        document.getElementById('addParticle')?.addEventListener('click', () => this.addParticles(10));
        document.getElementById('clearParticles')?.addEventListener('click', () => this.clearParticles());
    }

    updateControlValues() {
        const sliders = {
            'particleCount': 'countValue',
            'particleSpeed': 'speedValue',
            'particleSize': 'sizeValue'
        };

        Object.entries(sliders).forEach(([sliderId, valueId]) => {
            const slider = document.getElementById(sliderId);
            const valueSpan = document.getElementById(valueId);
            if (slider && valueSpan) {
                valueSpan.textContent = slider.value;
            }
        });
    }

    createParticles(count) {
        for (let i = 0; i < count; i++) {
            this.addParticle();
        }
    }

    addParticle() {
        if (this.particles.length >= this.config.maxParticles) return;

        const particle = {
            id: Date.now() + Math.random(),
            position: {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                z: (Math.random() - 0.5) * 200
            },
            velocity: {
                x: (Math.random() - 0.5) * this.config.particleSpeed,
                y: (Math.random() - 0.5) * this.config.particleSpeed,
                z: (Math.random() - 0.5) * this.config.particleSpeed
            },
            acceleration: { x: 0, y: 0, z: 0 },
            size: this.config.particleSize + Math.random() * 2,
            mass: 1 + Math.random() * 2,
            color: this.getParticleColor(),
            trail: [],
            energy: 0,
            age: 0,
            lifetime: 500 + Math.random() * 500
        };

        this.particles.push(particle);
    }

    addParticles(count) {
        for (let i = 0; i < count; i++) {
            this.addParticle();
        }
    }

    addParticleAtClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Convertir coordenadas 2D a 3D (simplificado)
        const worldX = (x - this.origin.x) / this.scale;
        const worldY = (y - this.origin.y) / this.scale;

        const particle = {
            id: Date.now() + Math.random(),
            position: {
                x: worldX,
                y: -worldY,
                z: (Math.random() - 0.5) * 50
            },
            velocity: {
                x: (Math.random() - 0.5) * this.config.particleSpeed * 2,
                y: (Math.random() - 0.5) * this.config.particleSpeed * 2,
                z: (Math.random() - 0.5) * this.config.particleSpeed * 2
            },
            acceleration: { x: 0, y: 0, z: 0 },
            size: this.config.particleSize * 1.5,
            mass: 1,
            color: this.getParticleColor(),
            trail: [],
            energy: 0,
            age: 0,
            lifetime: 300
        };

        this.particles.push(particle);
    }

    getParticleColor() {
        const colors = {
            rainbow: () => {
                const hue = Math.random() * 360;
                return `hsl(${hue}, 100%, 60%)`;
            },
            cyan: '#00f0ff',
            pink: '#ff1493',
            gold: '#ffd700',
            green: '#00ff00',
            purple: '#ff00ff'
        };

        const color = colors[this.config.particleColor];
        return typeof color === 'function' ? color() : color;
    }

    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            // Actualizar edad
            particle.age += deltaTime;

            // Aplicar fuerzas
            this.applyForces(particle);

            // Integración de movimiento (Verlet o Euler simple)
            particle.velocity.x += particle.acceleration.x * deltaTime;
            particle.velocity.y += particle.acceleration.y * deltaTime;
            particle.velocity.z += particle.acceleration.z * deltaTime;

            particle.position.x += particle.velocity.x * deltaTime;
            particle.position.y += particle.velocity.y * deltaTime;
            particle.position.z += particle.velocity.z * deltaTime;

            // Reset aceleración
            particle.acceleration = { x: 0, y: 0, z: 0 };

            // Calcular energía
            particle.energy = this.calculateEnergy(particle);

            // Actualizar estela
            if (this.config.enableTrails) {
                particle.trail.push({ ...particle.position });
                if (particle.trail.length > this.config.trailLength) {
                    particle.trail.shift();
                }
            }

            // Colisiones con bordes del espacio
            this.handleBoundaries(particle);
        });

        // Colisiones entre partículas
        if (this.config.enableCollisions) {
            this.handleCollisions();
        }

        // Remover partículas viejas
        this.particles = this.particles.filter(p => p.age < p.lifetime);
    }

    applyForces(particle) {
        // Gravedad
        if (this.config.gravity) {
            particle.acceleration.y -= this.config.gravity;
        }

        // Campo magnético (fuerza hacia el centro)
        if (this.config.magneticForce) {
            const distance = Math.sqrt(
                particle.position.x ** 2 +
                particle.position.y ** 2 +
                particle.position.z ** 2
            );

            if (distance > 0.1) {
                const force = this.config.magneticForce / (distance * 0.1);
                particle.acceleration.x -= particle.position.x * force;
                particle.acceleration.y -= particle.position.y * force;
                particle.acceleration.z -= particle.position.z * force;
            }
        }

        // Viento (fuerza constante en X)
        if (this.config.windForce) {
            particle.acceleration.x += this.config.windForce;
        }

        // Vórtice (fuerza rotacional)
        if (this.config.vortexForce) {
            const radius = Math.sqrt(particle.position.x ** 2 + particle.position.z ** 2);
            if (radius > 0.1) {
                const force = this.config.vortexForce / radius;
                particle.acceleration.x -= particle.position.z * force;
                particle.acceleration.z += particle.position.x * force;
            }
        }
    }

    calculateEnergy(particle) {
        const kinetic = 0.5 * particle.mass * (
            particle.velocity.x ** 2 +
            particle.velocity.y ** 2 +
            particle.velocity.z ** 2
        );
        const potential = particle.mass * 9.81 * Math.abs(particle.position.y);
        return kinetic + potential;
    }

    handleBoundaries(particle) {
        const boundary = 250;
        const bounce = 0.8;

        ['x', 'y', 'z'].forEach(axis => {
            if (Math.abs(particle.position[axis]) > boundary) {
                particle.position[axis] = Math.sign(particle.position[axis]) * boundary;
                particle.velocity[axis] *= -bounce;
            }
        });
    }

    handleCollisions() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];

                const dx = p1.position.x - p2.position.x;
                const dy = p1.position.y - p2.position.y;
                const dz = p1.position.z - p2.position.z;

                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                const minDistance = p1.size + p2.size;

                if (distance < minDistance && distance > 0) {
                    // Colisión elástica simple
                    const angle = Math.atan2(dy, dx);
                    const speed1 = Math.sqrt(p1.velocity.x ** 2 + p1.velocity.y ** 2);
                    const speed2 = Math.sqrt(p2.velocity.x ** 2 + p2.velocity.y ** 2);

                    const direction1 = Math.atan2(p1.velocity.y, p1.velocity.x);
                    const direction2 = Math.atan2(p2.velocity.y, p2.velocity.x);

                    const velocityX1 = speed1 * Math.cos(direction1 - angle);
                    const velocityY1 = speed1 * Math.sin(direction1 - angle);
                    const velocityX2 = speed2 * Math.cos(direction2 - angle);
                    const velocityY2 = speed2 * Math.sin(direction2 - angle);

                    // Conservación de momento
                    const finalVelocityX1 = ((p1.mass - p2.mass) * velocityX1 + 2 * p2.mass * velocityX2) / (p1.mass + p2.mass);
                    const finalVelocityX2 = ((p2.mass - p1.mass) * velocityX2 + 2 * p1.mass * velocityX1) / (p1.mass + p2.mass);

                    p1.velocity.x = Math.cos(angle) * finalVelocityX1 + Math.cos(angle + Math.PI / 2) * velocityY1;
                    p1.velocity.y = Math.sin(angle) * finalVelocityX1 + Math.sin(angle + Math.PI / 2) * velocityY1;
                    p2.velocity.x = Math.cos(angle) * finalVelocityX2 + Math.cos(angle + Math.PI / 2) * velocityY2;
                    p2.velocity.y = Math.sin(angle) * finalVelocityX2 + Math.sin(angle + Math.PI / 2) * velocityY2;

                    // Separar partículas
                    const overlap = minDistance - distance;
                    p1.position.x += dx / distance * overlap * 0.5;
                    p1.position.y += dy / distance * overlap * 0.5;
                    p2.position.x -= dx / distance * overlap * 0.5;
                    p2.position.y -= dy / distance * overlap * 0.5;
                }
            }
        }
    } // ... (continuará con los métodos de renderizado y controles de cámara)
}

// ... (tu código anterior)

project3DTo2D(point3D) {
    // Rotación en X e Y
    const cosX = Math.cos(this.rotation.x);
    const sinX = Math.sin(this.rotation.x);
    const cosY = Math.cos(this.rotation.y);
    const sinY = Math.sin(this.rotation.y);

    // Aplicar rotaciones
    let x = point3D.x;
    let y = point3D.y * cosX - point3D.z * sinX;
    let z = point3D.y * sinX + point3D.z * cosX;

    const tempX = x * cosY - z * sinY;
    const tempZ = x * sinY + z * cosY;

    // Proyección perspectiva
    const scale = this.scale / (50 + tempZ);
    const screenX = this.origin.x + tempX * scale;
    const screenY = this.origin.y - y * scale;

    return {
        x: screenX,
        y: screenY,
        depth: tempZ,
        scale: scale
    };
}

renderParticles() {
    // Limpiar canvas
    this.ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Ordenar partículas por profundidad para correcto renderizado
    const particlesWithDepth = this.particles.map(particle => ({
        particle,
        projected: this.project3DTo2D(particle.position)
    })).sort((a, b) => b.projected.depth - a.projected.depth);

    // Renderizar cada partícula
    particlesWithDepth.forEach(({ particle, projected }) => {
        // Renderizar estela si está habilitada
        if (this.config.enableTrails && particle.trail.length > 1) {
            this.renderTrail(particle);
        }

        // Renderizar partícula principal
        this.renderParticle(particle, projected);
    });

    // Renderizar información de debug
    this.renderDebugInfo();
}

renderTrail(particle) {
    this.ctx.beginPath();

    // Dibujar la estela como línea conectada
    for (let i = 0; i < particle.trail.length - 1; i++) {
        const point1 = this.project3DTo2D(particle.trail[i]);
        const point2 = this.project3DTo2D(particle.trail[i + 1]);

        if (i === 0) {
            this.ctx.moveTo(point1.x, point1.y);
        }
        this.ctx.lineTo(point2.x, point2.y);
    }

    // Gradiente de color para la estela
    const gradient = this.ctx.createLinearGradient(
        this.project3DTo2D(particle.trail[0]).x,
        this.project3DTo2D(particle.trail[0]).y,
        this.project3DTo2D(particle.trail[particle.trail.length - 1]).x,
        this.project3DTo2D(particle.trail[particle.trail.length - 1]).y
    );

    gradient.addColorStop(0, particle.color + '80'); // Más opaco al inicio
    gradient.addColorStop(1, particle.color + '20'); // Más transparente al final

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = particle.size * 0.3;
    this.ctx.stroke();
}

renderParticle(particle, projected) {
    const size = particle.size * projected.scale;

    // Efecto de brillo si está habilitado
    if (this.config.enableGlow) {
        this.ctx.shadowColor = particle.color;
        this.ctx.shadowBlur = 15 * projected.scale;
    }

    // Dibujar partícula
    this.ctx.beginPath();
    this.ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);

    // Gradiente radial para efecto 3D
    const gradient = this.ctx.createRadialGradient(
        projected.x, projected.y, 0,
        projected.x, projected.y, size
    );

    gradient.addColorStop(0, particle.color + 'FF');
    gradient.addColorStop(0.7, particle.color + 'AA');
    gradient.addColorStop(1, particle.color + '00');

    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Resetear sombra
    this.ctx.shadowBlur = 0;
}

renderDebugInfo() {
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.font = '12px Rajdhani, monospace';
    this.ctx.textAlign = 'left';

    const info = [
        `Partículas: ${this.particles.length}`,
        `FPS: ${this.fps}`,
        `Tiempo: ${this.simulationTime.toFixed(1)}s`,
        `Rotación: X:${(this.rotation.x * 180 / Math.PI).toFixed(1)}° Y:${(this.rotation.y * 180 / Math.PI).toFixed(1)}°`,
        `Zoom: ${this.scale.toFixed(1)}`
    ];

    info.forEach((text, index) => {
        this.ctx.fillText(text, 10, 20 + index * 18);
    });
}

// Controles de cámara
startDrag(event) {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
    this.canvas.style.cursor = 'grabbing';
}

drag(event) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    this.rotation.y += deltaX * 0.01;
    this.rotation.x += deltaY * 0.01;

    // Limitar rotación vertical
    this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
}

endDrag() {
    this.isDragging = false;
    this.canvas.style.cursor = 'grab';
}

handleZoom(event) {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    this.scale = Math.max(5, Math.min(100, this.scale * zoomFactor));
}

handleKeyPress(event) {
    switch (event.key) {
        case ' ':
            this.isRunning ? this.pause() : this.start();
            break;
        case 'r':
        case 'R':
            this.reset();
            break;
        case 'c':
        case 'C':
            this.clearParticles();
            break;
        case '+':
            this.addParticles(10);
            break;
        case '-':
            this.particles = this.particles.slice(0, Math.max(0, this.particles.length - 10));
            break;
    }
}

// Control de la simulación
start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();

    console.log('▶️ Simulación iniciada');
}

pause() {
    this.isRunning = false;
    console.log('⏸️ Simulación pausada');
}

reset() {
    this.particles = [];
    this.createParticles(this.config.particleCount);
    this.rotation = { x: 0, y: 0 };
    this.scale = 25;
    this.simulationTime = 0;

    console.log('🔄 Simulación reseteada');
}

clearParticles() {
    this.particles = [];
    console.log('🧹 Partículas eliminadas');
}

animate(currentTime) {
    if (!this.isRunning) return;

    // Calcular delta time
    if (!currentTime) currentTime = performance.now();
    const deltaTime = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    // Actualizar estadísticas
    this.frameCount++;
    this.simulationTime += deltaTime;

    // Calcular FPS
    if (this.simulationTime - this.lastFpsUpdate > 0.5) {
        this.fps = Math.round(this.frameCount / (this.simulationTime - this.lastFpsUpdate));
        this.frameCount = 0;
        this.lastFpsUpdate = this.simulationTime;
    }

    // Actualizar y renderizar
    this.updateParticles(deltaTime);
    this.renderParticles();

    // Continuar animación
    requestAnimationFrame((time) => this.animate(time));
}

    // Inicialización automática cuando el DOM esté listo
    static init() {
    document.addEventListener('DOMContentLoaded', function () {
        const canvas = document.getElementById('particleCanvas');
        if (canvas) {
            window.particleSystem = new ParticleSystem('particleCanvas');

            // Iniciar automáticamente después de un breve delay
            setTimeout(() => {
                window.particleSystem.start();
            }, 1000);
        } else {
            console.error('❌ No se encontró el canvas con id "particleCanvas"');
        }
    });
}
}

// Inicializar automáticamente
ParticleSystem.init();