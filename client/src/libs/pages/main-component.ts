import { registerComponent, WebComponent } from '../web-utils/web-component/web-component';
import { SiteComponent } from '../site/site.component.ts';
import { SitesNetworkClass } from '../network/class/sites-network.class.ts';
import { NetworkConnectionComponent } from '../network/component/network-connection.component.ts';

const templateString = `
<div style="max-width: 1160px; margin:  auto">
<h1 class="text-roman text-center" style="margin-top: 3rem; margin-bottom: 1rem; font-style: italic; font-weight: bold">Generic Operational Transformations Algorithm</h1>
<p class="text-muted">
This is interactive demo of the operational transformations approach described in <a title="Chengzheng Sun, Xiaohua Jia, Yanchun Zhang, Yun Yang, and David Chen. 1998. Achieving convergence, causality preservation, and intention preservation in real-time cooperative editing systems. ACM Trans. Comput.-Hum. Interact. 5, 1 (March 1998), 63–108. https://doi.org/10.1145/274444.274447" href="https://dl.acm.org/doi/10.1145/274444.274447">this</a> article. 
After reading it I did not understand a thing, and decided that implementing it myself would be the best way to learn. So I did it and here it is, enjoy :).
</br>This demo shows steps that are taken by each operation, and displays resulting operation right before execution.
</p>

<details closed class="mb-5">
  <summary>How it works?</summary>
  <p class="text-muted">
 The basic idea is following: 
when any given site generates operation (either insert or delete), it will be sent to all the other sites. 
Receiving site checks that newly received operation satisfies 2 preconditions: 
</p>
<ol class="text-muted">
<li>Received operation is just next after latest known operation from same site.<br/> For example, If <b>site 1</b> has received <i>3 operations</i> from <b>Site 2</b>, and then it receives <i>6th operation</i> from <b>site 2</b>, 6th operation has to be stored, and will be executed only after <i>operations 4,5 arrive</i>.</li>
<br/>
<li>Receiving site has received all operations, that newly received operation depends upon.</br> 
<p>If <b>Site 1</b> has received <i>operation 1</i> from the <b>Site 3</b>, it means that all the operations that <b>Site 1</b> produces depend on the <i>operation 1</i> from <b>Site 3</b>. And when <b>site 2</b> receives operation from the <b>Site 1</b>, it will have to wait until <i>operation 1</i> from <b>Site 3</b> is received in order to execute operation from <b>Site 1</b></p>
<p>For example <b>Sites: 1, 2, 3</b> are empty. <b>Site 2</b> is now offline. Site 3 generates operation Insert("Hello", 0), and now <b>Site 1</b> has state "Hello". After that <b>Site 2</b> becomes online. Then, when Site 1 generates operation Delete(4, "0"), so now State is "Hell". Site 3 cannot delete "0", because it does not have it. It will have to wait for the operation Insert(0, "Hello") to exectute Delete(4, "0");</p> 
</li>
</ol>
<p class="text-muted">After preconditions are met, simplified version of transformations: Include in the new operation all the operations that it does not know about.</p>
</details>


<div class="d-flex flex-row w-100 gap-sites flex-wrap position-relative pb-3">
<app-site id="site1" siteId="1"></app-site>
<app-network-connection id="connection1" networkNode1="site1" networkNode2="site2" style="left: 538px; top: 100px;" class="position-absolute" position="vertical"></app-network-connection>
<app-site id="site2" siteId="2"></app-site>
<app-network-connection id="connection2" networkNode1="site1" networkNode2="site3" style="left: 216px; top: 365px;" class="position-absolute" position="horizontal"></app-network-connection>
<app-site id="site3" siteId="3"></app-site>
<app-network-connection id="connection3"  networkNode1="site2" networkNode2="site3" style="left: 546px; top: 315px;" class="position-absolute" position="diagonal"></app-network-connection>
</div>
</div>

`;

export class MainComponent extends WebComponent {

  static register() {
    registerComponent({
      tagName: 'app-main',
      templateString: templateString,
      componentClass: MainComponent,
    });
  }

  connectedCallback() {
    super.connectedCallback();


    const sites = [this.getById('site1'), this.getById('site2'), this.getById('site3')] as SiteComponent[];
    const connections = [this.getById('connection1'), this.getById('connection2'), this.getById('connection3')] as NetworkConnectionComponent[];

    const sitesNetwork = new SitesNetworkClass();

    sitesNetwork.addSites(sites);

    sites.forEach((it) => {
      it?.addEventListener('remoteEvent', (event) => {
        sitesNetwork.send((event as CustomEvent).detail);
      });
    });

    connections.forEach((connection) => {
      connection?.addEventListener('connectionStateChange', (event) => {
        sitesNetwork.toggleConnection((event as CustomEvent).detail,
          this.getById(connection.getAttribute('networkNode1')) as SiteComponent,
          this.getById(connection.getAttribute('networkNode2')) as SiteComponent,
        );
      });
    });
  }
}
