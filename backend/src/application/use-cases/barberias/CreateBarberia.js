const Barberia = require('../../../domain/entities/Barberia');
const slugify = require('../../../utils/slugify');
const TransactionManager = require('../../../utils/TransactionManager');

/**
 * CreateBarberia Use Case
 */
class CreateBarberia {
    constructor(barberiaRepository) {
        this.barberiaRepository = barberiaRepository;
    }

    async execute(data) {
        const { nombre, direccion, telefono, email } = data;

        if (!nombre) throw new Error('El nombre de la barbería es obligatorio');
        if (!email) throw new Error('El email de la barbería es obligatorio');

        // Execute within transaction for atomicity
        const barberia = await TransactionManager.executeInTransaction(
            async (session) => {
                // 1. Generate unique slug
                const baseSlug = slugify(nombre);
                if (!baseSlug) throw new Error('No se pudo generar slug desde el nombre');

                let slug = baseSlug;
                let i = 1;
                while (await this.barberiaRepository.exists({ slug })) {
                    slug = `${baseSlug}-${i}`;
                    i++;
                }

                // 2. Prevent duplicate email
                const emailLower = String(email).toLowerCase().trim();
                const emailExists = await this.barberiaRepository.exists({ email: emailLower });
                if (emailExists) throw new Error('Ya existe una barbería con ese email');

                // 3. Create Entity
                const barberia = new Barberia({
                    nombre,
                    slug,
                    email: emailLower,
                    direccion,
                    telefono
                });

                // 4. Save (within transaction)
                return await this.barberiaRepository.save(barberia, session);
            },
            { operationName: 'CreateBarberia' }
        );

        return barberia;
    }
}

module.exports = CreateBarberia;
