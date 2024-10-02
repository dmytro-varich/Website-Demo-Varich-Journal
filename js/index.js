import Router from "./paramHashRouter.js";
import Routes from "./routes.js";

import { activateLink } from "./scriptButton.js";
window.activateLink = activateLink;

window.router = new Router(Routes, "journal");

import { changePage } from "./routes.js";
window.changePage = changePage;