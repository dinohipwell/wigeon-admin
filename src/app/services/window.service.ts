import { Injectable, ValueProvider } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class WindowService {
  windowAvailable() {
    // true if running on client
    return (typeof window !== 'undefined');
  }
  get nativeWindow(): any {
    // return _window();
    return window;
  }

  print() {
    window.print();
  }

  getOffsetTop(sId: string): number {
    const target = document.getElementById(sId);
    if (target) {
      // block end stops the whole page outside the list scrolling LIKE scroll to BOTTOM
      return target.offsetTop;
    } else {
      return 0;
    }
  }

  scrollListIdIntoView(sId: string) {
    // after 30milli secs get element as the page should now be displayed

    const scrollToTop = window.setTimeout(() => {
      const target = document.getElementById(sId);
      if (target) {
        // block end stops the whole page outside the list scrolling LIKE scroll to BOTTOM
        target.scrollIntoView({ behavior: 'smooth', block: 'end' });

      }

    }, 10);
  }

  scrollIdToCenterInstant(sId: string) {
    // used if page scrolled

    const target = document.getElementById(sId);
    if (target) {
      // this.scrollTo(target.offset().top);
      target.scrollIntoView({ block: "center" });
    }
  }

  scrollIdToCenter(sId: string) {
    // used if page scrolled
    const scrollToTop = window.setTimeout(() => {
      const target = document.getElementById(sId);
      if (target) {
        // this.scrollTo(target.offset().top);
        target.scrollIntoView({ block: "center" });
      }
    }, 30);
  }

  scrollIdToTopInstant(sId: string) {
    // used if page scrolled

    const target = document.getElementById(sId);
    if (target) {
      target.scrollIntoView({ block: "start" });
      // target.scrollIntoView(true);
    }
  }

  scrollIdToTop(sId: string) {
    // used if page scrolled
    // after 30milli secs get element as the page should now be displayed
    const scrollToTop = window.setTimeout(() => {
      const target = document.getElementById(sId);
      if (target) {
        // this.scrollTo(target.offset().top);
        target.scrollIntoView(true);
      }
    }, 30);
  }

  scrollIdToBottom(sId: string) {
    // after 10milli secs get element as the page should now be displayed
    const scrollToTop = window.setTimeout(() => {
      const target = document.getElementById(sId);
      if (target) {
        // this.scrollTo(target.offset().top);
        target.scrollIntoView(false);
      }
    }, 10);
  }

  scrollToTopQuick() {
    // May not work in modals
    window.scrollTo(0, 0);

  }

  scrollToTopOffset(y: number) {
    window.scrollTo(0, y);

  }

  scrollY() {
    return window.scrollY;

  }

  scrollToTop() {
    const scrollToTop = window.setInterval(() => {
      const pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 30); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 8);

  }

  displayModeStandalone(): boolean {
    // @media all and(display-mode: standalone) {
    const nav = navigator as any;
    // isInWebAppiOS = (window.navigator.standalone === true);
    // isInWebAppChrome = (window.matchMedia('(display-mode: standalone)').matches);
    // if (navigator.standalone) { displayMode = 'standalone-ios';
    // do not think is on IOS (window.matchMedia('(display-mode: minimal-ui)').matches) {

    return (window.matchMedia('(display-mode: standalone)').matches) || nav.standalone;
    // else is 'browser tab'

  }
  //   function scrollToAnchor(aid){
  //     var aTag = $("a[name='"+ aid +"']");
  //     $('html,body').animate({scrollTop: aTag.offset().top},'slow');
  // }

}
