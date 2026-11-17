import { defineTheme } from "@orunelle/theme-sdk";
import type {
  MerchantManifest,
  ConfigurationTemplate,
} from "@orunelle/theme-contract";
import manifest from "../orunelle.theme.json";
import defaults from "../defaults.json";
import "@orunelle/theme-engine/sections.css";
import "./styles/fonts.css";
import "./styles/account.css";
import "./styles/commerce.css";
import "./styles/app.css";
import { ThemeLayout } from "./components/layout/ThemeLayout";
import { HomePage } from "./components/home/HomePage";
import { ProductPage } from "./components/product/ProductPage";
import { ProductListPage } from "./components/product/ProductListPage";
import { ProductCard } from "./components/product/ProductCard";
import { ProductActions } from "./components/product/ProductActions";
import { CollectionListPage } from "./components/collection/CollectionListPage";
import { PageSingle } from "./components/page/PageSingle";
import { AccountPage } from "./components/account/AccountPage";
import { CartPage } from "./components/cart/CartPage";
import { NavigationLink } from "./components/layout/NavigationLink";
import { FooterColumn } from "./components/layout/FooterColumn";
import {
  MetropolitanBuyButtons,
  MetropolitanDescription,
} from "./components/product/ProductBlocks";
import {
  Hero,
  Products,
  Split,
  Banner,
  Lookbook,
  Story,
  Journal,
  Featured,
} from "./components/home/Sections";
export default defineTheme({
  manifest: manifest as MerchantManifest,
  defaults: defaults as unknown as ConfigurationTemplate,
  components: {
    Layout: ThemeLayout,
    HomePage,
    ProductPage,
    CatalogPage: ProductListPage,
    CollectionsPage: CollectionListPage,
    ContentPage: PageSingle,
    AccountPage,
    CartPage,
    ProductCard,
    ProductActions,
  },
  sections: {
    "metropolitan.hero": Hero,
    "metropolitan.products": Products,
    "metropolitan.split": Split,
    "metropolitan.banner": Banner,
    "metropolitan.lookbook": Lookbook,
    "metropolitan.featured": Featured,
    "metropolitan.story": Story,
    "metropolitan.journal": Journal,
    "metropolitan.navlink": NavigationLink,
    "metropolitan.footer": FooterColumn,
  },
  blocks: {
    "product-buy": MetropolitanBuyButtons,
    "product-description": MetropolitanDescription,
    "metropolitan.footerlink": NavigationLink,
  },
});
