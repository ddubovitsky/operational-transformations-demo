import { MainComponent } from './libs/pages/main-component.ts';
import { SiteComponent } from './libs/site/site.component.ts';
import { NetworkModule } from './libs/network/network.module.ts';
import { SharedModule } from './libs/shared/shared.module.ts';

SharedModule.register();
NetworkModule.register();
SiteComponent.register();
MainComponent.register();
