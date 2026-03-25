const productionApi = 'https://noqta-egypt.com/api';
const productionBaseApi = 'https://noqta-egypt.com';
const localApi = 'http://localhost:5078/api';
const localBaseApi = 'http://localhost:5078';

export const environment = {
    production: true,
    authUrl: `${productionApi}/Auth`,
    categoriesUrl: `${productionApi}/Categories`,
    brandsUrl: `${productionApi}/Brands`,
    productsUrl: `${productionApi}/Products`,
    wishlistsUrl: `${productionApi}/Wishlist`,
    reviewsUrl: `${productionApi}/Reviews`,
    profileUrl: `${productionApi}/Profile`,
    cartUrl: `${productionApi}/Cart`,
    vendorUrl: `${productionApi}/Vendor`,
    promoCodeUrl: `${productionApi}/PromoCodes`,
    adminUrl: `${productionApi}/AdminReports`,
    orderUrl: `${productionApi}/Orders`,
    complaintUrl: `${productionApi}/Complaints`,
    shippingUrl: `${productionApi}/Shipping`,
    addressUrl: `${productionApi}/Address`,
    baseApi: `${productionBaseApi}`
};


// const productionApi = 'https://nhc-market-place.runasp.net/api';
// const productionBaseApi = 'https://nhc-market-place.runasp.net';

// export const environment = {
//     production: false,
//     authUrl: `${localApi}/Auth`,
//     categoriesUrl: `${localApi}/Categories`,
//     brandsUrl: `${localApi}/Brands`,
//     productsUrl: `${localApi}/Products`,
//     wishlistsUrl: `${localApi}/Wishlist`,
//     reviewsUrl: `${localApi}/Reviews`,
//     profileUrl: `${localApi}/Profile`,
//     cartUrl: `${localApi}/Cart`,
//     vendorUrl: `${localApi}/Vendor`,
//     promoCodeUrl: `${localApi}/PromoCodes`,
//     adminUrl: `${localApi}/AdminReports`,
//     orderUrl: `${localApi}/Orders`,
//     complaintUrl: `${localApi}/Complaints`,
//     shippingUrl: `${localApi}/Shipping`,
//     addressUrl: `${localApi}/Address`,
//     baseApi: `${localBaseApi}`
// };

