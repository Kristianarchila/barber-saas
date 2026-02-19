const Money = require('../value-objects/Money');

/**
 * Pricing Domain Service
 * Handles business logic for pricing, discounts, and revenue splits
 */
class PricingService {
    /**
     * Calculate revenue split between barbero and barberia
     * @param {Money} totalAmount
     * @param {Object} splitConfig - { barbero: percentage, barberia: percentage }
     * @returns {Object} { barberoAmount: Money, barberiaAmount: Money }
     */
    calculateRevenueSplit(totalAmount, splitConfig) {
        if (!splitConfig || !splitConfig.barbero || !splitConfig.barberia) {
            throw new Error('Invalid split configuration');
        }

        // Validate percentages add up to 100
        if (splitConfig.barbero + splitConfig.barberia !== 100) {
            throw new Error('Split percentages must add up to 100');
        }

        const barberoAmount = totalAmount.multiply(splitConfig.barbero / 100);
        const barberiaAmount = totalAmount.multiply(splitConfig.barberia / 100);

        return {
            barberoAmount,
            barberiaAmount,
            barberoPercentage: splitConfig.barbero,
            barberiaPercentage: splitConfig.barberia
        };
    }

    /**
     * Apply discount to a price
     * @param {Money} price
     * @param {number} discountPercentage
     * @returns {Object} { originalPrice: Money, discountAmount: Money, finalPrice: Money }
     */
    applyDiscount(price, discountPercentage) {
        if (discountPercentage < 0 || discountPercentage > 100) {
            throw new Error('Discount percentage must be between 0 and 100');
        }

        const discountAmount = price.multiply(discountPercentage / 100);
        const finalPrice = price.applyDiscount(discountPercentage);

        return {
            originalPrice: price,
            discountAmount,
            finalPrice,
            discountPercentage
        };
    }

    /**
     * Calculate deposit amount
     * @param {Money} totalPrice
     * @param {number} depositPercentage - Default 20%
     * @returns {Money}
     */
    calculateDeposit(totalPrice, depositPercentage = 20) {
        if (depositPercentage < 0 || depositPercentage > 100) {
            throw new Error('Deposit percentage must be between 0 and 100');
        }

        return totalPrice.multiply(depositPercentage / 100);
    }

    /**
     * Calculate total price for multiple services
     * @param {Servicio[]} servicios
     * @returns {Money}
     */
    calculateTotalForServices(servicios) {
        if (!servicios || servicios.length === 0) {
            return new Money(0);
        }

        return servicios.reduce((total, servicio) => {
            return total.add(servicio.precio);
        }, new Money(0));
    }

    /**
     * Apply coupon discount
     * @param {Money} price
     * @param {Object} coupon - { tipo: 'PORCENTAJE'|'MONTO_FIJO', valor: number }
     * @returns {Object} { originalPrice: Money, discountAmount: Money, finalPrice: Money }
     */
    applyCoupon(price, coupon) {
        if (!coupon || !coupon.tipo || coupon.valor === undefined) {
            throw new Error('Invalid coupon');
        }

        let discountAmount;
        let finalPrice;

        if (coupon.tipo === 'PORCENTAJE') {
            return this.applyDiscount(price, coupon.valor);
        } else if (coupon.tipo === 'MONTO_FIJO') {
            discountAmount = new Money(coupon.valor, price.currency);

            // Ensure discount doesn't exceed price
            if (discountAmount.amount > price.amount) {
                discountAmount = price;
            }

            finalPrice = price.subtract(discountAmount);
        } else {
            throw new Error('Invalid coupon type');
        }

        return {
            originalPrice: price,
            discountAmount,
            finalPrice,
            couponCode: coupon.codigo
        };
    }

    /**
     * Calculate price with tax
     * @param {Money} price
     * @param {number} taxPercentage
     * @returns {Object} { basePrice: Money, taxAmount: Money, totalPrice: Money }
     */
    calculateWithTax(price, taxPercentage) {
        if (taxPercentage < 0) {
            throw new Error('Tax percentage cannot be negative');
        }

        const taxAmount = price.multiply(taxPercentage / 100);
        const totalPrice = price.add(taxAmount);

        return {
            basePrice: price,
            taxAmount,
            totalPrice,
            taxPercentage
        };
    }

    /**
     * Calculate commission for a barbero
     * @param {Money} totalRevenue
     * @param {number} commissionPercentage
     * @returns {Money}
     */
    calculateCommission(totalRevenue, commissionPercentage) {
        if (commissionPercentage < 0 || commissionPercentage > 100) {
            throw new Error('Commission percentage must be between 0 and 100');
        }

        return totalRevenue.multiply(commissionPercentage / 100);
    }

    /**
     * Create price snapshot for historical tracking
     * @param {Money} precioBase
     * @param {number} descuento
     * @returns {Object}
     */
    createPriceSnapshot(precioBase, descuento = 0) {
        const discountResult = descuento > 0
            ? this.applyDiscount(precioBase, descuento)
            : { originalPrice: precioBase, discountAmount: new Money(0), finalPrice: precioBase };

        return {
            precioBase: precioBase.amount,
            descuento,
            precioFinal: discountResult.finalPrice.amount,
            fechaSnapshot: new Date()
        };
    }
}

module.exports = PricingService;
