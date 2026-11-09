import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { StateService } from 'src/app/services/state.service';




@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styles: [
  ]
})
export class HelpComponent implements OnInit {
  private router = inject(Router);
  public stateService = inject(StateService);
  public sanitiser = inject(DomSanitizer);

  public info = -1;
  public error = '';
  public title = '';

  public item: any = null;
  public topicUrl: any = null;

  // NEW DOC - add an object below to list and a matching object line in the HTML
  public list: any[] = null;

  constructor() {
  }

  // https://developer.adobe.com/ free to developers???

  //    <div id="adobe-dc-view" > </div>
  //   < script src = "https://acrobatservices.adobe.com/view-sdk/viewer.js" > </script>
  //     < script type = "text/javascript" >
  //       document.addEventListener("adobe_dc_view_sdk.ready", function () {
  //         var adobeDCView = new AdobeDC.View({ clientId: "<YOUR_CLIENT_ID>", divId: "adobe-dc-view" });
  //         adobeDCView.previewFile({
  //           content: { location: { url: "https://acrobatservices.adobe.com/view-sdk-demo/PDFs/Bodea Brochure.pdf" } },
  //           metaData: { fileName: "Bodea Brochure.pdf" }
  //         }, { embedMode: "FULL_WINDOW", defaultViewMode: "FIT_PAGE", showAnnotationTools: true, showDownloadPDF: true });
  //       });
  // </script>
  ngOnInit() {
    this.list = [
      { id: 0, name: 'Wigeon Overview', data: 'assets/docs/overview.pdf' }
      , { id: 1, name: 'A Quick Start Guide', data: 'assets/docs/quickstartguide.pdf' }
      , { id: 2, name: 'Field Cropping Structure', data: 'assets/docs/fieldcropping.pdf' }
      , { id: 3, name: 'Field Records', data: 'assets/docs/fieldrecords.pdf' }
      , { id: 4, name: 'Mapping', data: 'assets/docs/mapping.pdf' }
      , { id: 5, name: 'Field Boundaries', data: 'assets/docs/fieldboundaries.pdf' }
      , { id: 6, name: 'Organisations, Businesses and Sharing', data: 'assets/docs/businesses.pdf' }

    ];
    this.list.sort((a, b) => a.name.localeCompare(b.name));
    // sort by name  sort by string

    this.selectTopic(this.list.find(x => x.id === this.stateService.lastHelpTopic) || null);
  }

  selectTopic(n: any) {

    this.item = n;
    if (n) {
      this.topicUrl = this.sanitiser.bypassSecurityTrustResourceUrl(this.item.data);
      this.stateService.lastHelpTopic = n.id;
    } else {
      this.topicUrl = null;
    }
  }

  close() {
    this.router.navigateByUrl('/home'); //this.stateService.getReturnRoute('/help',
  }

}

