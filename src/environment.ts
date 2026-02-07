const localApi = 'http://localhost:5078/api';
const localBaseApi = 'http://localhost:5078';
const productionApi = 'https://nhc-market-place.runasp.net/api';
const productionBaseApi = 'https://nhc-market-place.runasp.net';

export const environment = {
    production: false,
    authUrl: `${productionApi}/Auth`,
    categoriesUrl: `${productionApi}/Categories`,
    brandsUrl: `${productionApi}/Brands`,
    productsUrl: `${productionApi}/Products`,
    wishlistsUrl: `${productionApi}/Wishlist`,
    reviewsUrl: `${productionApi}/Reviews`,
    baseApi: `${productionBaseApi}`
};