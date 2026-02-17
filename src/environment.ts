const localApi = 'http://localhost:5078/api';
const localBaseApi = 'http://localhost:5078';
const productionApi = 'https://nhc-market-place.runasp.net/api';
const productionBaseApi = 'https://nhc-market-place.runasp.net';

export const environment = {
    production: false,
    authUrl: `${localApi}/Auth`,
    categoriesUrl: `${localApi}/Categories`,
    brandsUrl: `${localApi}/Brands`,
    productsUrl: `${localApi}/Products`,
    wishlistsUrl: `${localApi}/Wishlist`,
    reviewsUrl: `${localApi}/Reviews`,
    profileUrl: `${localApi}/Profile`,
    cartUrl: `${localApi}/Cart`,
    vendorUrl: `${localApi}/Vendor`,
    promoCodeUrl: `${localApi}/PromoCodes`,
    adminUrl: `${localApi}/AdminReports`,
    orderUrl: `${localApi}/Orders`,
    baseApi: `${localBaseApi}`
};