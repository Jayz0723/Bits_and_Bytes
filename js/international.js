// Store-configured shipping charges in PHP, not live courier quotes.
const shippingDestinations = {
  Philippines: { code: "PH", postal: "[0-9]{4}", example: "1100", surcharge: 0, expressSurcharge: 0 },
  Japan: { code: "JP", postal: "[0-9]{3}-?[0-9]{4}", example: "123-4567", surcharge: 1400, expressSurcharge: 2400, regions: { Tokyo: ["Shinjuku", "Shibuya", "Chiyoda"], Osaka: ["Osaka", "Sakai"], Kyoto: ["Kyoto", "Uji"] } },
  China: { code: "CN", postal: "[0-9]{6}", example: "100000", surcharge: 1200, expressSurcharge: 2100, regions: { Beijing: ["Beijing"], Shanghai: ["Shanghai"], Guangdong: ["Guangzhou", "Shenzhen"] } },
  Spain: { code: "ES", postal: "[0-9]{5}", example: "28001", surcharge: 2200, expressSurcharge: 3400, regions: { Madrid: ["Madrid", "Alcala de Henares"], Catalonia: ["Barcelona", "Girona"], Andalusia: ["Seville", "Malaga"] } },
  France: { code: "FR", postal: "[0-9]{5}", example: "75001", surcharge: 2200, expressSurcharge: 3400, regions: { "Ile-de-France": ["Paris", "Versailles"], "Auvergne-Rhone-Alpes": ["Lyon", "Grenoble"], "Provence-Alpes-Cote d'Azur": ["Marseille", "Nice"] } },
  "United States": { code: "US", postal: "[0-9]{5}(-[0-9]{4})?", example: "10001", surcharge: 2400, expressSurcharge: 3700, regions: { California: ["Los Angeles", "San Francisco", "San Diego"], "New York": ["New York", "Buffalo"], Texas: ["Austin", "Dallas", "Houston"] } }
};

// Fictional collection point, not an operating store or a real pickup reservation.
const storePickupLocation = {
  name: "Bits & Bytes collection point",
  address: "Sample collection point, Calamba City, Laguna, Philippines",
  lat: 14.2119, lng: 121.1653,
  country: "Philippines", province: "Laguna", city: "Calamba City"
};

function selectedFulfillment() {
  return document.querySelector('[name="fulfillmentMethod"]:checked')?.value || "delivery";
}

function deliveryCountry(address) {
  return address?.country || "Philippines";
}

function validInternationalAddress(address) {
  const country = deliveryCountry(address);
  const setting = shippingDestinations[country];
  return Boolean(setting && [address?.street, address?.province, address?.city].every(value => typeof value === "string" && value.trim() && value.length <= 200)
    && new RegExp("^(?:" + setting.postal + ")$").test(address.postalCode || ""));
}

if (typeof module !== "undefined") module.exports = { shippingDestinations, deliveryCountry, validInternationalAddress };
