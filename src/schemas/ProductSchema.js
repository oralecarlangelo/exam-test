import * as yup from 'yup';
import languages from '@/data/languages';
import { mapValues } from 'lodash';

const transformNormalPrice = (data) => {
  if (data.normalPrice == null || data.normalPrice === '' || Number.isNaN(data.normalPrice)) {
    data.normalPrice = data.price;
  }
  return data;
};

export const ProductOptionVariantSchema = yup.object().shape({
  labels: yup.object().shape({
    en: yup.string().default(''),
  }),
  optionCode: yup.string().required().default(''),
});

export const ProductOptionSchema = yup
  .object()
  .shape({
    optionNumber: yup.number().min(1).max(3).required(),
    titles: yup.object().shape({
      en: yup.string().required().default(''),
    }),
    variants: yup.array().of(ProductOptionVariantSchema).default([]),
    variantOptionType: yup.string(),
  })
  .transform((data) => {
    if (data.variants.length > 1) {
      const last = data.variants[data.variants.length - 1];
      if (!last.optionCode && languages.every((option) => !last.labels?.[option.value])) {
        return {
          ...data,
          variants: data.variants.slice(0, data.variants.length - 1),
        };
      }
    }
    return data;
  })
  .transform((data) => {
    return {
      ...data,
      variants: data.variants.map((item) => {
        if (data.variantOptionType === 'valueSizes') {
          return {
            ...item,
            optionCode: String(item.optionCode).replace(/\.$/, ''),
          };
        }
        return item;
      }),
    };
  })
  .test(function ({ variants, variantOptionType }) {
    const codes = new Set();
    for (let i = 0; i < variants.length; i++) {
      let item = variants[i];
      if (!item?.optionCode) {
        continue;
      }
      if (codes.has(item.optionCode)) {
        return this.createError({
          path: `${this.path}.variants.${i}.optionCode`,
          message: 'Codes must be unique',
          type: 'optionCode.duplicate',
        });
      }
      codes.add(item.optionCode);
    }

    for (let i = 0; i < variants.length; i++) {
      let item = variants[i];
      if (variantOptionType === 'colors' && !/^#[a-fA-F0-9]{6}$/.test(item.optionCode)) {
        return this.createError({
          path: `${this.path}.variants.${i}.optionCode`,
          message: 'Must be in #ffffff format',
          type: 'color',
        });
      }
      if (variantOptionType === 'hours' && !/^[0-9]{2}:[0-9]{2}$/.test(item.optionCode)) {
        return this.createError({
          path: `${this.path}.variants.${i}.optionCode`,
          message: 'Must be a valid time in HH:MM format',
          type: 'hour',
        });
      }
    }

    if (!['custom', 'colors'].includes(variantOptionType)) {
      return true;
    }

    if (
      variantOptionType === 'colors' &&
      variants.every((item) => languages.every((option) => !item.labels?.[option.value]))
    ) {
      return true;
    }

    for (let i = 0; i < variants.length; i++) {
      let item = variants[i];
      if (!item.labels?.en) {
        return this.createError({
          path: `${this.path}.variants.${i}.labels.en`,
          message: 'Label in EN is required',
          type: 'en.required',
        });
      }
    }

    return true;
  });

export const ProductVariantOptionsBlockSchema = yup
  .object()
  .shape({
    variantOptions: yup.array().of(ProductOptionSchema).default([]),
    variantOptionTypes: yup.string(),
  })
  .noUnknown();

export const ProductVariantSchema = yup.object().shape({
  option1Code: yup.string().nullable().default(null),
  option2Code: yup.string().nullable().default(null),
  option3Code: yup.string().nullable().default(null),
  price: yup.number().min(0).max(yup.ref('normalPrice')).nullable().default(null),
  normalPrice: yup.number().min(0).nullable().default(null),
  currency: yup.string().nullable().default(null),
  vatRate: yup.number().min(0).max(99.99).nullable().default(null),
});

export const ProductVariantsBlockSchema = yup
  .object()
  .shape({
    variants: yup.array().of(ProductVariantSchema).default([]),
  })
  .noUnknown();

export const ProductVariantsSchema = yup
  .object()
  .concat(ProductVariantOptionsBlockSchema)
  .concat(ProductVariantsBlockSchema);

export const ProductPriceBlockSchema = yup
  .object()
  .shape({
    price: yup.number().min(0).max(yup.ref('normalPrice')).required(),
    normalPrice: yup.number().min(0).required(),
    currency: yup.string().required().default('gbp'),
    isFree: yup.bool().default(false),
    vatRate: yup.number().min(0).max(99.99).required(),
  })
  .transform(transformNormalPrice)
  .noUnknown();

const patternTwoDecimals = /^\d+([\,\.]\d{0,2})?$/;

const transformDecimalNumber = (value, originalValue) => {
  return originalValue ? value : undefined;
};

const PriceDefinitionFieldSchema = () => {
  return yup
    .number()
    .transform(transformDecimalNumber)
    .typeError('Invalid number')
    .min(0)
    .test('is-decimal', 'Maximum 2 decimals', (val) => {
      if (val != undefined) {
        return patternTwoDecimals.test(val);
      }
      return true;
    });
};

export const PriceDefinitionObjectSchema = yup.object().shape(
  {
    price: PriceDefinitionFieldSchema()
      .when('normalPrice', {
        is: (normalPrice) => normalPrice,
        then: (schema) => schema.max(yup.ref('normalPrice')),
      })
      .when(['vatRate', 'normalPrice'], {
        is: (vatRate, normalPrice) => vatRate && !normalPrice,
        then: (schema) => schema.required(),
      }),
    normalPrice: PriceDefinitionFieldSchema().when(['vatRate', 'price'], {
      is: (vatRate, price) => vatRate && !price,
      then: (schema) => schema.required(),
    }),
    vatRate: PriceDefinitionFieldSchema().when(['price', 'normalPrice'], {
      is: (price, normalPrice) => price || normalPrice,
      then: (schema) => schema.required().max(99.99),
    }),
    isChecked: yup
      .bool()
      .default(false)
      .transform((value, origin) => {
        return origin ? value : false;
      }),
  },
  [
    ['price', 'normalPrice'],
    ['vatRate', 'normalPrice'],
    ['vatRate', 'price'],
  ],
);

export const ProductPriceDefinitionBLockSchema = yup
  .object({
    priceDefinition: yup.lazy((obj) => {
      return yup.object(mapValues(obj, () => PriceDefinitionObjectSchema));
    }),
  })
  .noUnknown();
export const ProductSchema = yup
  .object()
  .concat(ProductPriceDefinitionBLockSchema)
  .concat(ProductVariantOptionsBlockSchema)
  .concat(ProductVariantsBlockSchema);

export default ProductSchema;
