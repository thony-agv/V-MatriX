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