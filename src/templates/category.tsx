import * as React from "react";
import "../index.css";
import {
  GetHeadConfig,
  GetPath,
  GetRedirects,
  HeadConfig,
  Template,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
} from "@yext/pages";
import PageLayout from "../components/page-layout";
import {
  provideHeadless,
  SandboxEndpoints,
  SearchHeadlessProvider,
} from "@yext/search-headless-react";
import Favicon from "../public/yext-favicon.ico";
import { FilterSearch } from "@yext/search-ui-react";
import ProductSearch from "../components/ProductSearch";
import ProductCard from "../components/cards/ProductCard";
import CategoryBanner from "../components/category-banner";
import { FeaturedProducts } from "../components/search/FeaturedProducts";
import { RelatedCategories } from "../components/RelatedCategories";
import { render } from "@headlessui/react/dist/utils/render";

export const config: TemplateConfig = {
  stream: {
    $id: "my-stream-id-category",
    // Specifies the exact data that each generated document will contain. This data is passed in
    // directly as props to the default exported function.
    fields: [
      "id",
      "uid",
      "slug",
      "meta",
      "name",
      "c_categoryDescription",
      "c_bannerPhoto",
      "c_linkedDepartment.name",
      "c_linkedDepartment.slug",
      "c_linkedCategories.name",
      "c_linkedCategories.landingPageUrl",
      "c_linkedCategories.slug",
      "c_linkedSubcategories.name",
      "c_linkedSubcategories.landingPageUrl",
      "c_linkedSubcategories.slug",
    ],
    // Defines the scope of entities that qualify for this stream.
    filter: {
      entityTypes: ["ce_category"],
    },
    // The entity language profiles that documents will be generated for.
    localization: {
      locales: ["en"],
      primary: false,
    },
  },
};

/**
 * Defines the path that the generated file will live at for production.
 *
 * NOTE: This currently has no impact on the local dev path. Local dev urls currently
 * take on the form: featureName/entityId
 */
export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return document.slug
    ? document.slug
    : `${document.locale}/${document.address.region}/${document.address.city}/${
        document.address.line1
      }-${document.id.toString()}`;
};

/**
 * Defines a list of paths which will redirect to the path created by getPath.
 *
 * NOTE: This currently has no impact on the local dev path. Redirects will be setup on
 * a new deploy.
 */
export const getRedirects: GetRedirects<TemplateProps> = ({ document }) => {
  return [`index-old/${document.id.toString()}`];
};

/**
 * This allows the user to define a function which will take in their template
 * data and produce a HeadConfig object. When the site is generated, the HeadConfig
 * will be used to generate the inner contents of the HTML document's <head> tag.
 * This can include the title, meta tags, script tags, etc.
 */
export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  relativePrefixToRoot,
  path,
  document,
}): HeadConfig => {
  return {
    title: document.name,
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1",
    tags: [
      {
        type: "meta",
        attributes: {
          name: "description",
          content: document.description,
        },
      },
      {
        type: "link",
        attributes: {
          rel: "icon",
          type: "image/x-icon",
          href: Favicon,
        },
      },
    ],
  };
};

const searcher = provideHeadless({
  apiKey: "d2471212e8121452a0204c59c9a08bd4",
  // make sure your experience key matches what you see in the platform
  experienceKey: "answers",
  locale: "en",
  endpoints: SandboxEndpoints,
  verticalKey: "products",
});

const ProductSearchPage: Template<TemplateRenderProps> = ({
  relativePrefixToRoot,
  path,
  document,
}) => {
  const {
    _site,
    name,
    c_categoryDescription,
    c_bannerPhoto,
    c_linkedDepartment,
    c_linkedSubcategories,
  } = document;

  const breadcrumbLinks = [];
  c_linkedDepartment && breadcrumbLinks.push(c_linkedDepartment);

  const relatedSubcategoriesLabel = name + " Subcategories";
  const renderSubcategories = () => {
    return (
      c_linkedSubcategories && (
        <RelatedCategories
          sectionTitle={relatedSubcategoriesLabel}
          categories={c_linkedSubcategories}
        />
      )
    );
  };

  return (
    <PageLayout
      _site={_site}
      c_siteLogo={_site.c_siteLogo}
      includeSearchHeader={true}
    >
      <div className="flex flex-row my-4 px-4">
        {breadcrumbLinks &&
          breadcrumbLinks.map((item, index) => (
            <div key={index}>
              {index !== 0 && <span className="mx-2 text-gray-400">&gt;</span>}
              <a
                href={"/" + item[0].slug}
                className="text-brand-primary hover:text-brand-hover"
              >
                {item[0].name}
              </a>
            </div>
          ))}
          <div>
              <span className="mx-2 text-gray-400">&gt;</span>
              <a
                href="#"
                className="text-brand-primary hover:text-brand-hover"
              >
                {name}
              </a>
            </div>
      </div>
      <CategoryBanner
        name={name}
        description={c_categoryDescription}
        photoURL={c_bannerPhoto?.url}
      />
      {renderSubcategories()}
      <div className="mx-auto max-w-7xl px-4">
        <SearchHeadlessProvider searcher={searcher}>
          <ProductSearch
            searchBarPlaceholder={`Search all NWC products`}
            facetField="c_linkedCategories.name"
            facetValue={name}
          />
        </SearchHeadlessProvider>
      </div>
    </PageLayout>
  );
};

export default ProductSearchPage;
