import { mapKeys } from 'lodash';

export const mapPriceDefinition = (priceDefinition = {}) => {
  // convert data from price definition before submit
  const mapData = mapKeys(priceDefinition, function (value, key) {
    const { normalPrice, price } = value;
    if (!normalPrice && price) {
      value['normalPrice'] = value['price'];
    }
    if (!price && normalPrice) {
      value['price'] = value['normalPrice'];
    }
    delete value['isChecked'];
    return key.replace('region_', '');
  });

  // filter object with price, normalPrice and vatRate is not empty
  const dataValidForSubmit = Object.fromEntries(
    Object.entries(mapData).filter(
      ([_, value]) => value.price && value.normalPrice && value.vatRate,
    ),
  );
  return dataValidForSubmit;
};
