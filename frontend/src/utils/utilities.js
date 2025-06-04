import axios from 'axios';

export function camelCaseToSnakeCase(camelStr) {
  return camelStr.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function refactorOrderFormData(formObject) {
  const validFormObject = {};
  Object.keys(formObject).forEach(camelCaseKey => {
    let validKey = camelCaseToSnakeCase(camelCaseKey);
    if (camelCaseKey === 'coordinates') {
      validFormObject.latitude = formObject.coordinates.lat;
      validFormObject.longitude = formObject.coordinates.lng;
      return;
    }
    validFormObject[validKey] = formObject[camelCaseKey];
  });
  console.log(validFormObject);
  return validFormObject;
}

export const getAddressFromCoordinates = async (lat, lng) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const res = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
  );

  const address =
    res.data.results && res.data.results.length > 0
      ? res.data.results[0].formatted_address
      : '';
  return address;
};

export function refactorDeliveryPartnerFormData(formObject) {
  const validFormObject = {};
  Object.keys(formObject).forEach(camelCaseKey => {
    let validKey = camelCaseToSnakeCase(camelCaseKey);
    if (camelCaseKey === 'coordinates') {
      validFormObject.latitude = formObject.coordinates.lat;
      validFormObject.longitude = formObject.coordinates.lng;
      return;
    }
    validFormObject[validKey] = formObject[camelCaseKey];
  });
  console.log(validFormObject);
  return validFormObject;
}
