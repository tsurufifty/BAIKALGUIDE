import type { Schema, Struct } from '@strapi/strapi';

export interface MapGeoPoint extends Struct.ComponentSchema {
  collectionName: 'components_map_geo_points';
  info: {
    description: 'GeoJSON-compatible coordinate (lng/lat order; used by Yandex Maps v3)';
    displayName: 'Geo Point';
    icon: 'pinMap';
  };
  attributes: {
    label: Schema.Attribute.String;
    latitude: Schema.Attribute.Float &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 90;
          min: -90;
        },
        number
      >;
    longitude: Schema.Attribute.Float &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 180;
          min: -180;
        },
        number
      >;
    zoom: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 22;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
  };
}

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    description: 'Question/answer pair for FAQPage structured data';
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO metadata: search engines + AI Search (Schema.org)';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    faq: Schema.Attribute.Component<'shared.faq-item', true>;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 320;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogDescription: Schema.Attribute.Text;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String;
    schemaType: Schema.Attribute.Enumeration<
      ['Article', 'TouristTrip', 'Event', 'Place', 'Person', 'FAQPage']
    > &
      Schema.Attribute.DefaultTo<'Article'>;
    structuredData: Schema.Attribute.JSON;
    twitterCard: Schema.Attribute.Enumeration<
      ['summary', 'summary_large_image']
    > &
      Schema.Attribute.DefaultTo<'summary_large_image'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'map.geo-point': MapGeoPoint;
      'shared.faq-item': SharedFaqItem;
      'shared.seo': SharedSeo;
    }
  }
}
