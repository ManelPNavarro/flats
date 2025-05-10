const DistrictMapper = {
    zones: {
        'Ciutat Vella': ['ciutat vella', 'raval', 'el raval', 'gòtic', 'el gòtic', 'born', 'barceloneta', 'sant pere'],
        'El Clot': ['el clot'],
        'Eixample': ['eixample', 'l\'eixample', 'dreta eixample', 'esquerra eixample', 'antiga esquerra', 'nova esquerra'],
        'Gràcia': ['gràcia', 'vila de gràcia', 'camp d’en grassot'],
        'Horta-Guinardó': ['horta', 'guinardó', 'el baix guinardó', 'el carmel'],
        'Les Corts': ['les corts', 'corts'],
        'Nou Barris': ['nou barris', 'verdun', 'prosperitat', 'canyelles', 'vilapicina i la torre llobeta'],
        'Poblenou': ['poblenou', 'poble nou', 'el poblenou', 'poble nou'],
        'Sants-Montjuïc': ['sants', 'montjuïc', 'hostafrancs', 'la bordeta', 'sants - badal', 'sants-badal'],
        'Sant Andreu': ['sant andreu', 'la sagrera'],
        'Sant Antoni': ['sant antoni'],
        'Sant Marti': ['sant martí', 'bac de roda', 'diagonal mar', 'el besòs'],
        'Sarrià-Sant Gervasi': ['sarrià', 'sant gervasi', 'tres torres', 'bonanova', 'galvany'],
        'Zona Franca': ['la marina del port', 'zona franca'],
    },

    normalizeDistrict(input) {
        if (!input) return null;

        const lowerInput = input.trim().toLowerCase();

        for (const [normalized, aliases] of Object.entries(this.zones)) {
            if (aliases.some(alias => lowerInput.includes(alias))) {
                return normalized;
            }
        }

        return null;
    }
};

module.exports = DistrictMapper;