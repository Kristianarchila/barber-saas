import { httpClient } from '../http/HttpClient';
import { HttpReservaRepository } from '../repositories/HttpReservaRepository';

/**
 * Dependency Injection Container
 * 
 * Centraliza la creación e inyección de dependencias.
 * Esto facilita el testing y el cambio de implementaciones.
 */
class Container {
    constructor() {
        this.dependencies = new Map();
        this.initializeDependencies();
    }

    /**
     * Inicializar todas las dependencias
     */
    initializeDependencies() {
        // HTTP Client
        this.register('httpClient', httpClient);

        // Repositories
        this.register('reservaRepository', new HttpReservaRepository(this.get('httpClient')));

        // Importar y registrar BarberoRepository
        import('../repositories/HttpBarberoRepository').then(({ HttpBarberoRepository }) => {
            this.register('barberoRepository', new HttpBarberoRepository(this.get('httpClient')));
        });
    }

    /**
     * Registrar una dependencia
     */
    register(name, instance) {
        this.dependencies.set(name, instance);
    }

    /**
     * Obtener una dependencia
     */
    get(name) {
        if (!this.dependencies.has(name)) {
            throw new Error(`Dependency "${name}" not found in container`);
        }
        return this.dependencies.get(name);
    }

    /**
     * Verificar si existe una dependencia
     */
    has(name) {
        return this.dependencies.has(name);
    }
}

// Instancia singleton del container
export const container = new Container();

// Exports de conveniencia
export const getReservaRepository = () => container.get('reservaRepository');
