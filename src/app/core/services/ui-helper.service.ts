import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class UiHelperService {

  mobileView: boolean;
  tabletView: boolean;

  constructor() {
    this.mobileView = false;
    this.tabletView = false;
    this.checkView();
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      this.checkView();
    });
  }

  checkView() {
    this.tabletView = window.innerWidth >= 768 && window.innerWidth <= 997;
    this.mobileView = window.innerWidth < 768;
  }

}
